const { randomUUID } = require("crypto");
const { gzipSync } = require("zlib");
const {
	SQSClient,
	ReceiveMessageCommand,
	DeleteMessageBatchCommand,
	GetQueueAttributesCommand,
} = require("@aws-sdk/client-sqs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const SOFT_STOP_MS = 15000; // stop consuming when <15s left
const VIS_TIMEOUT_SEC = 120; // per-batch invisibility window
const LONG_POLL_SEC = 20;
const { QUEUE_URL, BUCKET, FUNCTION_NAME } = process.env;

// Initialize clients once
const sqs = new SQSClient({});
const s3 = new S3Client({});
const lambda = new LambdaClient({});

// Helper to delete messages in batches of 10
async function deleteMessages(receipts) {
	for (let i = 0; i < receipts.length; i += 10) {
		const Entries = receipts.slice(i, i + 10).map((ReceiptHandle, j) => ({
			Id: String(i + j),
			ReceiptHandle,
		}));

		const { Failed } = await sqs.send(new DeleteMessageBatchCommand({ QueueUrl: QUEUE_URL, Entries }));

		if (Failed?.length) {
			console.warn("DeleteMessageBatch partial failures:", Failed);
		}
	}
}

// Check queue depth for re-invocation decision
async function getQueueDepth() {
	const { Attributes } = await sqs.send(
		new GetQueueAttributesCommand({
			QueueUrl: QUEUE_URL,
			AttributeNames: ["ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible"],
		})
	);
	return (
		Number(Attributes?.ApproximateNumberOfMessages || 0) +
			Number(Attributes?.ApproximateNumberOfMessagesNotVisible || 0) >
		0
	);
}

// Validate event structure
function isValidEvent(item) {
	return (
		item &&
		typeof item === "object" &&
		item.e &&
		typeof item.e === "string" &&
		item.e.length <= 24 &&
		(!item.m || (typeof item.m === "string" && item.m.length <= 256)) &&
		item.u &&
		typeof item.u === "string" &&
		item.u.length === 36 &&
		item.s &&
		typeof item.s === "string" &&
		item.s.length === 36
	);
}

exports.handler = async (event, context) => {
	const events = [];
	const receipts = [];

	// Consume messages until timeout or empty queue
	while (context.getRemainingTimeInMillis() > SOFT_STOP_MS) {
		const { Messages } = await sqs.send(
			new ReceiveMessageCommand({
				QueueUrl: QUEUE_URL,
				MaxNumberOfMessages: 10,
				VisibilityTimeout: VIS_TIMEOUT_SEC,
				WaitTimeSeconds: LONG_POLL_SEC,
			})
		);

		if (!Messages?.length) break;

		for (const { ReceiptHandle, Body } of Messages) {
			receipts.push(ReceiptHandle);
			try {
				const { events: bodyEvents, ...metadata } = JSON.parse(Body);
				if (!Array.isArray(bodyEvents)) continue;

				for (const item of bodyEvents) {
					if (isValidEvent(item)) {
						events.push({ ...item, ...metadata });
					}
				}
			} catch {
				// Skip malformed messages
			}
		}
	}

	if (!events.length) {
		return { statusCode: 204, body: "no messages" };
	}

	// Write to S3
	const ndjson = events.map((e) => JSON.stringify(e)).join("\n");
	const gz = gzipSync(Buffer.from(ndjson, "utf8"));

	const now = new Date();
	const dt = now.toISOString().slice(0, 10); // YYYY-MM-DD format
	const key = `events/${dt}/part-${randomUUID()}.ndjson.gz`;

	await s3.send(
		new PutObjectCommand({
			Bucket: BUCKET,
			Key: key,
			Body: gz,
			ContentType: "application/x-ndjson",
			ContentEncoding: "gzip",
		})
	);

	// Delete messages after successful upload
	await deleteMessages(receipts);

	// Re-invoke if needed
	const shouldContinue = (await getQueueDepth()) || context.getRemainingTimeInMillis() <= SOFT_STOP_MS;

	if (shouldContinue && FUNCTION_NAME) {
		await lambda.send(
			new InvokeCommand({
				FunctionName: FUNCTION_NAME,
				InvocationType: "Event", // fire-and-forget
			})
		);
	}

	return {
		statusCode: 200,
		body: `wrote ${events.length} events to s3://${BUCKET}/${key}`,
	};
};
