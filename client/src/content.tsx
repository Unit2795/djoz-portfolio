import {
	Mail
} from "lucide-react";
import {
	ReactNode
} from "react";
import GitHub from "./components/Icons/GitHub";
import LinkedIn from "./components/Icons/LinkedIn";

export const name = "Your Name";

// If you want to display your email on the website, set it here
export const email: string | null = "youremail@example.com";

// Set this to null if you don't want a footer link
export const footerLink: {
	label: string;
	href: string;
} | null = {
	label: "Handcrafted with ❤️ by David Jozwik  •  View on GitHub ↗️",
	href: "https://github.com/Unit2795/djoz-portfolio"
};

// If you want to display your availability on the website, set it here
export const showAvailability: string | null = "Available for new opportunities!";

export const description = `The personal portfolio website of ${ name }`;

export const keywords = "developer, software, engineer, react, typescript, aws, devops, python, API design, ui/ux, machine learning";

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

export const contactFormSuccess = "Thank you for your message! I'll get back to you soon.";
export const contactFormError = `An error occurred when trying to send your message, please try again later or send an email to ${ email }`;

export const links: {
	label: string;
	icon: ReactNode;
	// If a link is provided, an anchor tag will be used
	link?: string;
	// If a value is provided, a copy button will be used
	value?: string;
}[] = [
	{
		label: "Visit my GitHub",
		link: "https://github.com/YourGitHub",
		icon: <GitHub/>
	},
	{
		label: "Connect with me on LinkedIn",
		link: "https://www.linkedin.com/in/yourlinkedin/",
		icon: <LinkedIn/>
	},
	{
		label: "Send me an email",
		value: email,
		icon: <Mail size={ 24 }/>
	}
];

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
		img: "project/placeholder.webp"
	},
	{
		title: "Project Beta",
		description: "AI-powered content management system with natural language processing",
		tech: [ "Python", "TensorFlow", "Flask", "MongoDB" ],
		link: "#",
		img: "project/placeholder.webp"
	},
	{
		title: "Project Gamma",
		description: "Cross-platform mobile app for fitness tracking and social networking",
		tech: [ "React Native", "Firebase", "Redux", "GraphQL" ],
		link: "#",
		img: "project/placeholder.webp"
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
