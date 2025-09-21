const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const tableName = process.env.TABLE_NAME;
const maxRequestsPerMonth = process.env.MONTHLY_LIMIT;
const SECRET = process.env.HMAC_SECRET;
const MIN_DWELL_MS = process.env.MIN_DWELL * 1000;
const MAX_DWELL_MS = process.env.MAX_DWELL * 1000;

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

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
	const cookie = cookies[process.env.COOKIE_NAME || "stamp"];
	if (!cookie) return { ok: false, reason: "missing" };

	const [timestampString, signature] = cookie.split(".");
	if (!timestampString || !signature) return { ok: false, reason: "bad-format" };

	const expect = base64url(crypto.createHmac("sha256", SECRET).update(timestampString).digest());
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
			return { isAuthorized: false };
		}

		const { Item } = await dynamo.send(
			new GetCommand({
				TableName: tableName,
				Key: {
					id: 1,
				},
			})
		);

		const currentMonth = new Date().getUTCMonth();

		// If user has exceeded 10 requests this month, deny access
		if (Item?.count >= maxRequestsPerMonth && Item?.month === currentMonth) {
			console.error("Exceeded max requests");
			return { isAuthorized: false };
		}

		return { isAuthorized: true };
	} catch (error) {
		console.error(error);
		return { isAuthorized: false };
	}
};
