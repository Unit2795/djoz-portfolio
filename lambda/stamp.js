// Issues a signed, short-lived dwell-time cookie.
const { createHmac } = require("crypto");

const SECRET = process.env.HMAC_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME || "stamp";
const COOKIE_MAXAGE = Number(process.env.COOKIE_MAXAGE || "1800");
const COOKIE_DOMAIN = (process.env.COOKIE_DOMAIN || "").trim();

function base64url(buf) {
	return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

exports.handler = async () => {
	// Create signed timestamp
	const ts = Date.now().toString();
	const sig = base64url(createHmac("sha256", SECRET).update(ts).digest());

	// Compose cookie
	const parts = [
		`${COOKIE_NAME}=${encodeURIComponent(`${ts}.${sig}`)}`,
		"Path=/",
		"HttpOnly",
		"Secure",
		"SameSite=Strict",
		`Max-Age=${COOKIE_MAXAGE}`,
	];
	if (COOKIE_DOMAIN) parts.push(`Domain=${COOKIE_DOMAIN}`);

	// One-pixel GIF
	const pixel = "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

	return {
		statusCode: 200,
		body: pixel,
		cookies: [parts.join("; ")],
		headers: {
			"Content-Type": "image/gif",
			"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
			Pragma: "no-cache",
			Expires: "0",
		},
		isBase64Encoded: true,
	};
};
