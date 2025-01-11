import {
	ReactNode,
	useEffect,
	useRef
} from "react";

interface BallGradient {
	centerColor: string;
	edgeColor: string;
	edgeStart: number; // Value between 0 and 1
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
	speedMultiplier: 0.5,
	ballMinSize: 20,
	ballMaxSize: 50,
	numberOfBalls: 15,
	ballGradient: {
		centerColor: "#87CEEB",
		edgeColor: "white",
		edgeStart: 0.8
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
		// Update position first
		this.x += this.dx;
		this.y += this.dy;

		// Then check for wall collisions and correct position
		if ( this.x - this.radius < 0 ) {
			this.x = this.radius;
			this.dx = Math.abs( this.dx ); // Ensure we move right
		} else if ( this.x + this.radius > width ) {
			this.x = width - this.radius;
			this.dx = -Math.abs( this.dx ); // Ensure we move left
		}

		if ( this.y - this.radius < 0 ) {
			this.y = this.radius;
			this.dy = Math.abs( this.dy ); // Ensure we move down
		} else if ( this.y + this.radius > height ) {
			this.y = height - this.radius;
			this.dy = -Math.abs( this.dy ); // Ensure we move up
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
}: AnimatedBackgroundProps ) => {
	const canvasRef = useRef<HTMLCanvasElement | null>( null );

	useEffect(
		() => {
			const canvas = canvasRef.current;
			if ( !canvas ) return;

			const ctx = canvas.getContext( "2d" );
			if ( !ctx ) return;

			const finalConfig = {
				...defaultConfig,
				...config
			};

			const updateSize = (): void => {
				const dpr = window.devicePixelRatio || 1;
				const rect = canvas.getBoundingClientRect();

				canvas.width = rect.width * dpr;
				canvas.height = rect.height * dpr;
				ctx.scale(
					dpr,
					dpr
				);

				canvas.style.width = `${ rect.width.toString() }px`;
				canvas.style.height = `${ rect.width.toString() }px`;
			};

			window.addEventListener(
				"resize",
				updateSize
			);
			updateSize();

			const createBall = ( attempts = 0 ): Ball | null => {
				if ( attempts > finalConfig.maxSpawnRetries ) return null;

				// Calculate viewport-based scale factors
				const baseWidth = 1920; // Base width for scaling
				const baseHeight = 1080; // Base height for scaling
				const viewportScale = Math.sqrt(
					( canvas.width * canvas.height ) / ( baseWidth * baseHeight )
				);

				// Scale ball sizes based on viewport
				const scaledMinSize = finalConfig.ballMinSize * viewportScale;
				const scaledMaxSize = finalConfig.ballMaxSize * viewportScale;

				// Scale speed based on viewport
				const speedScale = Math.sqrt( viewportScale ); // Use sqrt for less aggressive speed scaling

				const radius = Math.random() * ( scaledMaxSize - scaledMinSize ) + scaledMinSize;
				const x = Math.random() * ( canvas.width - radius * 2 ) + radius;
				const y = Math.random() * ( canvas.height - radius * 2 ) + radius;
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
				ctx.fillStyle = finalConfig.backgroundColor;
				ctx.fillRect(
					0,
					0,
					canvas.width,
					canvas.height
				);

				const scale = window.devicePixelRatio || 1;
				ctx.save();
				ctx.scale(
					1 / scale,
					1 / scale
				);

				// Check for collisions between all pairs of balls
				for ( let i = 0; i < balls.length; i++ ) {
					for ( let j = i + 1; j < balls.length; j++ ) {
						if ( balls[ i ].checkCollision( balls[ j ] ) ) {
							balls[ i ].resolveCollision( balls[ j ] );
						}
					}
				}

				// Update and draw all balls
				balls.forEach( ball => {
					ball.update(
						canvas.width / scale,
						canvas.height / scale
					);
					ball.draw(
						ctx,
						finalConfig.ballGradient
					);
				} );

				ctx.restore();
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
		<div className="relative overflow-hidden">
			{children}

			<canvas
				className="absolute top-0 left-0 w-full h-full -z-10"
				ref={ canvasRef }/>
		</div>
	);
};

export default BallBackground;
