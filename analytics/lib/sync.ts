import { type DuckDBConnection, LIST, listValue, VARCHAR } from "@duckdb/node-api";
import { EVENT_COLUMNS, TABLE_NAME, withConnection } from "./db";
import { awsAccessKeyId, awsRegion, awsSecretAccessKey, bucketName } from "./envvars";

// The processor writes each batch once as events/YYYY-MM-DD/part-<uuid>.ndjson.gz and never changes it
const S3_EVENTS_GLOB = `s3://${bucketName}/events/*/*.ndjson.gz`;

const COLUMNS_STRUCT = `{ ${Object.entries(EVENT_COLUMNS)
	.map(([name, type]) => `${name}: '${type}'`)
	.join(", ")} }`;

// Escapes a value for use as a SQL string literal
const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

/*
	Imports every file matching the glob that is not in the table yet.
	The insert is a single statement, so a failed sync imports nothing and the next sync retries the same files.
*/
export const importEventFiles = async (connection: DuckDBConnection, glob: string) => {
	const newFiles = await connection.runAndReadAll(
		`SELECT file FROM glob(${quote(glob)}) WHERE file NOT IN (SELECT DISTINCT filename FROM ${TABLE_NAME})`
	);
	const files = newFiles.getRowObjectsJson().map((row) => String(row.file));
	if (files.length === 0) return { files: 0, rows: 0 };

	// gzip is detected from the .gz extension
	const insert = await connection.run(
		`
			INSERT INTO ${TABLE_NAME} BY NAME
			SELECT *
			FROM read_ndjson($1, columns = ${COLUMNS_STRUCT}, filename = true)
			WHERE schemaVersion = 1
		`,
		[listValue(files)],
		[LIST(VARCHAR)]
	);
	return { files: files.length, rows: insert.rowsChanged };
};

const syncFromS3 = () =>
	withConnection(async (connection) => {
		if (!awsAccessKeyId || !awsSecretAccessKey) {
			throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set in analytics/.env");
		}
		await connection.run("INSTALL httpfs; LOAD httpfs;");
		await connection.run(`
			CREATE OR REPLACE SECRET analytics_s3 (
				TYPE s3,
				KEY_ID ${quote(awsAccessKeyId)},
				SECRET ${quote(awsSecretAccessKey)},
				REGION ${quote(awsRegion)}
			)
		`);
		return importEventFiles(connection, S3_EVENTS_GLOB);
	});

// Only one sync runs at a time, a second request waits for the running one. globalThis survives hot reloads.
const state = globalThis as typeof globalThis & { analyticsSync?: ReturnType<typeof syncFromS3> };

export const syncEvents = () => {
	state.analyticsSync ??= syncFromS3().finally(() => {
		state.analyticsSync = undefined;
	});
	return state.analyticsSync;
};
