import {
	createContext
} from "react";
import {
	SectionId
} from "@/content.ts";

export type GetSectionRef = ( index: SectionId )=> ( el: HTMLElement | null )=> void;

export const ScrollSpyContext = createContext<{
	activeSection: string,
	getSectionRef: GetSectionRef
} | null>( null );
