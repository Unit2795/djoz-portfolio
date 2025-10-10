// Manages mobile menu state, toggling, and accessibility features
export const useMobileMenu = (navbar: HTMLElementTagNameMap["nav"], mobileMenu: HTMLDetailsElement) => {
	// Read the latest menu state on demand to avoid stale closures
	const isMenuOpen = () => mobileMenu.open === true;

	// Centralized state application keeps UI and ARIA in sync
	const applyMenuState = (open: boolean) => {
		mobileMenu.open = open;
	};

	const openMobileMenu = () => applyMenuState(true);
	const closeMobileMenu = () => applyMenuState(false);
	const toggleMobileMenu = () => applyMenuState(!isMenuOpen());

	const initEventHandlers = () => {
		// Close mobile menu when clicking outside
		const onDocumentClick = (e: MouseEvent) => {
			if (isMenuOpen() && !navbar.contains(e.target as Node)) {
				closeMobileMenu();
			}
		};
		document.addEventListener("click", onDocumentClick);

		// Close mobile menu when pressing Escape
		const onDocumentKeydown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isMenuOpen()) {
				closeMobileMenu();
			}
		};
		document.addEventListener("keydown", onDocumentKeydown);

		// Close mobile menu when clicking nav links
		const onMobileLinkClick = () => closeMobileMenu();
		const mobileLinks = navbar.querySelectorAll(".navbar-mobile-link, .navbar-header-link");
		mobileLinks.forEach((link) => {
			link.addEventListener("click", onMobileLinkClick);
		});

		/* document.querySelectorAll(".navbar-header-link").forEach((link) => {
			link.addEventListener("click", closeMobileMenu);
		}); */

		// Return cleanup function to aid unmounting
		return () => {
			document.removeEventListener("click", onDocumentClick);
			document.removeEventListener("keydown", onDocumentKeydown);
			mobileLinks.forEach((link) => {
				link.removeEventListener("click", onMobileLinkClick);
			});
		};
	};

	// Initialize and expose cleanup for callers (optional to use)
	return initEventHandlers();
};
