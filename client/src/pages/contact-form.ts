import type { APIRoute } from "astro";

/* 
	NOTE: This is a mock implementation of our form handler lambda, this is for use in local development only.
	Its behavior is an approximation of the real lambda. This does not actually send emails.

	See the real lambda code in:
	/lambda/index.js
*/

const SUCCESS_URL = "/form-success";
const ERROR_URL = "/form-error";

export const POST: APIRoute = async ({ request }) => {
	let form: FormData;

	// If the body isn't form data, treat as an error and redirect.
	try {
		form = await request.formData();
	} catch {
		return redirect303(ERROR_URL);
	}

	console.log("Form data received:", Object.fromEntries(form.entries()));

	// Extract and sanitize fields.
	const email = String(form.get("email") ?? "").trim();
	const name = String(form.get("name") ?? "").trim();
	const message = String(form.get("message") ?? "").trim();

	if (
		!message ||
		message.length < 12 ||
		message.length > 1000 ||
		!name ||
		name.length < 2 ||
		name.length > 50 ||
		!email ||
		email.length < 5 ||
		!email.includes("@")
	) {
		return redirect303(ERROR_URL);
	}

	return redirect303(SUCCESS_URL);
};

// Helper: do a POST/Redirect/GET with 303 See Other.
// 303 guarantees the follow-up request is a GET (ideal for thank-you/error pages).
function redirect303(to: string): Response {
	return new Response(null, {
		status: 303,
		headers: {
			Location: to,
			// Optional hardening; safe for dev.
			"Cache-Control": "no-store",
		},
	});
}
