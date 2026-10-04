import path from "node:path";

export const dbDirectory = path.join(process.cwd(), ".data/db");
export const dbPath = path.join(dbDirectory, "analytics.duckdb");
export const bucketName = process.env.AWS_S3_BUCKET_NAME || "analytics-dump-djoz-portfolio";
export const awsRegion = process.env.AWS_REGION || "us-east-1";
export const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
export const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
