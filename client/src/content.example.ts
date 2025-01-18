export const web3PublicKey = "YOUR-KEY-GOES-HERE";

export const name = "David Jozwik";

export const intro: [string, string] = [
	"Building Digital",
	"Experiences"
] as const;

export const taglines: string[] = [
	"Full Stack Developer",
	"UI/UX Enthusiast",
	"Solutions Architect"
] as const;

export const nextButton = "See My Work";

export const projects: {
	title: string;
	description: string;
	tech: string[];
	link: string;
	img: string;
}[] = [
	{
		title: "Project Alpha",
		description: "A real-time data visualization dashboard built with React and D3.js",
		tech: [ "React", "D3.js", "Node.js", "WebSocket" ],
		link: "#",
		img: "hero-bg.webp"
	},
	{
		title: "Project Beta",
		description: "AI-powered content management system with natural language processing",
		tech: [ "Python", "TensorFlow", "Flask", "MongoDB" ],
		link: "#",
		img: "hero-bg.webp"
	},
	{
		title: "Project Gamma",
		description: "Cross-platform mobile app for fitness tracking and social networking",
		tech: [ "React Native", "Firebase", "Redux", "GraphQL" ],
		link: "#",
		img: "hero-bg.webp"
	}
] as const;

export const skills: {
	name: string;
	level: number;
	subSkills?: string[];
}[] = [
	{
		name: "Frontend Development",
		level: 90,
		subSkills: [ "React", "Tailwind CSS", "Three.js", "CSS/SASS", "JavaScript", "TypeScript", "Next.js", "Vue.js" ]
	},
	{
		name: "Backend Development",
		level: 85,
		subSkills: [ "Node.js", "Python", "PostgreSQL", "MongoDB", "GraphQL", "Express", "Django", "REST APIs" ]
	},
	{
		name: "DevOps",
		level: 80,
		subSkills: [ "Docker", "CI/CD", "AWS", "Kubernetes", "GitHub Actions", "Terraform", "Linux" ]
	},
	{
		name: "UI/UX Design",
		level: 80,
		subSkills: [ "Figma", "Adobe XD", "Sketch", "InVision", "User Research", "Wireframing", "Prototyping" ]
	},
	{
		name: "Mobile Development",
		level: 70,
		subSkills: [ "React Native", "Swift", "Kotlin", "Flutter", "Xamarin", "PWA" ]
	}
];
