const fixedClasses = ["w-full", "max-w-screen"];
const relativeClasses = ["w-4/5", "rounded-lg", "max-w-3xl"];

// Animates the navbar size/position based on scroll position
export const useNavbarAnimation = (navContainer: HTMLDivElement, disableDynamic: boolean) => {
	const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// Skip all animations if user prefers reduced motion or the animations have been intentionally disabled
	if (prefersReducedMotion || disableDynamic) return;

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.intersectionRatio < 1) {
				// Navbar has become fxed to top of viewport
				navContainer.classList.add(...fixedClasses);
				navContainer.classList.remove(...relativeClasses);
			} else {
				// Navbar is currently relatively positioned in the content
				navContainer.classList.remove(...fixedClasses);
				navContainer.classList.add(...relativeClasses);
			}
		},
		{ threshold: [1] },
	);

	observer.observe(navContainer);
};
