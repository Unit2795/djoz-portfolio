const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({ region: "us-east-1" });

exports.handler = async (event) => {
	try {
		const { body } = event;

		if (body && body.length > 2000) {
			return {
				statusCode: 303,
				headers: {
					Location: process.env.ERROR_REDIRECT,
				},
			};
		}

		// Parse form data
		const formData = new URLSearchParams(event.isBase64Encoded ? Buffer.from(body, "base64").toString() : body);
		const message = formData.get("message");
		const name = formData.get("name");
		const email = formData.get("email");

		// Validate inputs
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
			return {
				statusCode: 303,
				headers: {
					Location: process.env.ERROR_REDIRECT,
				},
			};
		}

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
						Data: `New Portfolio Contact Form Submission\n\n\nFrom:\n${name} (${email})\n\n\nMessage:\n${message}\n\n\nUser Agent:\n${userAgent}\n\n\nIP Address:\n${ip}\n\n\nProxied IP Address:\n${proxiedIp}\n`,
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

		return {
			statusCode: 303,
			headers: {
				Location: process.env.SUCCESS_REDIRECT,
			},
		};
	} catch (error) {
		console.error("Error:", error);

		return {
			statusCode: 303,
			headers: {
				Location: process.env.ERROR_REDIRECT,
			},
		};
	}
};
