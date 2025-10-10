import type { SectionArray } from "@/content/types.ts";
import { throttle } from "@/utils/throttle.ts";

/**
	Highlights the active section link based on scroll position.

	Each section occupies a percentage of the scrollable area proportional to its height.
	This ensures that taller sections are easier to activate, while still allowing short sections to be highlighted.

	
	
	@param navbar - The navbar element containing the links to highlight
	@param sections - An array of section objects
	@param topOffset - Optional offset in pixels to account for fixed headers. Default is 0
*/
export const useScrollspy = (navbar: HTMLElement, sections: SectionArray, topOffset: number = 0) => {
	const sectionEls = sections
		// Get the actual section elements from their IDs
		.map((section) => document.getElementById(section.id))
		// Filter out any nulls (in case a section ID doesn't exist in the DOM)
		.filter((el): el is HTMLElement => el !== null);
	if (sectionEls.length === 0) return console.error("No valid sections found for scrollspy.");
	const scrollParent = getScrollParent(sectionEls[0]);
	if (!scrollParent) return console.error("No scrollable parent found.");
	// Get all nav links (mobile & desktop) that correspond to sections
	const links = navbar.querySelectorAll(".navbar-link, .navbar-mobile-link");
	// Map section IDs to their corresponding links for quick lookup
	const linkMap = new Map();
	links.forEach((link) => {
		// Remove the leading '#' from href to get the section ID
		const sectionId = link.getAttribute("href")?.substring(1);
		if (sectionId) {
			// Get existing links for this section or create new set
			if (!linkMap.has(sectionId)) {
				linkMap.set(sectionId, new Set());
			}
			// Add this link to the set for this section
			linkMap.get(sectionId).add(link);
		}
	});
	let activeSection: string | null = null;
	let rangeFinder: RangeFinder | null = null;

	const throttledResizeCheck = throttle(() => {
		rangeFinder = measureSections(scrollParent, sectionEls, topOffset);
		activeSection = onScroll(scrollParent, rangeFinder, activeSection, linkMap);
	}, 250);
	const throttledOnScroll = throttle(() => {
		if (!rangeFinder) return;
		activeSection = onScroll(scrollParent, rangeFinder, activeSection, linkMap);
	}, 250);

	// If layout changes after load (images/fonts/accordions/manually), re-measure:
	new ResizeObserver(() => {
		throttledResizeCheck();
	}).observe(scrollParent);
	window.addEventListener("resize", throttledResizeCheck, { passive: true });
	addScrollListener(scrollParent, throttledOnScroll, { passive: true });
};

// Measure section positions relative to scroll parent and return a RangeFinder for quick lookups
function measureSections(scrollParent: HTMLElement, sections: HTMLElement[], topOffset: number) {
	const scrollHeight = scrollParent.scrollHeight;
	const viewportHeight = scrollParent.clientHeight;
	const scrollYMax = scrollHeight - viewportHeight;
	// Proportion to convert pixel coordinates in the document to scrollY coordinates
	const proportion = scrollYMax / scrollHeight;
	const ranges: RangeArray = [];

	sections.forEach((section) => {
		const top = section.offsetTop - topOffset;
		const bottom = top + section.offsetHeight;
		const proportionalTop = Math.floor(top * proportion);
		const proportionalBottom = Math.floor(bottom * proportion);
		ranges.push({ min: proportionalTop, max: proportionalBottom, name: section.id });
	});

	return new RangeFinder(ranges);
}

// Determine if we should treat the scroll target as the window
function shouldUseWindow(el?: HTMLElement | null) {
	return !el || el === document.scrollingElement || el === document.documentElement || el === document.body;
}

// Find the nearest scrollable parent element
// Based on: https://api.jqueryui.com/scrollParent/
function getScrollParent(el: HTMLElement): HTMLElement | null {
	function isScrollable(node: HTMLElement): boolean {
		if (!node || node === document.documentElement) return false;
		const style = window.getComputedStyle(node);
		const overflowY = style.overflowY;

		/* Ensure that the element:
			1. Has overflow set to 'auto', 'scroll', or 'overlay'
			2. Has scrollable content (Total scroll height is greater than viewport height)
			Note: 'overlay' is a legacy alias for 'auto' in some browsers
		*/
		return ["auto", "scroll", "overlay"].includes(overflowY) && node.scrollHeight > node.clientHeight;
	}

	// Loop up the DOM tree to find the nearest scrollable parent, or default to documentElement
	let parent = el.parentElement;
	while (parent && !isScrollable(parent)) {
		parent = parent.parentElement;
	}
	return parent || document.documentElement;
}

// Handle scroll events to update active section highlights
function onScroll(
	scrollParent: HTMLElement,
	rangeFinder: RangeFinder,
	activeSection: string | null,
	linkMap: Map<string, Set<Element>>,
) {
	const scrollY = scrollParent.scrollTop;
	const sectionId = rangeFinder.find(scrollY);

	if (sectionId && sectionId !== activeSection) {
		if (activeSection && linkMap.has(activeSection)) {
			// Clear active state from previous links
			const prevLinks = linkMap.get(activeSection);
			prevLinks?.forEach((link) => {
				link.removeAttribute("aria-current");
				link.classList.remove("!text-blue-400");
			});
		}

		if (linkMap.has(sectionId)) {
			// Set active state on new links
			const newLinks = linkMap.get(sectionId);
			newLinks?.forEach((link) => {
				link.classList.add("!text-blue-400");
				link.setAttribute("aria-current", "true");
			});
		}
	}
	return sectionId;
}

// Depending on if the scroll parent is the window or a specific element, we need to attach the scroll listener differently
function addScrollListener(
	scrollParent: HTMLElement,
	onScroll: EventListenerOrEventListenerObject,
	options: AddEventListenerOptions = { passive: true },
) {
	const isWindowTarget = shouldUseWindow();

	const target = isWindowTarget ? window : scrollParent;
	target.addEventListener("scroll", onScroll, options);
	return () => target.removeEventListener("scroll", onScroll, options);
}

interface Range {
	min: number;
	max: number;
	name: string;
}
type RangeArray = Range[];

// Efficiently find which range a number falls into using binary search
class RangeFinder {
	private boundaries: number[];
	private rangeNames: string[];

	constructor(ranges: RangeArray) {
		// Store sorted boundary points and their range names
		this.boundaries = [];
		this.rangeNames = [];

		// Convert ranges to sorted boundaries
		const sortedRanges = ranges.sort((a, b) => a.min - b.min);
		for (const range of sortedRanges) {
			this.boundaries.push(range.min);
			this.rangeNames.push(range.name);
		}
	}

	find(num: number) {
		// Binary search for the appropriate range
		let left = 0;
		let right = this.boundaries.length - 1;
		let result = null;

		while (left <= right) {
			const mid = Math.floor((left + right) / 2);

			if (num >= this.boundaries[mid]) {
				result = this.rangeNames[mid];
				left = mid + 1;
			} else {
				right = mid - 1;
			}
		}

		return result;
	}
}
