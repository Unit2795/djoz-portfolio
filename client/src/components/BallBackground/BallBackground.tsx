import {
	ReactNode,
	useEffect,
	useRef
} from "react";

interface BallGradient {
	centerColor: string;
	edgeColor: string;
	edgeStart: number;
}

interface AnimatedBackgroundConfig {
	speedMultiplier: number;
	ballMinSize: number;
	ballMaxSize: number;
	numberOfBalls: number;
	ballGradient: BallGradient;
	backgroundColor: string;
	maxSpawnRetries: number;
}

const defaultConfig: AnimatedBackgroundConfig = {
	speedMultiplier: 0.05,
	ballMinSize: 80,
	ballMaxSize: 100,
	numberOfBalls: 8,
	ballGradient: {
		centerColor: "#1f2937",
		edgeColor: "#2e3d52",
		edgeStart: 0.6
	},
	backgroundColor: "#1f2937",
	maxSpawnRetries: 100
};

interface BallProps {
	x: number;
	y: number;
	radius: number;
	dx: number;
	dy: number;
}

class Ball implements BallProps {
	x: number;

	y: number;

	radius: number;

	dx: number;

	dy: number;

	constructor( x: number, y: number, radius: number, dx: number, dy: number ) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.dx = dx;
		this.dy = dy;
	}

	draw( ctx: CanvasRenderingContext2D, gradient: BallGradient ): void {
		const radialGradient = ctx.createRadialGradient(
			this.x,
			this.y,
			0,
			this.x,
			this.y,
			this.radius
		);
		radialGradient.addColorStop(
			0,
			gradient.centerColor
		);
		radialGradient.addColorStop(
			gradient.edgeStart,
			gradient.centerColor
		);
		radialGradient.addColorStop(
			1,
			gradient.edgeColor
		);

		ctx.beginPath();
		ctx.arc(
			this.x,
			this.y,
			this.radius,
			0,
			Math.PI * 2
		);
		ctx.fillStyle = radialGradient;
		ctx.fill();
		ctx.closePath();
	}

	checkCollision( other: Ball ): boolean {
		const dx = this.x - other.x;
		const dy = this.y - other.y;
		const distance = Math.sqrt( dx * dx + dy * dy );

		return distance < ( this.radius + other.radius );
	}

	resolveCollision( other: Ball ): void {
		const tempDx = this.dx;
		const tempDy = this.dy;
		this.dx = other.dx;
		this.dy = other.dy;
		other.dx = tempDx;
		other.dy = tempDy;
	}

	update( width: number, height: number ): void {
		this.x += this.dx;
		this.y += this.dy;

		if ( this.x - this.radius < 0 ) {
			this.x = this.radius;
			this.dx = Math.abs( this.dx );
		} else if ( this.x + this.radius > width ) {
			this.x = width - this.radius;
			this.dx = -Math.abs( this.dx );
		}

		if ( this.y - this.radius < 0 ) {
			this.y = this.radius;
			this.dy = Math.abs( this.dy );
		} else if ( this.y + this.radius > height ) {
			this.y = height - this.radius;
			this.dy = -Math.abs( this.dy );
		}
	}
}

interface AnimatedBackgroundProps {
	config?: Partial<AnimatedBackgroundConfig>;
	children: ReactNode;
}

const BallBackground = ( {
	config,
	children
}: AnimatedBackgroundProps ): JSX.Element => {
	const containerRef = useRef<HTMLDivElement | null>( null );
	const canvasRef = useRef<HTMLCanvasElement | null>( null );
	const dimensionsRef = useRef<{
		width: number;
		height: number
	}>( {
		width: 0,
		height: 0
	} );

	useEffect(
		() => {
			const canvas = canvasRef.current;
			const container = containerRef.current;
			if ( !canvas || !container ) return;

			const ctx = canvas.getContext( "2d" );
			if ( !ctx ) return;

			const finalConfig = {
				...defaultConfig,
				...config
			};

			const updateSize = (): void => {
				const dpr = window.devicePixelRatio || 1;
				const rect = container.getBoundingClientRect();

				// Store logical dimensions
				dimensionsRef.current = {
					width: rect.width,
					height: rect.height
				};

				// Set high-resolution canvas
				canvas.width = rect.width * dpr;
				canvas.height = rect.height * dpr;
				canvas.style.width = `${ rect.width }px`;
				canvas.style.height = `${ rect.height }px`;

				// Initial scale for high DPR
				ctx.scale(
					dpr,
					dpr
				);
			};

			window.addEventListener(
				"resize",
				updateSize
			);
			updateSize();

			const baseWidth = 1920;
			const baseHeight = 1080;

			const createBall = ( attempts = 0 ): Ball | null => {
				if ( attempts > finalConfig.maxSpawnRetries ) return null;

				const {
					width,
					height
				} = dimensionsRef.current;
				const viewportScale = Math.sqrt( ( width * height ) / ( baseWidth * baseHeight ) );

				const scaledMinSize = finalConfig.ballMinSize * viewportScale;
				const scaledMaxSize = finalConfig.ballMaxSize * viewportScale;
				const radius = Math.random() * ( scaledMaxSize - scaledMinSize ) + scaledMinSize;

				const x = Math.random() * ( width - radius * 2 ) + radius;
				const y = Math.random() * ( height - radius * 2 ) + radius;

				const speedScale = Math.sqrt( viewportScale );
				const speed = ( Math.random() * 2 + 1 ) * finalConfig.speedMultiplier * speedScale;
				const angle = Math.random() * Math.PI * 2;

				const newBall = new Ball(
					x,
					y,
					radius,
					Math.cos( angle ) * speed,
					Math.sin( angle ) * speed
				);

				return balls.some( existingBall => newBall.checkCollision( existingBall ) )
					? createBall( attempts + 1 )
					: newBall;
			};

			const balls: Ball[] = [];
			for ( let i = 0; i < finalConfig.numberOfBalls; i++ ) {
				const ball = createBall();
				if ( ball ) balls.push( ball );
			}

			let animationId: number;
			const animate = (): void => {
				const {
					width,
					height
				} = dimensionsRef.current;

				ctx.fillStyle = finalConfig.backgroundColor;
				ctx.fillRect(
					0,
					0,
					width,
					height
				);

				// Check for collisions
				for ( let i = 0; i < balls.length; i++ ) {
					for ( let j = i + 1; j < balls.length; j++ ) {
						if ( balls[ i ].checkCollision( balls[ j ] ) ) {
							balls[ i ].resolveCollision( balls[ j ] );
						}
					}
				}

				// Update and draw balls
				balls.forEach( ball => {
					ball.update(
						width,
						height
					);
					ball.draw(
						ctx,
						finalConfig.ballGradient
					);
				} );

				animationId = requestAnimationFrame( animate );
			};

			animate();

			return () => {
				window.removeEventListener(
					"resize",
					updateSize
				);
				cancelAnimationFrame( animationId );
			};
		},
		[ config ]
	);


	return (
		<div
			className="relative overflow-hidden"
			ref={ containerRef }>
			{children}

			<canvas
				className="absolute top-0 left-0 w-full h-full -z-10"
				ref={ canvasRef }/>
		</div>
	);
};

export default BallBackground;
