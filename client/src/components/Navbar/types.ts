export const sections = {
	ABOUT: "about",
	PROJECTS: "projects",
	SKILLS: "skills",
	CONTACT: "contact"
} as const;

export type SectionId = ( typeof sections )[keyof typeof sections];

export const sectionArray = Object.values( sections );
