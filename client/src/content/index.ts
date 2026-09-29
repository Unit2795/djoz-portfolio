import type {
	ContactFormContent,
	FooterContent,
	FormStatePage,
	IntroContent,
	NavbarContent,
	ProjectsContent,
	Sections,
	ShareImage,
	SkillsContent,
	WebManifestContent,
} from "@/content/types";

export const name = "Your Name";

// Also used as the job title in the Person structured data (JSON-LD)
export const jobTitle = "Your Profession";

export const title = `${name} - ${jobTitle}`;

export const email = "youremail@example.com";

export const description = `Your Profession based in Your Location. I specialize in Your Specializations with a focus on Your Focus Areas.`;

// Social share preview image (Open Graph / Twitter card). The file lives in `public/`, the path is relative to the site root.
// Set to undefined to leave the image tags out
export const shareImage: ShareImage | undefined = {
	path: "/og-image.png",
	alt: `Preview of ${name}'s portfolio`,
	width: 1200,
	height: 630,
};

// Generates site.webmanifest, which uses `name` as its name
export const webManifest: WebManifestContent = {
	shortName: "Portfolio",
	themeColor: "#1f2937",
	backgroundColor: "#1f2937",
};

// If set to undefined, the availability badge will be hidden
export const showAvailability: string | undefined = "Available for new opportunities!";

export const sections: Sections = {
	INTRO: {
		id: "intro",
		navTitle: "Home",
		// Visually hidden (the Intro section hides its header), read by screen readers as the section heading
		header: "Introduction",
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
	},
	contactButton: {
		text: "Get In Touch",
	},
	// Set this to undefined if you don't want any links to show up
	links: [
		{
			label: "GitHub profile of Your Name",
			link: "https://github.com/your-username",
			icon: {
				custom: "GitHub",
			},
			analyticsLabel: "GitHub",
		},
		{
			label: "LinkedIn profile of Your Name",
			link: "https://www.linkedin.com/in/your-username/",
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
	// The form's id in your contact-api config repo's forms.json. CloudFront forwards /api/contact/* to contact-api.
	formId: "portfolio-contact",
	links: [
		{
			label: "Visit my profile on LinkedIn",
			link: "https://www.linkedin.com/in/your-username/",
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
		hint: "12–2000 characters",
		// Keep in sync with the form's messageMin/messageMax in forms.json (these are contact-api's defaults)
		minLength: 12,
		maxLength: 2000,
	},
	button: "Send Message",
	buttonSending: "Sending...",
	formAriaLabel: "Contact form",
	errorMessage: "An error occurred while submitting the form. Please try again later.",
	// See contact-api's docs/connect.md (Responses) for every reason
	reasonMessages: {
		too_soon:
			"For security reasons, your submission was too fast to process. Please wait a few seconds and try again.",
		stamp_missing: "Please enable cookies, reload the page and try again.",
		stamp_invalid: "Please enable cookies, reload the page and try again.",
		stamp_expired: "The form has expired. Please reload the page and try again.",
		invalid_email: "The email address you entered is not valid. Please check and try again.",
		invalid_message: "Your message is too short or too long. Please check its length and try again.",
		ip_limit: "You've reached today's message limit. Please try again tomorrow.",
		form_limit: `The contact form has reached its monthly limit. Please email me directly at ${email}.`,
	},
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
			// Keep the recovery info (email link) on screen instead of redirecting away from it
			disableAutoRedirect: true,
		},
	},
};

// Content of the 404 page (served by CloudFront for unknown URLs)
export const notFoundPage: FormStatePage = {
	icon: {
		lucide: "Compass",
	},
	browserTitle: "Page Not Found",
	browserDescription: "The requested page could not be found.",
	title: "404",
	titleColor: intro.heading?.bottom.color,
	message: "The page you're looking for doesn't exist or may have moved.",
	redirectText: "Return to Home",
	redirectHref: "/",
	disableAutoRedirect: true,
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
// Set this to true to leave the honeypot fields out of the contact form. contact-api still checks the honeypot names in its forms.json, so nothing else changes.
export const disableHoneypot = false;
// Set this to true to stop loading /api/stamp.gif. contact-api rejects every submission without its stamp cookie, so only disable this if the contact form is unused.
export const disableDwellCookie = false;
