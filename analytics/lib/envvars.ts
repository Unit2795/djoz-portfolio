import path from "node:path";

export const NDJSON_GLOB = "./.data/tmp/*-parsed.ndjson";
export const dayTrackerFile = path.join(process.cwd(), ".data/days/days.json");
export const tmpDirectory = path.join(process.cwd(), ".data/tmp");
export const dbDirectory = path.join(process.cwd(), ".data/db");
export const dbFileName = "analytics.duckdb";
export const dbPath = path.join(dbDirectory, dbFileName);
export const bucketName = process.env.AWS_S3_BUCKET_NAME || "analytics-dump-djoz-portfolio";
export const bucketPathPrefix = process.env.AWS_S3_BUCKET_PATH_PREFIX;
export const concurrency = Number(process.env.CONCURRENCY) || 6;
export const awsRegion = process.env.AWS_REGION || "us-east-1";
