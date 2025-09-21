import type {
	ContactFormContent,
	FooterContent,
	IntroContent,
	NavbarContent,
	ProjectsContent,
	Sections,
	SkillsContent,
} from "@/content/types";

export const name = "David Jozwik";

export const email = "d@djoz.us";

export const description = `The personal portfolio website of ${name}`;

export const keywords = "developer, software, engineer, react, typescript, terraform, devops, API";

// If set to undefined, the availability badge will be hidden
export const showAvailability: string | undefined = "Available for new opportunities!";

export const sections: Sections = {
	INTRO: {
		id: "intro",
		navTitle: "Home",
		description: "Introduction section with a brief overview of who I am",
	},
	PROJECTS: {
		id: "projects",
		navTitle: "Projects",
		description: "Showcase of some projects I've worked on",
		hideDescription: true,
		solidBackground: true,
	},
	SKILLS: {
		id: "skills",
		navTitle: "Skills",
		description: "Overview of my professional skills",
		hideDescription: true,
	},
	CONTACT: {
		id: "contact",
		navTitle: "Contact",
		header: "Get In Touch",
		description: "I'm always open to discussing new projects and opportunities.",
		solidBackground: true,
	},
};

export const navbar: NavbarContent = {
	// Set this to undefined if you don't want a header in the navbar
	header: {
		text: name,
		// Optional size for the header, defaults to text-2xl if not provided
		// See more at https://tailwindcss.com/docs/font-size
		size: "text-2xl",
		// Optional href for the header, defaults to "#top" if not provided (will scroll back to top of page)
		href: "#top",
		ariaLabel: "Scroll back to top of page",
	},
	// Set this to undefined if you don't want any links in the navbar
	moreLinks: {
		label: "More",
		items: [
			{
				label: "Blog",
				href: "/WOOOO_Podcast.mp3",
				newTab: true,
			},
			{
				label: "Download Resume",
				href: "/David_Jozwik_Resume.pdf",
				newTab: true,
			},
		],
	},
	skipLinkText: "Skip to main content",
	ariaLabel: "Main navigation",
	hamburgerMenuAriaLabel: "Toggle navigation menu",
	mobileMenuAriaLabel: "Mobile navigation menu",
};

export const intro: IntroContent = {
	// Set this to undefined if you don't want the heading to show up
	heading: {
		top: {
			text: "Software That",
		},
		bottom: {
			text: "Respects You",
			color: "text-transparent from-primary to-secondary bg-linear-to-r bg-clip-text",
		},
	},
	// Set this to undefined if you don't want the subheading to show up
	subHeading: "Built for users <em>and</em> developers. Quality isn't just a luxury, it's a <em>catalyst.</em>",
	// Set these to undefined if you don't want the buttons to show up
	projectButton: {
		text: "View Projects",
		ariaLabel: "Scroll to projects section",
	},
	contactButton: {
		text: "Get In Touch",
		ariaLabel: "Scroll to contact section",
	},
	// Set this to undefined if you don't want any links to show up
	links: [
		{
			label: "Visit my GitHub profile",
			link: "https://github.com/Unit2795",
			icon: {
				custom: "GitHub",
			},
		},
		{
			label: "Visit my profile on LinkedIn",
			link: "https://www.linkedin.com/in/djoz/",
			icon: {
				custom: "LinkedIn",
			},
		},
		{
			label: "Copy my email",
			value: email,
			icon: {
				lucide: "Mail",
			},
		},
	],
	// Set individual fields to undefined if you don't want them to show up
	// Set entire aboutMe to undefined if you don't want the card to show up at all
	aboutMe: {
		description:
			"I'm David Jozwik, a self taught software developer that started hacking together websites for fun and made a career out of it. I've worked in a variety of industries from government to gaming as both a freelancer and full-time employee. This portfolio is a peek into my work and the philosophy behind it. <em>Welcome!</em>",
		quote: "Exceptional software does more than just work; it's a delight to build and use. Good documentation, tooling, and design expands horizons; solving problems people never knew they had.",
		stats: {
			ariaLabel: "My professional stats summary",
			items: [
				{
					title: "6+ years",
					subtitle: "Experience",
				},
				{
					title: "Remote & Onsite",
					subtitle: "Work Setting",
				},
				{
					title: "Arkansas, USA",
					subtitle: "Location",
				},
			],
		},
		highlights: {
			ariaLabel: "My key competencies and services",
			items: [
				{
					color: "bg-blue-300",
					text: "Web, Mobile, & Desktop Software",
				},
				{
					color: "bg-orange-300",
					text: "Servers, APIs, & Infrastructure",
				},
				{
					color: "bg-green-300",
					text: "Web Design & Accessibility",
				},
				{
					color: "bg-violet-300",
					text: "Quality Assurance & Technical Writing",
				},
			],
		},
		aria: {
			title: "About Me",
			description: "A brief overview of who I am and what I do",
		},
	},
};

export const projects: ProjectsContent = {
	// Set this to undefined if you don't want the "View Project" button to show up on each project card
	viewProjectText: "View Project",
	items: [
		{
			title: "Project Alpha",
			description: "A real-time data visualization dashboard built with React and D3.js",
			tags: ["React", "D3.js", "Node.js", "WebSocket"],
			link: "#",
			img: "project/placeholder.webp",
		},
		{
			title: "Project Beta",
			description: "AI-powered content management system with natural language processing",
			tags: ["Python", "TensorFlow", "Flask", "MongoDB"],
			link: "#",
			img: "project/placeholder.webp",
		},
		{
			title: "Project Gamma",
			description: "Cross-platform mobile app for fitness tracking and social networking",
			tags: ["React Native", "Firebase", "Redux", "GraphQL"],
			link: "#",
			img: "project/placeholder.webp",
		},
	],
};

export const skills: SkillsContent = [
	{
		name: "Frontend Development",
		subtitle: "Building the user interface",
		icon: {
			lucide: "Code",
		},
		level: 90,
		subSkills: ["React", "Tailwind CSS", "Three.js", "CSS/SASS", "JavaScript", "TypeScript", "Next.js", "Vue.js"],
	},
	{
		name: "Backend Development",
		subtitle: "Building the server-side logic",
		icon: {
			lucide: "Server",
		},
		level: 85,
		subSkills: ["Node.js", "Python", "PostgreSQL", "MongoDB", "GraphQL", "Express", "Django", "REST APIs"],
	},
	{
		name: "DevOps",
		subtitle: "Building and maintaining infrastructure",
		icon: {
			lucide: "Cog",
		},
		level: 80,
		subSkills: ["Docker", "CI/CD", "AWS", "Kubernetes", "GitHub Actions", "Terraform", "Linux"],
	},
	{
		name: "UI/UX Design",
		subtitle: "Designing the user experience",
		icon: {
			lucide: "Palette",
		},
		level: 80,
		subSkills: ["Figma", "Adobe XD", "Sketch", "InVision", "User Research", "Wireframing", "Prototyping"],
	},
	{
		name: "Mobile Development",
		subtitle: "Building mobile applications",
		icon: {
			lucide: "Smartphone",
		},
		level: 70,
		subSkills: ["React Native", "Swift", "Kotlin", "Flutter", "Xamarin", "PWA"],
	},
	{
		name: "Cloud Computing",
		subtitle: "Building and maintaining cloud infrastructure",
		icon: {
			lucide: "Cloud",
		},
		level: 75,
		subSkills: ["AWS", "Azure", "Google Cloud", "Serverless", "Lambda", "API Gateway"],
	},
];

export const contactForm: ContactFormContent = {
	links: [
		{
			label: "Visit my profile on LinkedIn",
			link: "https://www.linkedin.com/in/djoz/",
			icon: {
				custom: "LinkedIn",
			},
		},
		{
			label: "Copy my email",
			value: email,
			icon: {
				lucide: "Mail",
			},
		},
	],
	email: {
		label: "Email",
		placeholder: "john@example.com",
	},
	message: {
		label: "Message",
		placeholder: "Your message here...",
	},
	button: "Send Message",
	formAriaLabel: "Contact form",
	// Customize the content of the form success and error pages
	statusPages: {
		success: {
			icon: {
				lucide: "CircleCheckBig",
			},
			browserTitle: "Form Submitted!",
			browserDescription: "Confirmation page shown after a successful contact form submission.",
			title: "Thank You!",
			titleColor: intro.heading?.bottom.color,
			message: "Your message has been successfully submitted. I'll be in touch soon!",
			redirectText: "Return to Home",
			/* 
				Optional redirect link, if value is undefined, will automatically detect and redirect to root of current domain "/"
				In development, this will always be "/" (and redirects to localhost)
			*/
			redirectHref: "/",
			autoRedirectSeconds: 10,
			disableAutoRedirect: false,
		},
		error: {
			icon: {
				lucide: "OctagonAlert",
			},
			browserTitle: "Form Error",
			browserDescription: "Error page shown after a failed contact form submission.",
			title: "Oops!",
			titleColor: "bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent",
			message: `Something went wrong when trying to submit the form. Please try again later or send an email directly to <a class="text-blue-500 underline" href="mailto:${email}">${email}</a>.`,
			redirectText: "Return to Home",
			redirectHref: "/",
			autoRedirectSeconds: 10,
			disableAutoRedirect: false,
		},
	},
};

// Set this to undefined if you don't want a footer
export const footer: FooterContent | undefined = {
	items: [
		{
			label: "Portfolio handcrafted with ❤️ by David Jozwik  •  Get it for yourself for free on GitHub ↗️",
			href: "https://github.com/Unit2795/djoz-portfolio",
		},
		{
			label: `djoz.us was registered in 2013 by ${name}`,
			href: "https://www.whois.com/whois/djoz.us",
		},
	],
	disableAnalytics: false,
};

export const copyValueSuccessMessage = "Copied";

// Configure the snow effect here
export const snowConfig = {
	density: 20,
	angle: { from: 0, to: 45 },
	velocity: { from: 150, to: 250 },
	opacity: { from: 0.05, to: 0.1 },
	size: { from: 1, to: 3 },
	colors: ["#ffffff"],
};

/* 
	Disable Features
*/
// Set this to true if you want to disable the snow effect
export const disableSnow = false;
// Set this to true if you want to disable the navbar entirely
export const disableNavbar = false;
// Set this to true if you want to disable the dynamic resizing on the navbar
export const disableDynamicNavbar = false;
// Set this to true if you want to disable analytics features.
// NOTE!: Remember to also update your terraform variables to also disable deploying analytics infrastructure!
export const disableAnalytics = false;
// Set this to true if you want to disable the honeypot anti-spam feature on the contact form. If you disable this and also use the terraform deploy, ensure that you update the disable honeypot variable to 'true'.
export const disableHoneypot = false;
// Set this to true if you want to disable the dwell time cookie feature on the contact form. If you disable this and also use the terraform deploy, ensure that you update the dwell cookie name variable to empty.
export const disableDwellCookie = false;
