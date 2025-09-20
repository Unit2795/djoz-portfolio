import type { IconType } from "@/components/Icon/Icon.astro";
import { sections } from "@/content";

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
}

export type Sections = Record<string, Section>;

export type SectionArray = typeof sectionsArray;

export const sectionsArray: Section[] = Object.values(sections);

export interface NavbarContent {
	header?: {
		text: string;
		size?: string;
		href?: string;
		ariaLabel?: string;
	};
	moreLinks?: {
		label?: string;
		items: {
			label: string;
			href?: string;
			newTab?: boolean;
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
}

export type ProjectsContent = {
	viewProjectText?: string;
	items: ProjectItem[];
};

export interface SkillItem {
	name: string;
	subtitle: string;
	icon: IconType;
	level: number;
	subSkills?: string[];
}

export type SkillsContent = SkillItem[];

export interface LinkItem {
	label: string;
	icon: IconType;
	// If a link is provided, an anchor tag will be used
	link?: string;
	// If a value is provided, a copy text button will be used
	value?: string;
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
	links?: LinkItem[];
	name: {
		label: string;
		placeholder: string;
	};
	email: {
		label: string;
		placeholder: string;
	};
	message: {
		label: string;
		placeholder: string;
	};
	button: string;
	formAriaLabel?: string;
	statusPages?: {
		success: FormStatePage;
		error: FormStatePage;
	};
}

export interface FooterContent {
	items?: {
		label: string;
		href?: string;
	}[];
	disableAnalytics?: boolean;
}
