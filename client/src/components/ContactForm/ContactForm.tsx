import {
	FormEvent,
	useEffect,
	useState
} from "react";
import {
	CheckCircle,
	CircleX,
	Send
} from "lucide-react";
import {
	contactFormError,
	contactFormSuccess,
} from "@/content.tsx";

const API_ENDPOINT = import.meta.env.VITE_API_GATEWAY_ENDPOINT as string;

const ContactForm = () => {
	const [ formResult, setFormResult ] = useState<"error" | "success" | "pending" | "unsubmitted">( "unsubmitted" );
	const [ touched, setTouched ] = useState( false );
	const [ isDisabled, setIsDisabled ] = useState( true );
	const [ messageLength, setMessageLength ] = useState( 0 );
	const [ validity, setValidity ] = useState( {
		name: false,
		email: false,
		message: false
	} );

	const isFormValid = validity.name && validity.email && validity.message;

	const handleFocus = () => {
		if ( !touched ) {
			setTouched( true );
		}
	};

	useEffect(
		() => {
			// Once the first for input is touched, enable the submit button after 4 to 6 seconds
			if ( touched ) {
				setTimeout(
					() => {
						setIsDisabled( false );
					},
					// Randomize between 6000 to 4000 milliseconds
					Math.floor( 4000 + Math.random() * 2000 )
				);
			}
		},
		[ touched ]
	);

	const onSubmit = async( event: FormEvent<HTMLFormElement> ) => {
		event.preventDefault();
		const form = event.currentTarget; // Store the form reference
		setFormResult( "pending" );

		try {
			const formData = new FormData( event.currentTarget );
			const response = await fetch(
				API_ENDPOINT,
				{
					method: "POST",
					body: JSON.stringify( Object.fromEntries( formData ) )
				}
			);

			if ( response.ok ) {
				setFormResult( "success" );
				form.reset();
			} else {
				setFormResult( "error" );
			}
		} catch {
			setFormResult( "error" );
		}
	};

	const inputClasses = "w-full p-3 border rounded-lg border-gray-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition duration-200 bg-transparent text-white";
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
								maxLength={ 50 }
								minLength={ 2 }
								name="name"
								placeholder="John Doe"
								required
								type="text"
								onChange={
									( e ) => {
										setValidity( prevState => {
											return {
												...prevState,
												name: e.target.validity.valid
											};
										} );
									}
								}
								onFocus={ handleFocus }/>
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
								type="email"
								onChange={
									( e ) => {
										setValidity( prevState => {
											return {
												...prevState,
												email: e.target.validity.valid
											};
										} );
									}
								}
								onFocus={ handleFocus }/>
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
								maxLength={ 1000 }
								minLength={ 12 }
								name="message"
								placeholder="Your message here..."
								required
								rows={ 4 }
								onChange={
									( e ) => {
										setMessageLength( e.target.value.length );
										setValidity( prevState => {
											return {
												...prevState,
												message: e.target.validity.valid
											};
										} );
									}
								}
								onFocus={ handleFocus }/>

							<p className="text-xs text-gray-400 text-right">{messageLength} / 1000</p>
						</div>

						<button
							className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200
							disabled:bg-stone-600 disabled:text-stone-300 disabled:cursor-not-allowed"
							disabled={ formResult === "pending" || isDisabled || !isFormValid }
							type="submit">
							{
								formResult === "pending"
									? (
										<>
											<div
												className="w-4 h-4 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"/>
											Sending...
										</>

									)
									: (
										<>
											<Send
												height={ 16 }
												width={ 16 }/>
											Send Message
										</>

									)
							}
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

						<p className="text-green-500">{contactFormSuccess}</p>
					</div>
				)
			}

			{
				formResult === "error" && (
					<div className="flex items-center justify-center p-4 border border-red-600 rounded-lg">
						<CircleX
							className="text-red-500 mr-2"
							width={ 48 }/>

						<p className="text-red-500">{contactFormError}</p>
					</div>
				)
			}
		</div>
	);
};

export default ContactForm;
