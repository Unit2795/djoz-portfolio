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

const sqs = new SQSClient({});
const s3 = new S3Client({});
const lambda = new LambdaClient({});

const { QUEUE_URL, BUCKET, FUNCTION_NAME } = process.env;

// delete in chunks of 10
async function deleteAll(QueueUrl, receipts) {
	for (let i = 0; i < receipts.length; i += 10) {
		const Entries = receipts.slice(i, i + 10).map((r) => ({ Id: i, ReceiptHandle: r }));
		await sqs.send(new DeleteMessageBatchCommand({ QueueUrl, Entries }));
	}
}

async function getApproxQueueDepth(QueueUrl) {
	const resp = await sqs.send(
		new GetQueueAttributesCommand({
			QueueUrl,
			AttributeNames: ["ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible"],
		})
	);
	const visible = Number(resp.Attributes?.ApproximateNumberOfMessages || 0);
	const inflight = Number(resp.Attributes?.ApproximateNumberOfMessagesNotVisible || 0);
	return { visible, inflight, total: visible + inflight };
}

exports.handler = async (event, context) => {
	const events = [];
	const receipts = [];

	// Consume until time is nearly up or no messages
	while (context.getRemainingTimeInMillis() > SOFT_STOP_MS) {
		const resp = await sqs.send(
			new ReceiveMessageCommand({
				QueueUrl: QUEUE_URL,
				MaxNumberOfMessages: 10,
				VisibilityTimeout: VIS_TIMEOUT_SEC,
				WaitTimeSeconds: LONG_POLL_SEC,
			})
		);

		const msgs = resp.Messages || [];
		if (msgs.length === 0) break;

		for (const m of msgs) {
			receipts.push(m.ReceiptHandle);
			try {
				const body = JSON.parse(m.Body);
				const { events, schemaVersion, timestamp, userAgent, ip, proxiedIp } = body;
				if (!Array.isArray(body.events) || body.events.length === 0) {
					// skip invalid messages
					continue;
				}

				for (const item of events) {
					// Invalid event structure
					if (typeof item !== "object" || item === null) {
						console.log("Invalid event structure");
						continue;
					}
					const { e, m, u, s } = item;
					// Invalid event type
					if (!e || typeof e !== "string" || e.length > 24) {
						console.log("Invalid event type");
						continue;
					}
					// Invalid metadata
					if (m && (typeof m !== "string" || m.length > 50)) {
						console.log("Invalid metadata");
						continue;
					}
					// Invalid user identifier
					if (!u || typeof u !== "string" || u.length !== 36) {
						console.log("Invalid user identifier");
						continue;
					}
					// Invalid session identifier
					if (!s || typeof s !== "string" || s.length !== 36) {
						console.log("Invalid session identifier");
						continue;
					}

					events.push({
						...item,
						schemaVersion,
						timestamp,
						userAgent,
						ip,
						proxiedIp,
					});
				}
			} catch {
				/* ignore malformed */
			}
		}
	}

	if (events.length === 0) {
		return { statusCode: 204, body: "no messages" };
	}

	// Write event data to S3
	const ndjson = events.map((e) => JSON.stringify(e)).join("\n");
	const gz = gzipSync(Buffer.from(ndjson, "utf8"));
	const now = new Date();
	const pad = (n) => String(n).padStart(2, "0");
	const dt = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
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

	// Delete SQS messages ONLY after successful upload
	await deleteAll(QUEUE_URL, receipts);

	// If there’s more work OR we had to stop early, re-invoke self
	const { total } = await getApproxQueueDepth(QUEUE_URL);
	const shouldContinue = total > 0 || context.getRemainingTimeInMillis() <= SOFT_STOP_MS;

	if (shouldContinue && FUNCTION_NAME) {
		await lambda.send(
			new InvokeCommand({
				FunctionName: FUNCTION_NAME,
				InvocationType: "Event", // fire-and-forget
			})
		);
	}

	return { statusCode: 200, body: `wrote ${events.length} events to s3://${BUCKET}/${key}` };
};
