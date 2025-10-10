import { randomUUID } from "crypto";
import { gzipSync } from "zlib";
import {
	SQSClient,
	ReceiveMessageCommand,
	DeleteMessageBatchCommand,
	GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import type { ScheduledHandler } from "aws-lambda";
import { AnalyticsChunk, AnalyticsEvent, AnalyticsEventEnriched, FLUSH_INTERVAL_MS } from "@djoz-portfolio/shared";

const SOFT_STOP_MS = 15000; // stop consuming when <15s left
const VIS_TIMEOUT_SEC = 120; // per-batch invisibility window
const LONG_POLL_SEC = 20;
const { QUEUE_URL, BUCKET, FUNCTION_NAME } = process.env;

// Initialize clients once
const sqs = new SQSClient({});
const s3 = new S3Client({});
const lambda = new LambdaClient({});

// Helper to delete messages in batches of 10
async function deleteMessages(receipts: (string | undefined)[]) {
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

/*
	basic check to ensure that event has expected structure:
	Note!: If the schema for events changes, this function should be updated!
*/
function isValidEvent(item: AnalyticsEvent) {
	// Check if input is an object and not null
	if (typeof item !== "object" || item === null) {
		return false;
	}
	// If id exists, it must be a string
	if ("id" in item && typeof item.id !== "string") {
		return false;
	}
	// If sessionId exists, it must be a string
	if ("sessionId" in item && typeof item.sessionId !== "string") {
		return false;
	}
	// Event type is invalid if not a string
	if (typeof item.eventType !== "string") {
		return false;
	}
	// offsetMs is invalid if not a number or out of range (0 to twice the flush interval, to allow for some clock skew and latency)
	if (
		typeof item.offsetMs !== "number" ||
		isNaN(item.offsetMs) ||
		item.offsetMs < 0 ||
		item.offsetMs > FLUSH_INTERVAL_MS * 12
	) {
		return false;
	}

	// Ensure that needed properties are present
	return true;
}

export const handler: ScheduledHandler = async (_event, context) => {
	const events = [] as AnalyticsEventEnriched[];
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

		if (!Messages?.length) {
			console.log("No messages received, stopping consumption");
			break; // Queue is empty
		}

		for (const { ReceiptHandle, Body } of Messages) {
			if (!ReceiptHandle) {
				console.warn("Received message without ReceiptHandle, skipping");
				continue;
			}
			receipts.push(ReceiptHandle);
			if (!Body) {
				console.warn("Received message without Body, skipping");
				continue;
			}

			try {
				let validEvents = [];
				const { events: bodyEvents, ...metadata } = JSON.parse(Body) as AnalyticsChunk;
				if (!Array.isArray(bodyEvents) || !bodyEvents.length) {
					console.warn("No events in message, skipping");
					continue;
				}

				for (const item of bodyEvents) {
					if (isValidEvent(item)) {
						validEvents.push(item);
					} else {
						console.warn("Invalid event structure, skipping!", item);
					}
				}

				// Find the largest offset (in milliseconds) among all valid events.
				const maxOffset = Math.max(...validEvents.map((e) => e.offsetMs ?? 0));
				// Store the batch's original timestamp when the batch was recorded or received.
				const batchTimestampMs = metadata.timestamp;
				for (const item of validEvents) {
					// Reconstruct when each event actually happened relative to the batch timestamp
					const adjustedTimestamp = batchTimestampMs - (maxOffset - (item.offsetMs ?? 0));

					delete item.offsetMs; // No longer needed

					/* 
						Enrich each event with batch-level info (like IP, timestamp, userAgent) and adjusted timestamp.
					*/
					events.push({
						...item,
						...metadata,
						timestamp: adjustedTimestamp,
					});
				}
			} catch {
				// Skip malformed messages
			}
		}
	}

	if (!events.length) {
		return;
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

	console.log(`Processed ${events.length} events from ${receipts.length} messages`);

	// Delete messages after successful upload
	await deleteMessages(receipts);

	// Re-invoke if needed
	const shouldContinue = (await getQueueDepth()) || context.getRemainingTimeInMillis() <= SOFT_STOP_MS;

	if (shouldContinue && FUNCTION_NAME) {
		console.log("Re-invoking for additional processing, events remain in queue or time is short");
		await lambda.send(
			new InvokeCommand({
				FunctionName: FUNCTION_NAME,
				InvocationType: "Event", // fire-and-forget
			})
		);
	}

	console.log(`Wrote ${events.length} events to s3://${BUCKET}/${key}`);

	return;
};
