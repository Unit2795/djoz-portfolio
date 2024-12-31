import {
	sections
} from "@/content.ts";
import {
	MutableRefObject,
	ReactNode,
	createContext,
	useEffect,
	useMemo,
	useRef,
	useState
} from "react";
import {
	throttle
} from "lodash";

export type SectionsRef = MutableRefObject<( null | HTMLElement )[]>;

/**
 * Determine the active section based on the current scroll position
 * - If a section covers >85% of the viewport, it is considered active
 * - Otherwise, the section closest to the viewport's middle is considered active
 * - If the user is within a set distance from the top or bottom of the page, the first or last section is considered active
 * */
function getActiveSection( ref: SectionsRef ): string {
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

	for ( const item of ref.current ) {
		if ( !item ) continue;

		const rect = item.getBoundingClientRect();
		const sectionMiddle = window.scrollY + rect.top + rect.height / 2;
		const distance = Math.abs( viewportMiddle - sectionMiddle );

		// If a section covers >85% of the viewport, prioritize it
		const viewportCoverage = Math.min(
			rect.height,
			window.innerHeight
		) / window.innerHeight;
		const isCoveringMajority = rect.top <= 0 && rect.bottom >= window.innerHeight && viewportCoverage > 0.85;
		if ( isCoveringMajority ) {
			return item.id; // Immediately pick it if it covers the majority
		}

		// Otherwise, keep track of the closest section to the viewport's middle
		if ( distance < smallestDistance ) {
			closestSectionId = item.id;
			smallestDistance = distance;
		}
	}

	return closestSectionId;
}

export const ScrollSpyContext = createContext<{
	activeSection: string,
	getSectionRef: ( index: number )=> ( el: HTMLElement )=> void
} | null>( null );

export const ScrollSpyProvider = ( {
	children
}: {
	children: ReactNode
} ) => {
	const sectionCount = sections.length;
	const [ activeSection, setActiveSection ] = useState( sections[ 0 ] );
	const sectionRefs = useRef< ( null | HTMLElement )[] >( new Array<null>( sectionCount ).fill( null ) );
	const scrolling = useRef( false );

	useEffect(
		() => {
			function handleScroll() {
				// Use requestAnimationFrame to throttle updates to active section
				if ( !scrolling.current ) {
					scrolling.current = true;
					window.requestAnimationFrame( () => {
						setActiveSection( getActiveSection( sectionRefs ) );
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
		[ sectionRefs ]
	);

	const getSectionRef = ( index: number ) => ( el: HTMLElement ) => {
		sectionRefs.current[ index ] = el;
	};

	const value = useMemo(
		() => ( {
			activeSection,
			getSectionRef
		} ),
		[ activeSection ]
	);

	return (
		<ScrollSpyContext.Provider
			value={ value }>
			{children}
		</ScrollSpyContext.Provider>
	);
};
