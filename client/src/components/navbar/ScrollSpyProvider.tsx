import {
	SectionId,
	sections
} from "@/content.ts";
import {
	MutableRefObject,
	ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState
} from "react";
import {
	throttle
} from "lodash";
import {
	GetSectionRef,
	ScrollSpyContext
} from "./ScrollSpyContext";

type SectionRef = Record<SectionId, HTMLElement | null>;

/**
 * Determine the active section based on the current scroll position
 * - If a section covers >85% of the viewport, it is considered active
 * - Otherwise, the section closest to the viewport's middle is considered active
 * - If the user is within a set distance from the top or bottom of the page, the first or last section is considered active
 * */
function getActiveSection( ref: MutableRefObject<SectionRef> ): string {
	const pixelBuffer = 32;
	const sectionIds = Object.keys( ref.current );

	// Edge case: User is near TOP of page
	if ( window.scrollY <= pixelBuffer ) return sectionIds[ 0 ];

	// Edge case: User is near BOTTOM of page
	const isAtBottom =
		window.innerHeight + window.scrollY >=
		document.documentElement.scrollHeight - pixelBuffer;
	if ( isAtBottom ) return sectionIds[ sectionIds.length - 1 ];

	// Calculate viewport middle
	const viewportMiddle = window.scrollY + window.innerHeight / 2;

	let closestSection = {
		id: sectionIds[ 0 ],
		distance: Infinity
	};

	// Find the section closest to the viewport's middle
	for ( const [ id, element ] of Object.entries( ref.current ) ) {
		if ( !element ) continue;

		const rect = element.getBoundingClientRect();
		const sectionMiddle = window.scrollY + rect.top + rect.height / 2;

		// If a section covers >85% of the viewport, return it immediately
		const viewportCoverage = Math.min(
			rect.height,
			window.innerHeight
		) / window.innerHeight;
		const isCoveringMajority = rect.top <= 0 && rect.bottom >= window.innerHeight && viewportCoverage > 0.85;
		if ( isCoveringMajority ) return id; // Immediately pick it if it covers the majority

		const distance = Math.abs( viewportMiddle - sectionMiddle );
		// Otherwise, keep track of the closest section to the viewport's middle
		if ( distance < closestSection.distance ) {
			closestSection = {
				id,
				distance
			};
		}
	}

	return closestSection.id;
}

export const ScrollSpyProvider = ( {
	children
}: {
	children: ReactNode
} ) => {
	const [ activeSection, setActiveSection ] = useState<string>( sections.ABOUT );
	const sectionRefs = useRef<SectionRef>( {
		[ sections.ABOUT ]: null,
		[ sections.PROJECTS ]: null,
		[ sections.SKILLS ]: null,
		[ sections.CONTACT ]: null
	} );

	useEffect(
		() => {
			const updateActiveSection = throttle(
				() => {
					// Use requestAnimationFrame to throttle updates to active section
					window.requestAnimationFrame( () => {
						setActiveSection( getActiveSection( sectionRefs ) );
					} );
				},
				200
			);

			window.addEventListener(
				"scroll",
				updateActiveSection,
				{
					passive: true // We don't need to use preventDefault, so keep this in place!
				}
			);
			// Do an initial check
			updateActiveSection();

			return () => {
				window.removeEventListener(
					"scroll",
					updateActiveSection
				);
			};
		},
		[ sectionRefs ]
	);

	// Store a reference to each section
	const getSectionRef: GetSectionRef = ( sectionId ) => ( el ) => {
		sectionRefs.current[ sectionId ] = el;
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
