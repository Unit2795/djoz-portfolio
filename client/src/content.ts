export const name = "David Jozwik";

export const intro: [string, string] = [
	"Building Digital",
	"Experiences"
];

export const taglines = [
	"Full Stack Developer",
	"UI/UX Enthusiast",
	"DevOps Specialist"
];

export const nextButton = "See My Work";

export const projects = [
	{
		title: "Project Alpha",
		description: "A real-time data visualization dashboard built with React and D3.js",
		tech: [ "React", "D3.js", "Node.js", "WebSocket" ],
		link: "#"
	},
	{
		title: "Project Beta",
		description: "AI-powered content management system with natural language processing",
		tech: [ "Python", "TensorFlow", "Flask", "MongoDB" ],
		link: "#"
	},
	{
		title: "Project Gamma",
		description: "Cross-platform mobile app for fitness tracking and social networking",
		tech: [ "React Native", "Firebase", "Redux", "GraphQL" ],
		link: "#"
	}
];

export const skills = [
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
