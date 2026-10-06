import { EVENTS_S3_PREFIX } from "@djoz-portfolio/shared";
import { type DuckDBConnection, LIST, listValue, VARCHAR } from "@duckdb/node-api";
import { EVENT_COLUMNS, recreateTable, TABLE_NAME, withConnection } from "./db";
import { awsRegion, bucketName } from "./envvars";

// The processor writes each batch once as <EVENTS_S3_PREFIX>/YYYY-MM-DD/part-<uuid>.ndjson.gz and never changes it
const S3_EVENTS_GLOB = `s3://${bucketName}/${EVENTS_S3_PREFIX}/*/*.ndjson.gz`;

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

/*
	A rebuild empties the table first, so every event file is downloaded and imported again.
	If its import fails, the table stays empty and the next sync imports everything.
*/
const syncFromS3 = (rebuild: boolean) =>
	withConnection(async (connection) => {
		await connection.run("INSTALL httpfs; LOAD httpfs; INSTALL aws; LOAD aws;");
		// Finds credentials like the AWS CLI does: keys in analytics/.env, AWS_PROFILE, SSO or ~/.aws/credentials
		await connection
			.run(`CREATE OR REPLACE SECRET analytics_s3 (TYPE s3, PROVIDER credential_chain, REGION ${quote(awsRegion)})`)
			.catch((error) => {
				throw new Error(
					`No AWS credentials found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in analytics/.env, or use an AWS CLI profile (AWS_PROFILE). ${error.message}`
				);
			});
		if (rebuild) await recreateTable(connection);
		return importEventFiles(connection, S3_EVENTS_GLOB);
	});

/*
	Only one sync or rebuild runs at a time, a second request waits for the running one and gets its result.
	globalThis survives hot reloads.
*/
const state = globalThis as typeof globalThis & { analyticsSync?: ReturnType<typeof syncFromS3> };

export const syncEvents = (rebuild = false) => {
	state.analyticsSync ??= syncFromS3(rebuild).finally(() => {
		state.analyticsSync = undefined;
	});
	return state.analyticsSync;
};
