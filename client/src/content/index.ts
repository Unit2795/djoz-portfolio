import type {
	ContactFormContent,
	FooterContent,
	IntroContent,
	NavbarContent,
	ProjectsContent,
	Sections,
	SkillsContent,
} from "@/content/types";

export const title = "Your Name - Your Profession";

export const name = "Your Name";

export const email = "youremail@example.com";

export const description = `Your Profession based in Your Location. I specialize in Your Specializations with a focus on Your Focus Areas.`;

// If set to undefined, the availability badge will be hidden
export const showAvailability: string | undefined = "Available for new opportunities!";

export const sections: Sections = {
	INTRO: {
		id: "intro",
		navTitle: "Home",
		description: "Introduction of Your Name, a Your Profession specializing in Your Specializations.",
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
	},
	// Set this to undefined if you don't want any links in the navbar
	moreLinks: {
		label: "More",
		items: [
			{
				label: "Blog",
				href: "/blog",
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
			text: "Quality Software",
		},
		bottom: {
			text: "Crafted with Care",
			color: "text-transparent from-primary to-secondary bg-linear-to-r bg-clip-text",
		},
	},
	// Set this to undefined if you don't want the subheading to show up
	subHeading: "Fast for machines <em>and</em> humans. Speed isn’t just convenience, it’s a <em>foundation.</em>",
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
			label: "GitHub profile of Your Name",
			link: "https://github.com/Unit2795",
			icon: {
				custom: "GitHub",
			},
			analyticsLabel: "GitHub",
		},
		{
			label: "LinkedIn profile of Your Name",
			link: "https://www.linkedin.com/in/djoz/",
			icon: {
				custom: "LinkedIn",
			},
			analyticsLabel: "LinkedIn",
		},
		{
			label: "Copy my email",
			value: email,
			icon: {
				lucide: "Mail",
			},
			analyticsLabel: "Email",
		},
	],
	// Set individual fields to undefined if you don't want them to show up
	// Set entire aboutMe to undefined if you don't want the card to show up at all
	aboutMe: {
		description:
			"I’m Your Name, a Your Profession with a passion for building and sharing ideas. Over the years I’ve explored projects ranging from small experiments to large-scale collaborations. This portfolio is a snapshot of my journey and the values that shape my work. <em>Thanks for visiting!</em>",
		quote: "Great ideas don’t just answer questions; they inspire new ones. The right mix of curiosity, persistence, and creativity can turn small sparks into lasting impact.",
		stats: {
			ariaLabel: "My professional stats summary",
			items: [
				{
					title: "12+ years",
					subtitle: "Experience",
				},
				{
					title: "2M+ Users",
					subtitle: "Served",
				},
				{
					title: "100+ Projects",
					subtitle: "Delivered",
				},
			],
		},
		highlights: {
			ariaLabel: "My key competencies and services",
			items: [
				{
					color: "bg-red-300",
					text: "Photography & Visual Arts",
				},
				{
					color: "bg-yellow-300",
					text: "Writing & Storytelling",
				},
				{
					color: "bg-teal-300",
					text: "Travel & Exploration",
				},
				{
					color: "bg-purple-300",
					text: "Science & Learning",
				},
			],
		},
		aria: {
			title: "About Me",
			description: "Card with information about my background, skills, and interests.",
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
			analyticsLabel: "Alpha",
		},
		{
			title: "Project Beta",
			description: "AI-powered content management system with natural language processing",
			tags: ["Python", "TensorFlow", "Flask", "MongoDB"],
			link: "#",
			img: "project/placeholder.webp",
			analyticsLabel: "Beta",
		},
		{
			title: "Project Gamma",
			description: "Cross-platform mobile app for fitness tracking and social networking",
			tags: ["React Native", "Firebase", "Redux", "GraphQL"],
			link: "#",
			img: "project/placeholder.webp",
			analyticsLabel: "Gamma",
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
		subSkills: ["React", "Tailwind CSS", "Three.js", "CSS/SASS", "JavaScript", "TypeScript", "Next.js", "Vue.js"],
		analyticsLabel: "Frontend",
	},
	{
		name: "Backend Development",
		subtitle: "Building the server-side logic",
		icon: {
			lucide: "Server",
		},
		subSkills: ["Node.js", "Python", "PostgreSQL", "MongoDB", "GraphQL", "Express", "Django", "REST APIs"],
		analyticsLabel: "Backend",
	},
	{
		name: "DevOps",
		subtitle: "Building and maintaining infrastructure",
		icon: {
			lucide: "Cog",
		},
		subSkills: ["Docker", "CI/CD", "AWS", "Kubernetes", "GitHub Actions", "Terraform", "Linux"],
		analyticsLabel: "DevOps",
	},
	{
		name: "UI/UX Design",
		subtitle: "Designing the user experience",
		icon: {
			lucide: "Palette",
		},
		subSkills: ["Figma", "Adobe XD", "Sketch", "InVision", "User Research", "Wireframing", "Prototyping"],
		analyticsLabel: "Design",
	},
	{
		name: "Mobile Development",
		subtitle: "Building mobile applications",
		icon: {
			lucide: "Smartphone",
		},
		subSkills: ["React Native", "Swift", "Kotlin", "Flutter", "Xamarin", "PWA"],
		analyticsLabel: "Mobile",
	},
	{
		name: "Cloud Computing",
		subtitle: "Building and maintaining cloud infrastructure",
		icon: {
			lucide: "Cloud",
		},
		subSkills: ["AWS", "Azure", "Google Cloud", "Serverless", "Lambda", "API Gateway"],
		analyticsLabel: "Cloud",
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
			analyticsLabel: "LinkedIn",
		},
		{
			label: "Copy my email",
			value: email,
			icon: {
				lucide: "Mail",
			},
			analyticsLabel: "Email",
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
	buttonSending: "Sending...",
	formAriaLabel: "Contact form",
	errorMessage: "An error occurred while submitting the form. Please try again later.",
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
			label: "Portfolio Handcrafted by David Jozwik • Open source on GitHub ↗️",
			href: "https://github.com/Unit2795/djoz-portfolio",
		},
	],
	disableAnalytics: false,
};

export const copyValue = {
	successMessage: "Copied",
	dialogAriaLabel: "Copy text",
	inputAriaLabel: "Press Enter or click to copy, or use keyboard copy.",
};

// Configure the snow effect here
export const snowConfig = {
	density: 20,
	angle: { from: 0, to: 45 },
	velocity: { from: 150, to: 250 },
	opacity: { from: 0.05, to: 0.1 },
	size: { from: 1, to: 3 },
	colors: ["#ffffff"],
};

export const formSuccessPath = "/form-success.html";

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
