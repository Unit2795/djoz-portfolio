import {
	MouseEvent,
	ReactNode,
	useRef,
	useState
} from "react";
import clsx from "clsx";

const Card3D = ( {
	children
}: {
	children: ReactNode
} ) => {
	const [ rotation, setRotation ] = useState( {
		x: 0,
		y: 0
	} );
	const [ lightPosition, setLightPosition ] = useState( {
		x: 50,
		y: 50
	} );
	const [ isHovered, setIsHovered ] = useState( false );
	const containerRef = useRef<HTMLDivElement>( null );

	const handleMouseMove = ( e: MouseEvent<HTMLDivElement> ) => {
		const container = containerRef.current;
		if ( !container ) return;

		const rect = container.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Rotation calculations
		const rotateX = ( ( mouseY / rect.height ) - 0.5 ) * -20; // Max ±10° rotation
		const rotateY = ( ( mouseX / rect.width ) - 0.5 ) * 20;

		// Light position (percentages for gradient)
		const posX = ( ( mouseX / rect.width ) * 100 ).toFixed( 1 );
		const posY = ( ( mouseY / rect.height ) * 100 ).toFixed( 1 );

		setRotation( {
			x: rotateX,
			y: rotateY
		} );
		setLightPosition( {
			x: Number( posX ),
			y: Number( posY )
		} );
	};

	const handleMouseEnter = () => {
		setIsHovered( true );
	};
	const handleMouseLeave = () => {
		setIsHovered( false );
		setRotation( {
			x: 0,
			y: 0
		} ); // Reset rotation smoothly
	};

	return (
		<div
			className="w-full h-full flex items-center justify-center min-h-screen"
			ref={ containerRef }
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
			onMouseMove={ handleMouseMove }>
			<div
				className={
					clsx(
						"bg-white/[.01] rounded-2xl shadow-xl p-6 backdrop-blur-sm relative overflow-hidden transform transition-transform duration-500",
						isHovered && "duration-0"
					)
				}
				style={
					{
						transform: `perspective(1000px) rotateX(${ rotation.x.toString() }deg) rotateY(${ rotation.y.toString() }deg)`,
					}
				}>
				{/* Shine Layer */}
				<div
					className="absolute inset-0 rounded-2xl pointer-events-none"
					style={
						{
							background: `radial-gradient(circle at ${ lightPosition.x.toString() }% ${ lightPosition.y.toString() }%, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0) 80%)`,
							mixBlendMode: "screen",
							transition: isHovered ? "none" : "background 0.5s ease-out",
						}
					}/>

				{/* Card Content */}
				<div className="relative z-10 space-y-4">{children}</div>
			</div>
		</div>
	);
};

export default Card3D;
