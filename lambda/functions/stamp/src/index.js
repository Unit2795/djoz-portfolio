const { createHmac } = require("crypto");

// Cache environment variables
const SECRET = process.env.HMAC_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME || "stamp";
const MAX_AGE = process.env.COOKIE_MAXAGE || "1800";
const DOMAIN = process.env.COOKIE_DOMAIN?.trim();

// Pre-computed static response parts
const PIXEL = "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const STATIC_COOKIE_PARTS = ["Path=/", "HttpOnly", "Secure", "SameSite=Strict", `Max-Age=${MAX_AGE}`];
if (DOMAIN) STATIC_COOKIE_PARTS.push(`Domain=${DOMAIN}`);
const FORMED_COOKIE_PARTS = STATIC_COOKIE_PARTS.join("; ");

const STATIC_HEADERS = {
	"Content-Type": "image/gif",
	"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
	Pragma: "no-cache",
	Expires: "0",
};

exports.handler = async () => {
	const ts = Date.now().toString();
	const sig = createHmac("sha256", SECRET).update(ts).digest("base64url");

	return {
		statusCode: 200,
		body: PIXEL,
		cookies: [`${COOKIE_NAME}=${ts}.${sig}; ${FORMED_COOKIE_PARTS}`],
		headers: STATIC_HEADERS,
		isBase64Encoded: true,
	};
};
