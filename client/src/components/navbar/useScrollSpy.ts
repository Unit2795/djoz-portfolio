import {
	sections
} from "@/content.ts";
import {
	useRef,
	useState
} from "react";

export const useScrollSpy = () => {
	const sectionCount = sections.length;
	const [ activeSection, setActiveSection ] = useState( sections[ 0 ] );
	const sectionRefs = useRef( new Array( sectionCount ).fill( null ) );
	const scrolling = useRef( false );

	const getSectionRef = ( index: number ) => ( el: HTMLElement ) => {
		sectionRefs.current[ index ] = el;
	};

	return {
		getSectionRef,
		activeSection
	};
};
