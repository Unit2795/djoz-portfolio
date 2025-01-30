import {
	FC,
	useEffect,
	useRef,
	useState
} from "react";

interface AnimatedCounterProps {
	value: number;
	isVisible: boolean;
	duration?: number;
}

const AnimatedCounter: FC<AnimatedCounterProps> = ( {
	value,
	isVisible,
	duration = 2000
} ) => {
	const [ count, setCount ] = useState( 0 );
	const countRef = useRef<number>( 0 );
	const rafRef = useRef<number>( 0 );

	useEffect(
		() => {
			if ( !isVisible ) {
				setCount( 0 );
				countRef.current = 0;

				return;
			}

			const startTime = performance.now();
			const startValue = 0;
			const endValue = value;

			const updateCount = ( currentTime: number ) => {
				const elapsed = currentTime - startTime;
				const progress = Math.min(
					elapsed / duration,
					1
				);

				// Use easeOutQuad easing function for smoother animation
				const easeProgress = 1 - ( 1 - progress ) * ( 1 - progress );

				countRef.current = Math.round( startValue + ( endValue - startValue ) * easeProgress );
				setCount( countRef.current );

				if ( progress < 1 ) {
					rafRef.current = requestAnimationFrame( updateCount );
				}
			};

			rafRef.current = requestAnimationFrame( updateCount );

			return () => {
				if ( rafRef.current ) {
					cancelAnimationFrame( rafRef.current );
				}
			};
		},
		[ value, isVisible, duration ]
	);

	return <span className="text-gray-400">{count}%</span>;
};

export default AnimatedCounter;
