const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const schemaVersion = 1;
const RESPONSE = { statusCode: 204, body: "" };

const sqs = new SQSClient({});
const { QUEUE_URL } = process.env;

exports.handler = async (event) => {
	if (event.body.length > 2000 || event.body.length < 72) {
		console.error("Invalid body length, detected: ", event.body.length);
		return RESPONSE;
	}

	let events;
	try {
		events = JSON.parse(event.body).events;
	} catch {
		console.error("Failed to parse event JSON");
		return { statusCode: 204, body: "" };
	}

	// Must be an array with 1-10 events (client should not be sending more than 11 at a time)
	// NOTE: More advanced validation is done in the processor lambda
	if (!Array.isArray(events) || events.length === 0 || events.length > 11) {
		if (Array.isArray(events)) {
			console.error("Invalid events array, detected length: ", events.length);
		} else {
			console.error("Events is not an array");
		}

		return RESPONSE;
	}

	const timestamp = Date.now();
	const headers = event.headers || {};
	const userAgent = event?.requestContext?.http?.userAgent ?? headers["user-agent"] ?? headers["User-Agent"] ?? null;
	const ip = event?.requestContext?.http?.sourceIp ?? null;
	const proxiedIp = headers["x-forwarded-for"] ? headers["x-forwarded-for"].split(",")[0].trim() : null;

	const message = {
		QueueUrl: QUEUE_URL,
		MessageBody: JSON.stringify({
			events,
			timestamp,
			schemaVersion,
			userAgent,
			ip,
			proxiedIp,
		}),
	};
	await sqs.send(new SendMessageCommand(message));

	return RESPONSE;
};
