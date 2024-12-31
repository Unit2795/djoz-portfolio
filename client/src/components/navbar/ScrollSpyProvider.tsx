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
import {
	Entries
} from "type-fest";

type SectionRef = Record<SectionId, HTMLElement | null>;

/**
 * Determine the active section based on the current scroll position
 * - If a section covers >85% of the viewport, it is considered active
 * - Otherwise, the section closest to the viewport's middle is considered active
 * - If the user is within a set distance from the top or bottom of the page, the first or last section is considered active
 * */
function getActiveSection( ref: MutableRefObject<SectionRef> ): SectionId {
	const pixelBuffer = 32;
	const sectionIds = Object.keys( ref.current ) as SectionId[];

	// Edge case: User is near TOP of page
	if ( window.scrollY <= pixelBuffer ) {
		return sectionIds[ 0 ];
	}

	// Edge case: User is near BOTTOM of page
	const scrolledToBottom =
		window.innerHeight + window.scrollY >=
		document.documentElement.scrollHeight - pixelBuffer;
	if ( scrolledToBottom ) {
		return sectionIds[ sectionIds.length - 1 ];
	}

	// Calculate viewport middle
	const viewportMiddle = window.scrollY + window.innerHeight / 2;

	let closestSectionId = sectionIds[ 0 ];
	let smallestDistance = Infinity;

	for (
		const [ sectionId, element ] of
		Object.entries( ref.current ) as
		Entries<typeof ref.current>
	) {
		if ( !element ) continue;

		const rect = element.getBoundingClientRect();
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

export const ScrollSpyProvider = ( {
	children
}: {
	children: ReactNode
} ) => {
	const [ activeSection, setActiveSection ] = useState<SectionId>( sections.ABOUT );
	const sectionRefs = useRef<SectionRef>( {
		[ sections.ABOUT ]: null,
		[ sections.PROJECTS ]: null,
		[ sections.SKILLS ]: null,
		[ sections.CONTACT ]: null
	} );
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
