export interface SnowConfig {
	// Number of particles per 200 square pixels
	density: number;
}

export interface ParticleConfig {
	// Speed of particles (pixels per second)
	// Particles will spawn at a random speed within the provided range
	velocity: {
		from: number;
		to: number;
	};
	// Angle of movement in degrees (0 = straight down, 90 = left to right, 180 = straight up, 270 = right to left)
	// Particles will spawn at a random angle within the provided range
	angle: {
		from: number;
		to: number;
	};
	// Opacity range of particles (0 = fully transparent, 1 = fully opaque)
	opacity: {
		from: number;
		to: number;
	};
	// Size range of particles (radius in pixels)
	size: {
		from: number;
		to: number;
	};
	// Array of possible hex color strings for particles
	colors: string[];
}

export type SnowEffectConfig = ParticleConfig & SnowConfig;

type SpawnSide = "top" | "left" | "bottom" | "right";

/* 
The number of pixels per target density
IE: 0.5 particles per 40000 pixels (200x200)
A density of 0.5 for a 1080p canvas (1920x1080) would result in:
0.5 * (1920 * 1080) / 40000 = 25.92 particles
*/
const PIXEL_DENSITY = 40000;
// Margin outside the canvas to spawn and despawn particles
const SPAWN_MARGIN = 20;

/* 
	Given an input HTML canvas, will produce a snow particle effect
*/
export class SnowEffect {
	private particles: Particle[] = [];
	private animationId: number | null = null;
	private lastTime: number = 0;

	constructor(
		private canvas: HTMLCanvasElement,
		private context: CanvasRenderingContext2D,
		private config: SnowEffectConfig,
	) {
		// Initialize canvas and particles
		this.updateCanvasSize();

		window.addEventListener("resize", () => this.updateCanvasSize());

		this.start();
	}

	updateCanvasSize() {
		const oldWidth = this.canvas.width;
		const oldHeight = this.canvas.height;

		const rect = this.canvas.getBoundingClientRect();
		this.canvas.width = rect.width;
		this.canvas.height = rect.height;

		// Scale current particle positions to new dimensions
		const scaleX = this.canvas.width / oldWidth;
		const scaleY = this.canvas.height / oldHeight;
		this.particles.forEach((particle) => {
			particle.x *= scaleX;
			particle.y *= scaleY;
		});

		// Update particle count based on new canvas size to achieve a desired density
		const area = this.canvas.width * this.canvas.height;
		const desiredCount = Math.ceil((this.config.density * area) / PIXEL_DENSITY);
		// (Negative = too many particles, likely scaling down), (Positive = too few particles, likely scaling up)
		const particleDeficit = desiredCount - this.particles.length;

		if (particleDeficit !== 0) {
			// If there are too few particles, add more
			if (particleDeficit > 0) {
				const { angle, velocity, opacity, size, colors } = this.config;

				// Add new particles
				for (let i = 0; i < particleDeficit; i++) {
					const particle = createParticle({
						angle,
						velocity,
						opacity,
						size,
						colors,
					});
					resetParticle(particle, { angle, velocity, opacity, size, colors }, this.canvas, true); // Initial random placement
					this.particles.push(particle);
				}
			} else if (particleDeficit < 0) {
				// Remove excess particles
				this.particles.splice(desiredCount);
			}
		}
	}

	start() {
		if (!this.animationId) {
			this.lastTime = 0; // Reset time tracking
			this.animate();
		}
	}

	stop() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}

	animate(currentTime: number = 0) {
		// Handle visibility - pause when hidden, resume when visible
		if (document.hidden) {
			// When paused, reset lastTime so we don't get a large delta when resuming
			this.lastTime = currentTime;
			this.animationId = requestAnimationFrame((time) => this.animate(time));
			return;
		}

		// Don't update particles if paused
		// Calculate delta time in seconds
		let deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0;

		// Cap delta time to prevent large jumps (max 100ms = 0.1s)
		// This prevents particle bursts when the tab regains focus
		deltaTime = Math.min(deltaTime, 0.1);

		this.lastTime = currentTime;

		// Clear and redraw
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.particles.forEach((particle) => {
			updateParticle(particle, this.canvas, deltaTime, this.config);
			drawParticle(particle, this.context);
		});

		this.animationId = requestAnimationFrame((time) => this.animate(time));
	}
}

/* 
Individual snow particle instances
*/
interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	angle: number; // In degrees
	speed: number; // In pixels per second
	opacity: number; // From 0 (transparent) to 1 (opaque)
	size: number;
	color: string; // Hex color string
}

function createParticle(config: ParticleConfig): Particle {
	const particle: Particle = {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		angle: 0,
		speed: 0,
		opacity: 0,
		size: 0,
		color: "#ffffff",
	};
	resetParticle(particle, config);
	return particle;
}

// Get spawn position for the particle based on its angle
function getParticleSpawn(particle: Particle, canvas: HTMLCanvasElement): { x: number; y: number } {
	const { width, height } = canvas;
	// Normalize angle to [0, 359]
	const normalizedAngle = ((particle.angle % 360) + 360) % 360;

	// Helper to generate a point for a given side
	const fromSide = (side: SpawnSide) =>
		({
			top: { x: Math.random() * width, y: -SPAWN_MARGIN },
			left: { x: -SPAWN_MARGIN, y: Math.random() * height },
			bottom: { x: Math.random() * width, y: height + SPAWN_MARGIN },
			right: { x: width + SPAWN_MARGIN, y: Math.random() * height },
		})[side];

	// Multiples of 90 -> single side spawns
	if (normalizedAngle % 90 === 0) {
		const singleSides: SpawnSide[] = ["top", "left", "bottom", "right"]; // 0, 90, 180, 270
		return fromSide(singleSides[normalizedAngle / 90]);
	}

	// In-between -> choose one of the two allowed sides with a coin flip
	// Quadrants: 0:[1–89], 1:[91–179], 2:[181–269], 3:[271–359]
	const quadrant = Math.floor(normalizedAngle / 90); // 0..3
	const progressIntoQuadrant = normalizedAngle % 90; // progress into this 90° quadrant
	const pairs: [SpawnSide, SpawnSide][] = [
		["top", "left"], // 1–89
		["left", "bottom"], // 91–179
		["bottom", "right"], // 181–269
		["right", "top"], // 271–359
	];
	const [first, second] = pairs[quadrant];
	// Probability increases linearly from first->second across the sector
	// e.g., in 0..90°, P(top)=1 at 0°, P(left)=1 at 90°
	const probability = progressIntoQuadrant / 90; // 0 -> favor first, 1 -> favor second
	const side = Math.random() < probability ? second : first;

	return fromSide(side);
}

function resetParticle(particle: Particle, config: ParticleConfig, canvas?: HTMLCanvasElement, randomize = false) {
	const { angle, velocity, opacity, size } = config;

	// Randomize angle and speed within provided ranges
	particle.angle = Math.round(angle.from + Math.random() * (angle.to - angle.from));
	particle.speed = velocity.from + Math.random() * (velocity.to - velocity.from);
	particle.opacity = opacity.from + Math.random() * (opacity.to - opacity.from);
	particle.size = size.from + Math.random() * (size.to - size.from);
	const randomColorIndex = Math.floor(Math.random() * config.colors.length);
	particle.color = config.colors[randomColorIndex];

	// Calculate velocity components (pixels per second)
	const angleRad = (particle.angle * Math.PI) / 180;
	particle.vx = Math.sin(angleRad) * particle.speed;
	particle.vy = Math.cos(angleRad) * particle.speed;

	if (canvas) {
		if (randomize) {
			// Random position for initial placement
			particle.x = Math.random() * canvas.width;
			particle.y = Math.random() * canvas.height;
		} else {
			// Spawn just outside the canvas based on angle
			const { x, y } = getParticleSpawn(particle, canvas);
			particle.x = x;
			particle.y = y;
		}
	}
}

function updateParticle(particle: Particle, canvas: HTMLCanvasElement, deltaTime: number, config: ParticleConfig) {
	// Update position based on time elapsed (pixels per second * seconds)
	particle.x += particle.vx * deltaTime;
	particle.y += particle.vy * deltaTime;

	// Reset if out of bounds
	const isOutOfBounds =
		particle.y < -SPAWN_MARGIN ||
		particle.y > canvas.height + SPAWN_MARGIN ||
		particle.x < -SPAWN_MARGIN ||
		particle.x > canvas.width + SPAWN_MARGIN;

	if (isOutOfBounds) {
		resetParticle(particle, config, canvas);
	}
}

function drawParticle(particle: Particle, context: CanvasRenderingContext2D) {
	context.save();
	context.globalAlpha = particle.opacity;
	context.fillStyle = particle.color;
	context.beginPath();
	context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
	context.fill();
	context.restore();
}
