import {
	MutableRefObject,
	useEffect,
	useRef,
	useState
} from "react";
import {
	toCapitalized
} from "@/utils/toCapitalized.ts";
import {
	sections
} from "@/content.ts";
import {
	throttle
} from "lodash";

function getActiveSection(): string {
	const pixelBuffer = 32;

	// 1) Check near-top edge case
	if ( window.scrollY <= pixelBuffer ) {
		return sections[ 0 ];
	}

	// 2) Check near-bottom edge case
	const scrolledToBottom =
		window.innerHeight + window.scrollY >=
		document.documentElement.scrollHeight - pixelBuffer;
	if ( scrolledToBottom ) {
		return sections[ sections.length - 1 ];
	}

	// Calculate viewport middle
	const viewportMiddle = window.scrollY + window.innerHeight / 2;

	let closestSectionId = sections[ 0 ];
	let smallestDistance = Infinity;

	for ( const sectionId of sections ) {
		const el = document.getElementById( sectionId );
		if ( !el ) continue; // Skip if no matching element

		const rect = el.getBoundingClientRect();
		const sectionMiddle = window.scrollY + rect.top + rect.height / 2;
		const distance = Math.abs( viewportMiddle - sectionMiddle );

		// If a section covers >85% of the viewport, prioritize it
		const viewportCoverage = Math.min(
			rect.height,
			window.innerHeight
		) / window.innerHeight;
		const isCoveringMajority = rect.top <= 0 && rect.bottom >= window.innerHeight && viewportCoverage > 0.85;
		if ( isCoveringMajority ) {
			return sectionId; // Immediately pick it if it covers the majority
		}

		// Otherwise, keep track of the closest section to the viewport's middle
		if ( distance < smallestDistance ) {
			closestSectionId = sectionId;
			smallestDistance = distance;
		}
	}

	return closestSectionId;
}

const Navbar = ( {
	refs
}: {
	refs: MutableRefObject<null | HTMLElement>[]
} ) => {
	const [ activeSection, setActiveSection ] = useState( sections[ 0 ] );
	const scrolling = useRef( false );

	useEffect(
		() => {
			function handleScroll() {
				// Use requestAnimationFrame to throttle updates to active section
				if ( !scrolling.current ) {
					scrolling.current = true;
					window.requestAnimationFrame( () => {
						setActiveSection( getActiveSection() );
						scrolling.current = false;
					} );
				}
			}
			const throttledHandleScroll = throttle(
				handleScroll,
				200
			);

			window.addEventListener(
				"scroll",
				throttledHandleScroll,
				{
					passive: true
				}
			);
			// Do an initial check
			handleScroll();

			return () => {
				window.removeEventListener(
					"scroll",
					throttledHandleScroll
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
