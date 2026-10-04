import type { IconType } from "@/components/Icon/Icon.astro";

export interface Section {
	// href that corresponds to the section/link
	id: string;
	// Human readable/formatted title for the section in the navbar
	navTitle: string;
	// Title that shows up on the section itself, if this is not provided, navTitle will be used
	header?: string;
	// Description that shows up under the title on the section itself
	description?: string;
	// If true, the section will have a solid background color
	solidBackground?: boolean;
	// If you'd like the description to be read by screenreaders, but not shown visually, set this to true
	hideDescription?: boolean;
	// To disable the section entirely, set this to true
	disabled?: boolean;
	// Disable analytics tracking for this section
	disableAnalytics?: boolean;
	// A descriptive label for analytics purposes, if not provided, analytics will use the id
	analyticsLabel?: string;
}

export type Sections = Record<"INTRO" | "PROJECTS" | "SKILLS" | "CONTACT", Section>;

export interface NavbarContent {
	header?: {
		text: string;
		size?: string;
		href?: string;
	};
	moreLinks?: {
		label?: string;
		items: {
			label: string;
			href?: string;
			newTab?: boolean;
			analyticsLabel?: string;
		}[];
	};
	skipLinkText?: string;
	ariaLabel?: string;
	hamburgerMenuAriaLabel?: string;
	mobileMenuAriaLabel?: string;
	disableAnalytics?: boolean;
}

export interface IntroContent {
	heading?: {
		top: {
			text: string;
			color?: string;
		};
		bottom: {
			text: string;
			color?: string;
		};
	};
	subHeading?: string;
	projectButton?: {
		text: string;
		ariaLabel?: string;
	};
	contactButton?: {
		text: string;
		ariaLabel?: string;
	};
	links?: LinkItem[];
	aboutMe?: AboutMeContent;
}

export interface AboutMeContent {
	aria: {
		title: string;
		description?: string;
	};
	description: string;
	quote: string;
	stats: {
		items: {
			title: string;
			subtitle: string;
		}[];
		ariaLabel: string;
	};
	highlights: {
		ariaLabel: string;
		items: {
			color: string;
			text: string;
		}[];
	};
}

export interface ProjectItem {
	title: string;
	description: string;
	tags: string[];
	link: string;
	img: string;
	analyticsLabel?: string;
}

export type ProjectsContent = {
	viewProjectText?: string;
	items: ProjectItem[];
};

export interface SkillItem {
	name: string;
	subtitle: string;
	icon: IconType;
	subSkills?: string[];
	analyticsLabel?: string;
}

export type SkillsContent = SkillItem[];

export interface LinkItem {
	label: string;
	icon: IconType;
	// If a link is provided, an anchor tag will be used
	link?: string;
	// If a value is provided, a copy text button will be used
	value?: string;
	// A descriptive label for analytics purposes, if not provided, analytics will be disabled for this item
	analyticsLabel?: string;
}

export interface FormStatePage {
	icon?: IconType;
	browserTitle?: string;
	browserDescription?: string;
	title?: string;
	titleColor?: string;
	message?: string;
	redirectText?: string;
	redirectHref?: string;
	disableAutoRedirect?: boolean;
	autoRedirectSeconds?: number;
}

export interface ContactFormContent {
	// The form's id in your contact-api config repo's forms.json. The form posts to /api/contact/<formId>.
	formId: string;
	links?: LinkItem[];
	email: {
		label: string;
		placeholder: string;
	};
	message: {
		label: string;
		placeholder: string;
		// Describes the length limits below to visitors
		hint: string;
		// Keep in sync with the form's messageMin/messageMax in forms.json
		minLength: number;
		maxLength: number;
	};
	button: string;
	buttonSending: string;
	formAriaLabel?: string;
	errorMessage: string;
	// Messages for contact-api's error reasons, keyed by reason. Other reasons show errorMessage.
	reasonMessages?: Record<string, string>;
	statusPages?: {
		success: FormStatePage;
		error: FormStatePage;
	};
}

// Social share preview image (Open Graph / Twitter card)
export interface ShareImage {
	// Path of an image in `public/`, relative to the site root
	path: string;
	alt: string;
	width: number;
	height: number;
}

// Web app manifest (site.webmanifest) settings, the manifest's name is `name`
export interface WebManifestContent {
	shortName: string;
	themeColor: string;
	backgroundColor: string;
}

export interface FooterContent {
	items?: {
		label: string;
		href?: string;
	}[];
	disableAnalytics?: boolean;
}
