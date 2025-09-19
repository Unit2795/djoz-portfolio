const { SQSClient, SendMessageBatchCommand } = require("@aws-sdk/client-sqs");

const schemaVersion = 1;
const RESPONSE = { statusCode: 204, body: "" };

const sqs = new SQSClient({});
const { QUEUE_URL } = process.env;

function chunk(arr, maxPerChunk) {
	const out = [];
	for (let i = 0; i < arr.length; i += maxPerChunk) out.push(arr.slice(i, i + maxPerChunk));
	return out;
}

exports.handler = async (event) => {
	// If body is larger than 64KB or less than 72 bytes, ignore it
	if (event.body.length > 64000 || event.body.length < 72) {
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

	// Must be an array with 1-400 events
	// NOTE: More advanced validation is done in the processor lambda
	if (!Array.isArray(events) || events.length === 0 || events.length > 400) {
		if (Array.isArray(events)) {
			console.error("Invalid events array, detected length: ", events.length);
		} else {
			console.error("Events is not an array");
		}

		return RESPONSE;
	}

	const now = Date.now();

	const batches = chunk(events, 50);
	for (const [index, arr] of batches.entries()) {
		const entry = {
			Id: String(index),
			MessageBody: JSON.stringify({
				events: arr,
				timestamp: now,
				schemaVersion,
			}),
		};
		await sqs.send(new SendMessageBatchCommand({ QueueUrl: QUEUE_URL, Entries: [entry] }));
	}

	return RESPONSE;
};
