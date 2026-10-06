/**
	Highlights the active section link based on scroll position.

	Each section occupies a percentage of the scrollable area proportional to its height.
	This ensures that taller sections are easier to activate, while still allowing short sections to be highlighted.

	@param navbar - The navbar element containing the links to highlight, each link's hash is its section's id
	@param topOffset - Optional offset in pixels to account for fixed headers. Default is 0
*/
export const initScrollSpy = (navbar: HTMLElement, topOffset: number = 0) => {
	// Get all nav links (mobile & desktop) that correspond to sections
	const links = [...navbar.querySelectorAll<HTMLAnchorElement>(".navbar-link, .navbar-mobile-link")];
	const sections = [...new Set(links.map((link) => link.hash.slice(1)))]
		.map((id) => document.getElementById(id))
		.filter((el) => el !== null);
	if (sections.length === 0) return console.error("No valid sections found for scrollspy.");

	let sectionTops: number[] = [];
	let activeSection: string | undefined;

	const update = () => {
		const { scrollHeight, clientHeight } = document.documentElement;
		// Proportion to convert pixel coordinates in the document to scrollY coordinates
		const proportion = (scrollHeight - clientHeight) / scrollHeight;
		const sectionId = sections.findLast((_, i) => window.scrollY >= sectionTops[i] * proportion)?.id;
		if (!sectionId || sectionId === activeSection) return;

		activeSection = sectionId;
		links.forEach((link) => {
			const isActive = link.hash === `#${sectionId}`;
			link.classList.toggle("!text-blue-400", isActive);
			if (isActive) link.setAttribute("aria-current", "true");
			else link.removeAttribute("aria-current");
		});
	};

	// Measure on load, and re-measure if layout changes after load (images/fonts/accordions/resizing)
	new ResizeObserver(() => {
		// Sorted by position on the page, which may differ from the order of the nav links
		sections.sort((a, b) => a.offsetTop - b.offsetTop);
		sectionTops = sections.map((section) => section.offsetTop - topOffset);
		update();
	}).observe(document.documentElement);

	// Update at most once per frame while scrolling
	let frame = 0;
	window.addEventListener(
		"scroll",
		() => {
			frame ||= requestAnimationFrame(() => {
				frame = 0;
				update();
			});
		},
		{ passive: true },
	);
};
