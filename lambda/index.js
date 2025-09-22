const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME;
const HONEYPOT_DISABLED = process.env.IS_HONEYPOT_DISABLED === "true";
const MAX_REQUESTS_MONTHLY = process.env.MONTHLY_LIMIT;
const SECRET = process.env.HMAC_SECRET;
const MIN_DWELL_MS = process.env.MIN_DWELL * 1000;
const MAX_DWELL_MS = process.env.MAX_DWELL * 1000;
const COOKIE_NAME = process.env.COOKIE_NAME || "stamp";

const ERROR_RESPONSE = {
	statusCode: 303,
	headers: {
		Location: process.env.ERROR_REDIRECT,
	},
};

const SUCCESS_RESPONSE = {
	statusCode: 303,
	headers: {
		Location: process.env.SUCCESS_REDIRECT,
	},
};

const sesClient = new SESClient({ region: "us-east-1" });
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function base64url(buf) {
	return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function verifyCookie(event) {
	const cookieHeader = event.headers?.cookie || event.headers?.Cookie || "";
	const cookies = Object.fromEntries(
		cookieHeader.split(";").map((c) => {
			const [key, ...v] = c.trim().split("=");
			return [key, decodeURIComponent(v.join("="))];
		})
	);
	const cookie = cookies[COOKIE_NAME];
	if (!cookie) return { ok: false, reason: "missing" };

	const [timestampString, signature] = cookie.split(".");
	if (!timestampString || !signature) return { ok: false, reason: "bad-format" };

	const expect = base64url(createHmac("sha256", SECRET).update(timestampString).digest());
	if (signature !== expect) return { ok: false, reason: "bad-signature" };

	const timestamp = Number(timestampString);
	if (!Number.isFinite(timestamp) || timestamp < 0) return { ok: false, reason: "bad-timestamp" };

	const age = Date.now() - timestamp;
	if (age < Number(MIN_DWELL_MS)) return { ok: false, reason: "too-soon" };
	if (age > Number(MAX_DWELL_MS)) return { ok: false, reason: "too-old" };

	return { ok: true };
}

exports.handler = async (event) => {
	try {
		const cookieCheck = verifyCookie(event);
		if (!cookieCheck.ok) {
			console.error("Cookie check failed:", cookieCheck.reason);
			return ERROR_RESPONSE;
		}

		const { body } = event;

		// Reject if request body is too large
		if (body && body.length > 2000) {
			return ERROR_RESPONSE;
		}

		// Parse form data
		const formData = new URLSearchParams(body);
		const email = formData.get("email");
		const message = formData.get("message");
		// Honeypot fields
		const phone = formData.get("phone");
		const name = formData.get("name");
		const accept = formData.get("accept");

		// If honeypot fields are filled, fail softly and redirect to success page
		if (!HONEYPOT_DISABLED && (phone || name || accept)) {
			return SUCCESS_RESPONSE;
		}

		// Validate inputs
		if (
			!message ||
			message.length < 12 ||
			message.length > 1000 ||
			!email ||
			email.length < 5 ||
			!email.includes("@")
		) {
			return ERROR_RESPONSE;
		}

		const { Item } = await dynamo.send(
			new GetCommand({
				TableName: TABLE_NAME,
				Key: {
					id: 1,
				},
			})
		);
		const currentMonth = new Date().getUTCMonth();
		// If user has exceeded 10 requests this month, deny access
		if (Item?.count >= MAX_REQUESTS_MONTHLY && Item?.month === currentMonth) {
			console.error("Exceeded max requests");
			return ERROR_RESPONSE;
		}
		// Update max requests quota. If month has changed, reset count to 1
		const newCount = Item?.month === currentMonth ? Item.count + 1 : 1;

		const headers = event.headers || {};
		const userAgent =
			event?.requestContext?.http?.userAgent ?? headers["user-agent"] ?? headers["User-Agent"] ?? null;
		const ip = event?.requestContext?.http?.sourceIp ?? null;
		const proxiedIp = headers["x-forwarded-for"] ? headers["x-forwarded-for"].split(",")[0].trim() : null;

		// Create email parameters
		const params = {
			Destination: {
				ToAddresses: [process.env.ADMIN_EMAIL],
			},
			Message: {
				Body: {
					Text: {
						Data: `New Portfolio Contact Form Submission\n\n\nFrom:\n${email}\n\n\nMessage:\n${message}\n\n\nUser Agent:\n${userAgent}\n\n\nIP Address:\n${ip}\n\n\nProxied IP Address:\n${proxiedIp}\n`,
					},
				},
				Subject: {
					Data: "New Portfolio Contact Form Submission",
				},
			},
			Source: process.env.ADMIN_EMAIL, // Must be verified in SES
		};

		// Send email using SES
		await sesClient.send(new SendEmailCommand(params));

		await dynamo.send(
			new UpdateCommand({
				TableName: TABLE_NAME,
				Key: {
					id: 1,
				},
				UpdateExpression: `SET #month = :currentMonth, #count = :newCount`,
				ExpressionAttributeValues: {
					":currentMonth": currentMonth,
					":newCount": newCount,
				},
				ExpressionAttributeNames: {
					"#count": "count",
					"#month": "month",
				},
			})
		);

		return SUCCESS_RESPONSE;
	} catch (error) {
		console.error("Error:", error);

		return ERROR_RESPONSE;
	}
};
