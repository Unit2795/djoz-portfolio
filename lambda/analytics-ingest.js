const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

// Cache constants
const QUEUE_URL = process.env.QUEUE_URL;
const SCHEMA_VERSION = 1;
const RESPONSE = { statusCode: 204, body: "" };

// Initialize SQS client once
const sqs = new SQSClient({});

exports.handler = async (event) => {
	// Early return for oversized requests
	const bodyLength = event.body?.length || 0;
	if (bodyLength < 72 || bodyLength > 2000) {
		console.error("Invalid body length:", bodyLength);
		return RESPONSE;
	}

	// Parse and validate events
	let events;
	try {
		events = JSON.parse(event.body).events;
		if (!Array.isArray(events) || !events.length || events.length > 11) {
			console.error(
				Array.isArray(events) ? `Invalid events array length: ${events.length}` : "Events is not an array"
			);
			return RESPONSE;
		}
	} catch {
		console.error("Failed to parse event JSON");
		return RESPONSE;
	}

	// Extract metadata
	const ctx = event.requestContext?.http;
	const headers = event.headers || {};

	await sqs.send(
		new SendMessageCommand({
			QueueUrl: QUEUE_URL,
			MessageBody: JSON.stringify({
				events,
				timestamp: Date.now(),
				schemaVersion: SCHEMA_VERSION,
				userAgent: ctx?.userAgent || headers["user-agent"] || headers["User-Agent"] || null,
				ip: ctx?.sourceIp || null,
				proxiedIp: headers["x-forwarded-for"]?.split(",")[0].trim() || null,
			}),
		})
	);

	return RESPONSE;
};
