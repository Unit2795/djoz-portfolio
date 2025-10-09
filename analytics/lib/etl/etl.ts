import "dotenv/config";
import { S3Client, paginateListObjectsV2, GetObjectCommand } from "@aws-sdk/client-s3";
import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { mkdir, rm, stat } from "node:fs/promises";
import { createWriteStream, createReadStream } from "node:fs";
import path from "node:path";
import { DuckDBConnection } from "@duckdb/node-api";
import { awsRegion, dayTrackerFile, NDJSON_GLOB } from "@/lib/envvars";
import { getDb } from "@/lib/db";
import { Readable } from "node:stream";
import { createInterface } from "node:readline";
import DateRangeManager from "./dateCheck";

interface ImportNdjsonOptions {
	bucket: string;
	// optional prefix within the bucket where the directories/files are located
	bucketPathPrefix?: string;
	// Defaults to us-east-1
	awsRegion?: string;
	// YYYY-MM-DD
	startDate: string;
	// YYYY-MM-DD
	endDate: string;
	/* 
		Number of concurrent file read/processing operations to perform.
		Defaults to 6
	*/
	concurrency: number;
	// Local directory where temporary incoming ndjson files will be stored
	tmpDir: string;
	// If true, the duckdb tables will be destroyed and fresh NDJSON will be fetched
	force: boolean;
}

const TABLE_NAME = "logs_v1";
const TABLE_SCHEMA = `
	CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
		e TEXT NOT NULL,
		m TEXT,
		s TEXT,
		userAgent TEXT,
		ip TEXT,
		timestamp BIGINT NOT NULL,
		schemaVersion INTEGER NOT NULL
	)
`;

const db = await getDb();

export const importNdjson = async (options: ImportNdjsonOptions) => {
	if (!options.bucket) {
		throw new Error("Bucket is required");
	}
	if (!options.startDate || !options.endDate) {
		throw new Error("Start date and end date are required");
	}

	const { tmpDir, startDate, endDate, concurrency, bucket, bucketPathPrefix, force } = options;

	// Ensure that directories that need to be in place are created
	await mkdir(tmpDir, { recursive: true });
	await mkdir(path.dirname(dayTrackerFile), { recursive: true });

	const s3 = new S3Client({ region: awsRegion });
	const dbConnection = await db.connect();

	if (force) {
		console.log("Force mode: clearing existing data...");
		await dbConnection.run(`DROP TABLE IF EXISTS ${TABLE_NAME};`);
		await rm(dayTrackerFile, { force: true });
	}

	// Ensure the table exists
	dbConnection.run(TABLE_SCHEMA);

	try {
		console.log(`Processing date range ${startDate} to ${endDate}`);

		const dateCheck = new DateRangeManager(dayTrackerFile);
		/* 
			If force is specified, we re-process all days in the range regardless of existing data
			Otherwise, we check the existing data and only process missing days
		*/
		const { days } = await dateCheck.processRange([startDate, endDate]);
		if (days.length === 0 && !force) {
			console.log("No new days to process, exiting.");
			return;
		}
		console.log(`Date range processed. Days to process: ${days.length}`);

		// Process N days at a time
		for (let i = 0; i < days.length; i += concurrency) {
			const chunk = days.slice(i, i + concurrency);
			await Promise.all(
				chunk.map((day) => processDay({ day, s3, bucket, bucketPathPrefix, tmpDir, dbConnection }))
			);
		}
	} finally {
		await rm(tmpDir, { recursive: true });
		db.disconnect();
	}
};

const processDay = async (args: {
	day: string;
	s3: S3Client;
	bucket: string;
	bucketPathPrefix?: string;
	tmpDir: string;
	dbConnection: DuckDBConnection;
}) => {
	const { day, s3, bucket, bucketPathPrefix, tmpDir, dbConnection } = args;
	const s3Path = bucketPathPrefix ? `${bucketPathPrefix}/${day}` : day;

	const objects = await getS3Files(s3, bucket, s3Path);
	// Filter to only .ndjson.gz files
	const ndjsonFiles = objects.filter((k) => k.endsWith(".ndjson.gz"));

	if (ndjsonFiles.length === 0) {
		console.log(`[skip] ${day} → (no files found in s3://${bucket}/${s3Path})`);
		return;
	}
	console.log(`[info] ${day}: ${ndjsonFiles.length} ndjson.gz files found`);

	const jsonFile = path.join(tmpDir, `${day}.ndjson`);
	const outputStream = createWriteStream(jsonFile, { flags: "a" });

	let firstFile = true;
	for (const key of ndjsonFiles) {
		const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
		if (!Body) {
			console.warn(`  [!] skipping ${key}, no body`);
			continue;
		}

		// newline boundary if file already has content, critical for valid NDJSON!
		if (!firstFile) outputStream.write("\n");
		firstFile = false;

		await pipeline(Body as Readable, createGunzip(), outputStream, { end: false });
		console.log(`  [+] merged ${key}`);
	}

	// Flush all S3 data to disk and close the stream
	await new Promise((resolve) => outputStream.end(resolve));

	/* 
		Now that we have a complete NDJSON file for the day. 
		
		We can process it to perform any necessary transformations/enrichments before loading into DuckDB.
	*/
	const transformedFile = path.join(tmpDir, `${day}-transformed.ndjson`);
	const transformedStream = createWriteStream(transformedFile, { flags: "a" });
	const lineReader = createInterface({
		input: createReadStream(jsonFile),
		crlfDelay: Infinity, // recognize all instances of CR LF ('\r\n') in input as a single line break
	});

	for await (const line of lineReader) {
		if (!line.trim()) continue; // skip empty lines
		try {
			const obj = JSON.parse(line);
			/* 
				We convert the timestamp (Unix time in seconds) to milliseconds here, as it's easier to do it once on import rather than in every query.
			*/
			if (obj.timestamp) {
				obj.timestamp = obj.timestamp * 1000;
			}

			// Write the enriched object to the new NDJSON file
			transformedStream.write(JSON.stringify(obj) + "\n");
		} catch (err) {
			console.error("Failed to parse line:", err);
		}
	}

	// Flush all parsed data to disk and close the stream
	await new Promise((resolve) => transformedStream.end(resolve));

	console.log(`[info] ${day}: processing into duckdb...`);

	try {
		/* 
			⚠️NOTE: We create the table if it doesn't exist, otherwise we append to it.

			When a new schema version is released, we can add a new table (e.g. logs_v2) and adjust the import process accordingly.

			Note that we strongly type the table instead of inferring from the NDJSON file to prevent issues with possible missing fields in some events.
		*/
		await dbConnection.run(`
			INSERT INTO ${TABLE_NAME}
			SELECT *
			FROM read_ndjson('${transformedFile}', columns = {
				e: 'TEXT',
				m: 'TEXT',
				s: 'TEXT',
				userAgent: 'TEXT',
				ip: 'TEXT',
				timestamp: 'BIGINT',
				schemaVersion: 'INTEGER'
			})
			WHERE schemaVersion = 1;
		`);
	} catch (error) {
		console.error(`  [!] error processing ${day}:`, error);
		return;
	}
};

const getS3Files = async (s3: S3Client, bucket: string, path: string) => {
	const keys = [];
	const paginator = paginateListObjectsV2({ client: s3 }, { Bucket: bucket, Prefix: path, MaxKeys: 1000 });
	// Iterate through each page of results
	for await (const page of paginator) {
		// For each object in the page, add its key to the keys array
		for (const obj of page.Contents ?? []) {
			if (obj.Key) keys.push(obj.Key);
		}
	}
	return keys;
};

const fileNonEmpty = async (path: string) => {
	try {
		const stats = await stat(path);
		return stats.size > 0;
	} catch {
		return false;
	}
};
