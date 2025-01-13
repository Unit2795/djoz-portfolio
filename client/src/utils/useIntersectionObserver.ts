import {
	useEffect,
	useRef,
	useState
} from "react";

export const useIntersectionObserver = <T extends Element>(
	options: IntersectionObserverInit = {
	}
) => {
	const [ isIntersecting, setIsIntersecting ] = useState( false );
	const elementRef = useRef<T | null>( null );

	useEffect(
		() => {
			const observer = new IntersectionObserver(
				( [ entry ] ) => {
					setIsIntersecting( entry.isIntersecting );
				},
				options
			);

			if ( !elementRef.current ) {
				return;
			}

			observer.observe( elementRef.current );
			const currentElement = elementRef.current;

			return () => {
				observer.unobserve( currentElement );
			};
		},
		[ options ]
	);

	return {
		elementRef,
		isIntersecting
	};
};
