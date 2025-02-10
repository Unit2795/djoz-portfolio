const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({ region: "us-east-1" });

exports.handler = async (event) => {
	try {
		const body = JSON.parse(event.body);
		const { message, name, email } = body;

		// Validate inputs
		if (
			!message || message.length < 12 || message.length > 1000 ||
			!name || name.length < 2 || name.length > 50 ||
			!email || email.length < 5 || !email.includes ('@')
		) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					message: "Missing required fields: message, name, and email are required"
				})
			};
		}

		// Create email parameters
		const params = {
			Destination: {
				ToAddresses: [process.env.ADMIN_EMAIL]
			},
			Message: {
				Body: {
					Text: {
						Data: `New Portfolio Contact Form Submission\n\n\nFrom:\n${name} (${email})\n\n\nMessage:\n${message}`
					}
				},
				Subject: {
					Data: "New Portfolio Contact Form Submission"
				}
			},
			Source: process.env.ADMIN_EMAIL // Must be verified in SES
		};

		// Send email using SES
		await sesClient.send(new SendEmailCommand(params));

		return {
			statusCode: 200,
			body: JSON.stringify({
				message: "Email sent successfully"
			})
		};
	} catch (error) {
		console.error('Error:', error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: "Error processing request"
			})
		};
	}
};