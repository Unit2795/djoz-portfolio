import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import { dbPath, dbDirectory } from "./envvars";
import { mkdir } from "node:fs/promises";
import { fileExists } from "./files";

// Singleton DuckDBInstance (per process)
let _db: DuckDBInstance | null = null;
export async function getDb() {
	if (!_db) {
		if (!(await fileExists(dbDirectory))) {
			console.log("Creating directory for duckdb at", dbDirectory);
			await mkdir(dbDirectory, { recursive: true });
		}
		_db = await DuckDBInstance.fromCache(dbPath);
	}

	let conn: DuckDBConnection | null = null;
	return {
		db: _db,
		connect: async () => {
			if (conn) {
				console.error("Connection already established");
				return conn;
			}
			if (!_db) throw new Error("DuckDB instance not initialized");
			conn = await _db.connect();
			return conn;
		},
		disconnect: () => {
			conn?.disconnectSync();
			conn = null;
		},
	};
}
