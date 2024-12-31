import {
	useEffect,
	useState
} from "react";
import {
	toCapitalized
} from "@/utils/toCapitalized.ts";

const sections = [ "about", "projects", "skills", "contact" ];

const Navbar = () => {
	const [ activeSection, setActiveSection ] = useState( "about" );

	useEffect(
		() => {
			const observers = sections.map( sectionId => {
				const observer = new IntersectionObserver(
					( entries ) => {
						entries.forEach( entry => {
							console.log( entry );
							if ( entry.isIntersecting ) {
								setActiveSection( sectionId );
							}
						} );
					},
					{
						rootMargin: "50px 0px", // Triggers when section is in middle of viewport
						threshold: 0.9
					}
				);

				const element = document.getElementById( sectionId );
				if ( element ) {
					observer.observe( element );
				}

				return observer;
			} );

			// Cleanup function
			return () => {
				observers.forEach( observer => {
					observer.disconnect();
				} );
			};
		},
		[]
	);

	return (
		<nav className="fixed top-0 w-full bg-gray-900/50 backdrop-blur-sm z-50 drop-shadow-lg">
			<div className="container mx-auto px-6 py-4">
				<div className="flex justify-between items-center">
					<span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
						David Jozwik
					</span>

					<div className="space-x-6">
						{
							sections.map( ( item ) => (
								<a
									className={
										`hover:text-blue-400 transition-colors ${
											activeSection === item.toLowerCase() ? "text-blue-400" : "text-gray-200"
										}`
									}
									href={ `#${ item }` }
									key={ item }>
									{toCapitalized( item )}
								</a>
							) )
						}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
