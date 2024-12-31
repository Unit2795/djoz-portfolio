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

/**
 * Determine the active section based on the current scroll position
 * - If a section covers >85% of the viewport, it is considered active
 * - Otherwise, the section closest to the viewport's middle is considered active
 * - If the user is within a set distance from the top or bottom of the page, the first or last section is considered active
 * */
function getActiveSection( refs: MutableRefObject<null | HTMLElement>[] ): string {
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

	for ( const ref of refs ) {
		if ( !ref.current ) continue;

		const rect = ref.current.getBoundingClientRect();
		const sectionMiddle = window.scrollY + rect.top + rect.height / 2;
		const distance = Math.abs( viewportMiddle - sectionMiddle );

		// If a section covers >85% of the viewport, prioritize it
		const viewportCoverage = Math.min(
			rect.height,
			window.innerHeight
		) / window.innerHeight;
		const isCoveringMajority = rect.top <= 0 && rect.bottom >= window.innerHeight && viewportCoverage > 0.85;
		if ( isCoveringMajority ) {
			return ref.current.id; // Immediately pick it if it covers the majority
		}

		// Otherwise, keep track of the closest section to the viewport's middle
		if ( distance < smallestDistance ) {
			closestSectionId = ref.current.id;
			smallestDistance = distance;
		}
	}

	return closestSectionId;
}

/**
 * Navbar component that highlights the active section based on the current scroll position
 * */
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
						setActiveSection( getActiveSection( refs ) );
						scrolling.current = false;
					} );
				}
			}
			const throttledHandleScroll = throttle(
				handleScroll,
				300
			);

			window.addEventListener(
				"scroll",
				throttledHandleScroll,
				{
					passive: true // We don't need to use preventDefault, so keep this in place
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
		[ refs ]
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
							refs.map( ( item ) => {
								if ( !item.current ) return null;

								const {
									id
								} = item.current;

								return (
									<a
										className={
											`hover:text-blue-400 transition-colors ${
												activeSection === id ? "text-blue-400" : "text-gray-200"
											}`
										}
										href={ `#${ id }` }
										key={ id }>
										{toCapitalized( id )}
									</a>
								);
							} )
						}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
