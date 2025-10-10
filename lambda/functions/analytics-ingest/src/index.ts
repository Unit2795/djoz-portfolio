import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { AnalyticsChunk } from "@djoz-portfolio/shared";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";

// Cache constants
const QUEUE_URL = process.env.QUEUE_URL;
const SCHEMA_VERSION = 1;
const RESPONSE = { statusCode: 204, body: "" };

// Initialize SQS client once
const sqs = new SQSClient({});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
	// Early return for under/oversized requests
	const bodyLength = event.body?.length || 0;
	if (!event.body || bodyLength < 6 || bodyLength > 4000) {
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
				ip: ctx?.sourceIp || headers["x-forwarded-for"]?.split(",")[0].trim() || null,
			} as AnalyticsChunk),
		})
	);

	return RESPONSE;
};
