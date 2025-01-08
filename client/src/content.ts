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
		img: "hero-bg.jpg"
	},
	{
		title: "Project Beta",
		description: "AI-powered content management system with natural language processing",
		tech: [ "Python", "TensorFlow", "Flask", "MongoDB" ],
		link: "#",
		img: "hero-bg.jpg"
	},
	{
		title: "Project Gamma",
		description: "Cross-platform mobile app for fitness tracking and social networking",
		tech: [ "React Native", "Firebase", "Redux", "GraphQL" ],
		link: "#",
		img: "hero-bg.jpg"
	}
] as const;

export const skills: {
	name: string;
	level: number;
}[] = [
	{
		name: "Frontend Development",
		level: 90
	},
	{
		name: "Backend Development",
		level: 85
	},
	{
		name: "DevOps",
		level: 75
	},
	{
		name: "UI/UX Design",
		level: 80
	},
	{
		name: "Mobile Development",
		level: 70
	}
];

export const sections = {
	ABOUT: "about",
	PROJECTS: "projects",
	SKILLS: "skills",
	CONTACT: "contact"
} as const;
