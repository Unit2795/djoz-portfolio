import { setTimeout as sleep } from "node:timers/promises";

// Rough stand-in for contact-api's checks; the real ones live in contact-api
function findProblem(email, message) {
	if (!email.includes("@")) return "invalid_email";
	const length = message.trim().length;
	if (length < 12 || length > 2000) return "invalid_message";
	return null;
}

// Like contact-api: JSON { ok, reason } when the request accepts JSON, otherwise a 303 to the success or error page
export const post = async (req, res) => {
	const wantsJson = req.get("accept")?.includes("application/json");
	const { email = "", message = "" } = req.body;

	console.log("Contact form submission received", { formId: req.params.formId, email, message, wantsJson });

	await sleep(3000); // Simulate a slow send

	const reason = findProblem(email, message);
	if (wantsJson) {
		return reason ? res.status(400).json({ ok: false, reason }) : res.json({ ok: true });
	}
	return res.redirect(303, reason ? `/form-error?reason=${reason}` : "/form-success");
};
