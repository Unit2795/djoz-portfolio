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
import { AnalyticsChunk, AnalyticsEvent, AnalyticsEventEnriched, EVENTS_S3_PREFIX } from "@djoz-portfolio/shared";

const SOFT_STOP_MS = 15000; // stop consuming when <15s left
const VIS_BUFFER_SEC = 60; // keep received messages hidden this long past the end of the invocation
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

	// Ensure that needed properties are present
	return true;
}

/*
	When the event happened: the batch's receive time minus the event's age (ms between the event and the client sending its batch).
	A missing or invalid age counts as 0, so the event gets the receive time instead of being dropped.
	So does an age that would put the event before 1970, since a huge age makes an invalid date that fails the whole run.
*/
function getEventTimestamp({ ageMs }: AnalyticsEvent, receivedAt: number) {
	const validAge = typeof ageMs === "number" && Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= receivedAt;
	return receivedAt - (validAge ? ageMs : 0);
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
				// Messages are only deleted after the S3 upload at the end of the run,
				// so they must stay hidden until this invocation is over or they will be received again
				VisibilityTimeout: Math.ceil(context.getRemainingTimeInMillis() / 1000) + VIS_BUFFER_SEC,
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
				const { events: bodyEvents, ...metadata } = JSON.parse(Body) as AnalyticsChunk;
				if (!Array.isArray(bodyEvents) || !bodyEvents.length) {
					console.warn("No events in message, skipping");
					continue;
				}

				for (const item of bodyEvents) {
					if (!isValidEvent(item)) {
						console.warn("Invalid event structure, skipping!", item);
						continue;
					}

					/*
						Enrich each event with batch-level info (like IP, userAgent).
						Its timestamp is the batch's receive time minus the event's age.
						Only known fields are kept, anything else a client sends (including ageMs) is dropped.
					*/
					const { eventType, id, sessionId } = item;
					events.push({
						eventType,
						id,
						sessionId,
						...metadata,
						timestamp: getEventTimestamp(item, metadata.timestamp),
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

	// Group events by the UTC date they happened, so each lands in its own day's folder
	const eventsByDate = new Map<string, AnalyticsEventEnriched[]>();
	for (const e of events) {
		const dt = new Date(e.timestamp).toISOString().slice(0, 10); // YYYY-MM-DD format
		const dateEvents = eventsByDate.get(dt) ?? [];
		dateEvents.push(e);
		eventsByDate.set(dt, dateEvents);
	}

	// Write one file per date to S3
	const keys = [];
	for (const [dt, dateEvents] of eventsByDate) {
		const ndjson = dateEvents.map((e) => JSON.stringify(e)).join("\n");
		const gz = gzipSync(Buffer.from(ndjson, "utf8"));
		const key = `${EVENTS_S3_PREFIX}/${dt}/part-${randomUUID()}.ndjson.gz`;

		await s3.send(
			new PutObjectCommand({
				Bucket: BUCKET,
				Key: key,
				Body: gz,
				ContentType: "application/x-ndjson",
				ContentEncoding: "gzip",
			})
		);
		keys.push(key);
	}

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

	console.log(`Wrote ${events.length} events to ${keys.map((key) => `s3://${BUCKET}/${key}`).join(", ")}`);

	return;
};
