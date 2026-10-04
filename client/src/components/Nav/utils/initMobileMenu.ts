// Closes the mobile menu when clicking outside the navbar, pressing Escape, or clicking a nav link
// Opening/toggling is handled natively by the <details> element
export const initMobileMenu = (navbar: HTMLElement, mobileMenu: HTMLDetailsElement) => {
	const closeMobileMenu = () => {
		mobileMenu.open = false;
	};

	document.addEventListener("click", (e) => {
		if (!navbar.contains(e.target as Node)) closeMobileMenu();
	});
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") closeMobileMenu();
	});
	navbar.querySelectorAll(".navbar-mobile-link, .navbar-header-link").forEach((link) => {
		link.addEventListener("click", closeMobileMenu);
	});
};
