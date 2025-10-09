const { createHmac } = require("crypto");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

// Cache environment variables
const TABLE_NAME = process.env.TABLE_NAME;
const HONEYPOT_DISABLED = process.env.IS_HONEYPOT_DISABLED === "true";
const MAX_REQUESTS_MONTHLY = Number(process.env.MONTHLY_LIMIT);
const SECRET = process.env.HMAC_SECRET;
const MIN_DWELL_MS = process.env.MIN_DWELL * 1000;
const MAX_DWELL_MS = process.env.MAX_DWELL * 1000;
const COOKIE_NAME = process.env.COOKIE_NAME || "stamp";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const COOKIE_GENERAL_ERROR = process.env.GENERAL_COOKIE_ERROR;
const COOKIE_TOO_SOON_ERROR = process.env.TOO_SOON_ERROR;
const COOKIE_TOO_OLD_ERROR = process.env.TOO_OLD_ERROR;
const EMAIL_INVALID_ERROR = process.env.EMAIL_INVALID_ERROR;
const MESSAGE_INVALID_ERROR = process.env.MESSAGE_INVALID_ERROR;
const DWELLTIME_DISABLED = process.env.DISABLE_DWELLTIME === "true";

// Pre-computed static responses
const ERROR_RESPONSE = {
	statusCode: 303,
	headers: { Location: process.env.ERROR_REDIRECT },
};
const SUCCESS_RESPONSE = {
	statusCode: 303,
	headers: { Location: process.env.SUCCESS_REDIRECT },
};

// Initialize AWS clients once
const sesClient = new SESClient({ region: "us-east-1" });
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function verifyCookie(cookies) {
	let cookieString;
	try {
		cookieString = cookies.find((s) => s.startsWith(`${COOKIE_NAME}=`));
		if (!cookieString) return { ok: false, reason: "missing" };
	} catch {
		return { ok: false, reason: "missing" };
	}

	let timestampString, signature;
	try {
		[timestampString, signature] = cookieString.split("=")[1].split(".");
	} catch (e) {
		return { ok: false, reason: "bad-format" };
	}

	if (!timestampString || !signature) return { ok: false, reason: "bad-format" };

	let expected;
	try {
		expected = createHmac("sha256", SECRET).update(timestampString).digest("base64url");
	} catch (e) {
		return { ok: false, reason: "hmac-fail" };
	}

	if (signature !== expected) return { ok: false, reason: "bad-signature" };

	const timestamp = Number(timestampString);
	if (timestamp < 0) return { ok: false, reason: "bad-timestamp" };

	const age = Date.now() - timestamp;
	if (age < MIN_DWELL_MS) return { ok: false, reason: "too-soon" };
	if (age > MAX_DWELL_MS) return { ok: false, reason: "too-old" };

	return { ok: true };
}

function respond(isJson, statusCode, message) {
	if (isJson) {
		return {
			statusCode: statusCode,
			headers: { "Content-Type": "application/json" },
			body: message ? JSON.stringify({ message }) : undefined,
		};
	} else {
		return statusCode === 200 ? SUCCESS_RESPONSE : ERROR_RESPONSE;
	}
}

exports.handler = async (event) => {
	const contentType = event.headers["content-type"] || event.headers["Content-Type"];
	const isJson = contentType?.includes("application/json");
	try {
		if (!DWELLTIME_DISABLED) {
			const { cookies } = event;
			const cookieCheck = verifyCookie(cookies);
			if (!cookieCheck.ok) {
				console.error("Cookie check failed:", cookieCheck.reason);
				let errorMessage = COOKIE_GENERAL_ERROR;
				if (cookieCheck.reason === "too-soon") {
					errorMessage = COOKIE_TOO_SOON_ERROR;
				} else if (cookieCheck.reason === "too-old") {
					errorMessage = COOKIE_TOO_OLD_ERROR;
				}
				return respond(isJson, 400, errorMessage);
			}
		}

		const { body } = event;

		// Early return for oversized requests
		if (body?.length > 2000) {
			console.error("Request body too large");
			return respond(isJson, 413);
		}

		const data = event.isBase64Encoded ? Buffer.from(body, "base64").toString("utf8") : body;
		let email, message, name, phone, accept;
		if (isJson) {
			const parsed = JSON.parse(data);
			email = parsed.email;
			message = parsed.message;
			name = parsed.name;
			phone = parsed.phone;
			accept = parsed.accept;
		} else {
			const formData = new URLSearchParams(data);
			email = formData.get("email");
			message = formData.get("message");
			name = formData.get("name");
			phone = formData.get("phone");
			accept = formData.get("accept");
		}

		// Honeypot check (fail silently)
		if (!HONEYPOT_DISABLED && (phone || name || accept)) {
			console.error("Honeypot triggered");
			return respond(isJson, 200);
		}

		const emailValid = email && email.length >= 5 && email.includes("@");
		const messageValid = message && message.length >= 12 && message.length <= 1000;
		// Validate inputs
		if (!emailValid || !messageValid) {
			console.error("Invalid input");
			const errorMessage = !emailValid ? EMAIL_INVALID_ERROR : MESSAGE_INVALID_ERROR;
			return respond(isJson, 400, errorMessage);
		}

		// Check rate limit
		const { Item } = await dynamo.send(
			new GetCommand({
				TableName: TABLE_NAME,
				Key: { id: 1 },
			})
		);

		const currentMonth = new Date().getUTCMonth();
		// If user has exceeded N requests this month, deny access
		if (Item?.count >= MAX_REQUESTS_MONTHLY && Item?.month === currentMonth) {
			console.error("Exceeded max requests");
			return respond(isJson, 429);
		}

		// Extract request metadata
		const ctx = event.requestContext?.http;
		const headers = event.headers || {};
		const userAgent = ctx?.userAgent || headers["user-agent"] || headers["User-Agent"] || null;
		const ip = ctx?.sourceIp || null;
		const proxiedIp = headers["x-forwarded-for"]?.split(",")[0].trim() || null;

		// Send email
		await sesClient.send(
			new SendEmailCommand({
				Destination: { ToAddresses: [ADMIN_EMAIL] },
				Message: {
					Body: {
						Text: {
							Data: `New Portfolio Contact Form Submission\n\n\nFrom:\n${email}\n\n\nMessage:\n${message}\n\n\nUser Agent:\n${userAgent}\n\n\nIP Address:\n${ip}\n\n\nProxied IP Address:\n${proxiedIp}\n`,
						},
					},
					Subject: { Data: "New Portfolio Contact Form Submission" },
				},
				Source: ADMIN_EMAIL,
			})
		);

		// Update rate limit counter
		await dynamo.send(
			new UpdateCommand({
				TableName: TABLE_NAME,
				Key: { id: 1 },
				UpdateExpression: "SET #month = :currentMonth, #count = :newCount",
				ExpressionAttributeValues: {
					":currentMonth": currentMonth,
					// Update max requests quota. If month has changed, reset count to 1
					":newCount": Item?.month === currentMonth ? Item.count + 1 : 1,
				},
				ExpressionAttributeNames: {
					"#count": "count",
					"#month": "month",
				},
			})
		);

		return respond(isJson, 200);
	} catch (error) {
		const isJson = contentType?.includes("application/json");
		console.error("Error:", error);
		return respond(isJson, 500);
	}
};
