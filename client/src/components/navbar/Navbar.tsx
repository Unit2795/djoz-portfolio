import {
	MutableRefObject,
	useEffect,
	useRef,
	useState
} from "react";
import {
	toCapitalized
} from "@/utils/toCapitalized.ts";

const sections = [ "about", "projects", "skills", "contact" ];

const Navbar = ( {
	refs
}: {
	refs: MutableRefObject<null | HTMLElement>[]
} ) => {
	const [ activeSection, setActiveSection ] = useState( "about" );

	useEffect(
		() => {
			const handleScroll = () => {
				// Edge case: Near top of page, highlight first section
				if ( window.scrollY <= 32 ) {
					setActiveSection( sections[ 0 ] );

					return;
				}

				// Edge case: Near bottom of page, highlight last section
				if ( ( window.innerHeight + window.scrollY ) >= document.documentElement.scrollHeight - 32 ) {
					setActiveSection( sections[ sections.length - 1 ] );

					return;
				}

				// Calculate viewport middle point
				const viewportMiddle = window.scrollY + ( window.innerHeight / 2 );

				// Find which section's middle is closest to viewport middle
				let closestSection = sections[ 0 ];
				let smallestDistance = Infinity;

				sections.forEach( sectionId => {
					const element = document.getElementById( sectionId );
					if ( element ) {
						const rect = element.getBoundingClientRect();
						const sectionMiddle = window.scrollY + rect.top + ( rect.height / 2 );
						const distance = Math.abs( viewportMiddle - sectionMiddle );

						// If this section takes up most/all of the viewport, prioritize it
						const viewportCoverage = Math.min(
							rect.height,
							window.innerHeight
						) / window.innerHeight;
						if ( viewportCoverage > 0.85 ) {
							console.log( "go" );
							if ( rect.top <= 0 && rect.bottom >= window.innerHeight ) {
								closestSection = sectionId;
								smallestDistance = -1; // Ensure this wins

								return;
							}
						}

						// Otherwise use distance to middle
						if ( distance < smallestDistance ) {
							closestSection = sectionId;
							smallestDistance = distance;
						}
					}
				} );

				setActiveSection( closestSection );
			};

			// Add scroll listener
			window.addEventListener(
				"scroll",
				handleScroll
			);
			// Initial check
			handleScroll();

			return () => {
				window.removeEventListener(
					"scroll",
					handleScroll
				);
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
