import {
	sections
} from "@/content.ts";

export type SectionId = ( typeof sections )[keyof typeof sections];

export const sectionArray = Object.values( sections );
