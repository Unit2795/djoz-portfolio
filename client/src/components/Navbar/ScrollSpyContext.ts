import {
	createContext
} from "react";
import {
	SectionId
} from "@/components/Navbar/types.ts";

export type GetSectionRef = ( index: SectionId )=> ( el: HTMLElement | null )=> void;

export const ScrollSpyContext = createContext<{
	activeSection: string,
	getSectionRef: GetSectionRef
} | null>( null );
