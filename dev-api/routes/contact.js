import { sleep } from "../utils/sleep.js";

const SUCCESS_URL = "/form-success";
const ERROR_URL = "/form-error";

function respond(res, isJson, statusCode, message) {
	if (isJson) {
		return res.status(statusCode).json({ message });
	} else {
		return statusCode === 200
			? res.status(303).header("Location", SUCCESS_URL).send()
			: res.status(303).header("Location", ERROR_URL).send();
	}
}

export const post = async (req, res) => {
	const isJson = req.headers["content-type"]?.includes("application/json");
	const { email, message } = req.body;

	console.log("Contact form submission received", { email, message, isJson });

	await sleep(3000); // Simulate slow processing (e.g. saving to DB, sending email, etc)

	if (
		!message ||
		message.length < 12 ||
		message.length > 1000 ||
		!email ||
		email.length < 5 ||
		!email.includes("@")
	) {
		console.error("Invalid form submission");
		return respond(res, isJson, 400, "Invalid email or message");
	}

	console.log("Valid form submission");
	return respond(res, isJson, 200);
};
