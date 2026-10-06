import { mkdir } from "node:fs/promises";
import { type DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import { dbDirectory, dbPath } from "./envvars";

export const TABLE_NAME = "events_v1";

/*
	Columns stored for each event, also used as the read_ndjson schema.
	Typing the columns explicitly (instead of inferring from the files) tolerates missing or extra fields in events.
*/
export const EVENT_COLUMNS = {
	eventType: "TEXT",
	id: "TEXT",
	sessionId: "TEXT",
	userAgent: "TEXT",
	ip: "TEXT",
	timestamp: "BIGINT",
	schemaVersion: "INTEGER",
};

/*
	⚠️NOTE: When a new schema version is released, we can add a new table (e.g. events_v2) and adjust the sync accordingly.

	filename is the source file of each row, the sync uses it to only import files it has not seen yet.
*/
const TABLE_SCHEMA = `
	CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
		eventType TEXT NOT NULL,
		id TEXT,
		sessionId TEXT,
		userAgent TEXT,
		ip TEXT,
		timestamp BIGINT NOT NULL,
		schemaVersion INTEGER NOT NULL,
		filename TEXT NOT NULL
	)
`;

// Replaces the table with an empty one, for a rebuild that imports every event file again
export const recreateTable = (connection: DuckDBConnection) =>
	connection.run(`DROP TABLE IF EXISTS ${TABLE_NAME}; ${TABLE_SCHEMA}`);

/*
	fromCache returns the same instance for the same path, which prevents file lock errors on hot reload.
	The table is created once here so concurrent requests don't race to create it.
*/
let instance: Promise<DuckDBInstance> | undefined;
const getInstance = () => {
	instance ??= openInstance().catch((error) => {
		instance = undefined;
		throw error;
	});
	return instance;
};

const openInstance = async () => {
	await mkdir(dbDirectory, { recursive: true });
	const db = await DuckDBInstance.fromCache(dbPath);
	const connection = await db.connect();
	try {
		await connection.run(TABLE_SCHEMA);
	} finally {
		connection.closeSync();
	}
	return db;
};

// Runs a callback with a fresh connection that is always closed afterwards
export const withConnection = async <T>(callback: (connection: DuckDBConnection) => Promise<T>) => {
	const connection = await (await getInstance()).connect();
	try {
		return await callback(connection);
	} finally {
		connection.closeSync();
	}
};
