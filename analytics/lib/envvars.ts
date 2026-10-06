import path from "node:path";

export const dbDirectory = path.join(process.cwd(), ".data/db");
export const dbPath = path.join(dbDirectory, "analytics.duckdb");
export const bucketName = process.env.AWS_S3_BUCKET_NAME || "analytics-dump-djoz-portfolio";
export const awsRegion = process.env.AWS_REGION || "us-east-1";
