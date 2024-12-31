import {
	useContext,
} from "react";
import {
	ScrollSpyContext
} from "@/components/navbar/ScrollSpyProvider.tsx";


export const useScrollSpy = () => {
	const context = useContext( ScrollSpyContext );
	if ( !context ) {
		throw new Error( "useScrollSpy must be used within a ScrollSpyProvider" );
	}

	return context;
};
