import { useMobileMenu } from "@/components/Nav/utils/useMobileMenu";
import { useNavbarAnimation } from "@/components/Nav/utils/useNavbarAnimation";
import { useScrollspy } from "@/components/Nav/utils/useScrollSpy.ts";
import type { SectionArray } from "@/content/types.ts";

/**
 * Initializes all navbar features:
 * - Mobile menu functionality (hamburger menu, click outside to close)
 * - Scroll-based resize animation (with reduced motion support)
 * - Active section highlighting based on scroll position
 */
export const useNavbar = (
	navbar: HTMLElementTagNameMap["nav"],
	mobileMenu: HTMLDetailsElement,
	sections: SectionArray,
	navContainer: HTMLDivElement,
	disableDynamic: boolean,
) => {
	useMobileMenu(navbar, mobileMenu);
	useNavbarAnimation(navContainer, disableDynamic);
	// Use a top offset to account for the fixed navbar height when determining active sections
	useScrollspy(navbar, sections, 80);
};
