import {
	FormEvent,
	useState
} from "react";
import {
	CheckCircle,
	CircleX,
	Send
} from "lucide-react";
import {
	email,
	web3PublicKey
} from "@/content.ts";

interface Web3FormResponse {
	success: boolean
}

const ContactForm = () => {
	const [ formResult, setFormResult ] = useState<"error" | "success" | "pending" | "unsubmitted">( "unsubmitted" );

	const onSubmit = async( event: FormEvent<HTMLFormElement> ) => {
		event.preventDefault();
		setFormResult( "pending" );
		const formData = new FormData( event.currentTarget );

		formData.append(
			"access_key",
			web3PublicKey
		);

		// If honeypot fields are filled, don't submit the form
		if ( formData.get( "subject" ) as string || formData.get( "mayContact" ) as string ) {
			setFormResult( "success" );
			event.currentTarget.reset();
		}

		// Remove honeypot fields
		formData.delete( "subject" );
		formData.delete( "mayContact" );

		const response = await fetch(
			"https://api.web3forms.com/submit",
			{
				method: "POST",
				body: formData
			}
		);

		const data = await response.json() as Web3FormResponse;

		if ( data.success ) {
			setFormResult( "success" );
			event.currentTarget.reset();
		} else {
			setFormResult( "error" );
		}
	};

	const inputClasses = "w-full p-3 border rounded-lg border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-transparent text-white";
	const labelClasses = "block text-md text-gray-300 mb-1";

	return (
		<div className="max-w-2xl mx-auto p-6">
			{
				( formResult === "unsubmitted" || formResult === "pending" || formResult === "error" ) && (
					<form
						className="space-y-6 mb-8"
						onSubmit={ onSubmit }>
						<div>
							<label
								className={ labelClasses }
								htmlFor="name">
								Name
							</label>

							<input
								className={ inputClasses }
								id="name"
								name="name"
								placeholder="John Doe"
								required
								type="text"/>
						</div>

						<div>
							<label
								className={ labelClasses }
								htmlFor="email">
								Email
							</label>

							<input
								className={ inputClasses }
								id="email"
								name="email"
								placeholder="john@example.com"
								required
								type="email"/>
						</div>

						<div>
							<label
								className={ labelClasses }
								htmlFor="message">
								Message
							</label>

							<textarea
								className={ inputClasses }
								id="message"
								name="message"
								placeholder="Your message here..."
								required
								rows={ 4 }/>
						</div>

						<button
							className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
							disabled={ formResult === "pending" }
							type="submit">
							{
								formResult === "pending"
									? (
										<div
											className="w-4 h-4 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"/>
									)
									: (
										<Send
											height={ 16 }
											width={ 16 }/>
									)
							}
							Send Message
						</button>
					</form>
				)
			}

			{
				formResult === "success" && (
					<div className="flex items-center justify-center p-4 border border-green-600 rounded-lg motion-safe:animate-fade">
						<CheckCircle
							className="text-green-500 mr-2"
							width={ 48 }/>

						<p className="text-green-500">Thank you for your message! I'll get back to you soon.</p>
					</div>
				)
			}

			{
				formResult === "error" && (
					<div className="flex items-center justify-center p-4 border border-red-600 rounded-lg">
						<CircleX
							className="text-red-500 mr-2"
							width={ 48 }/>

						<p className="text-red-500">An error occurred when trying to send your message, please try again later or send an email to {email}</p>
					</div>
				)
			}
		</div>
	);
};

export default ContactForm;
