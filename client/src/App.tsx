import {
	useEffect,
	useState
} from "react";
import {
	ChevronDown,
	ExternalLink,
	Mail
} from "lucide-react";
import GitHub from "@/components/icons/GitHub.tsx";
import LinkedIn from "@/components/icons/LinkedIn.tsx";
import {
	projects,
	skills
} from "@/content.ts";
import {
	clsx
} from "clsx";
import "./App.css";

const App = () => {
	const [ isVisible, setIsVisible ] = useState( false );
	const [ activeSection, setActiveSection ] = useState( "about" );

	useEffect(
		() => {
			setIsVisible( true );

			const handleScroll = () => {
				const sections = [ "about", "projects", "skills", "contact" ];
				const current = sections.find( section => {
					const element = document.getElementById( section );
					if ( element ) {
						const rect = element.getBoundingClientRect();

						return rect.top >= 0 && rect.top <= window.innerHeight / 2;
					}

					return false;
				} );
				if ( current ) {
					setActiveSection( current );
				}
			};

			window.addEventListener(
				"scroll",
				handleScroll
			);

			return () => {
				window.removeEventListener(
					"scroll",
					handleScroll
				);
			};
		},
		[]
	);


	return (
		<div className="min-h-screen bg-gray-900 text-white">
			{/* Navigation */}
			<nav className="fixed top-0 w-full bg-gray-900/50 backdrop-blur-sm z-50 drop-shadow-lg">
				<div className="container mx-auto px-6 py-4">
					<div className="flex justify-between items-center">
						<span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">David Jozwik</span>

						<div className="space-x-6">
							{
								[ "About", "Projects", "Skills", "Contact" ].map( ( item ) => (
									<a
										className={
											`hover:text-blue-400 transition-colors ${
												activeSection === item.toLowerCase() ? "text-blue-400" : ""
											}`
										}
										href={ `#${ item.toLowerCase() }` }
										key={ item }>
										{item}
									</a>
								) )
							}
						</div>
					</div>
				</div>
			</nav>

			{/* About Section */}
			<section
				className={
					`hero min-h-screen flex items-center justify-center pt-20 transition-opacity duration-1000 ${
						isVisible ? "opacity-100" : "opacity-0"
					}`
				}
				id="about">
				<div className="container mx-auto px-6 text-center hero-content">
					<h1 className="text-6xl font-bold mb-6">
						<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
							Building Digital
						</span>

						<br />
						Experiences
					</h1>

					<p className="text-xl text-gray-400 mb-8">
						Full Stack Developer • UI/UX Enthusiast • Open Source Contributor
					</p>

					<div className="flex justify-center space-x-4">
						<a
							className="p-2 hover:text-blue-400 transition-colors"
							href="#">
							<GitHub />
						</a>

						<a
							className="p-2 hover:text-blue-400 transition-colors"
							href="#">
							<LinkedIn />
						</a>

						<a
							className="p-2 hover:text-blue-400 transition-colors"
							href="#">
							<Mail size={ 24 } />
						</a>
					</div>

					<div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
						<ChevronDown size={ 24 } />
					</div>
				</div>
			</section>

			{/* Projects Section */}
			<section
				className="py-20 bg-gray-800"
				id="projects">
				<div className="container mx-auto px-6">
					<h2 className="text-4xl font-bold mb-12 text-center">
						Featured Projects
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{
							projects.map( ( project, index ) => (
								<div
									className="bg-gray-700 rounded-lg p-6 hover:transform hover:scale-105 transition-transform duration-300"
									key={ index }>
									<h3 className="text-xl font-bold mb-4">
										{project.title}
									</h3>

									<p className="text-gray-300 mb-4">
										{project.description}
									</p>

									<div className="flex flex-wrap gap-2 mb-4">
										{
											project.tech.map( ( tech, techIndex ) => (
												<span
													className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
													key={ techIndex }>
													{tech}
												</span>
											) )
										}
									</div>

									<a
										className="inline-flex items-center text-blue-400 hover:text-blue-300"
										href={ project.link }>
										View Project
										{" "}

										<ExternalLink
											className="ml-2"
											size={ 16 }/>
									</a>
								</div>
							) )
						}
					</div>
				</div>
			</section>

			{/* Skills Section */}
			<section
				className="py-20"
				id="skills">
				<div className="container mx-auto px-6">
					<h2 className="text-4xl font-bold mb-12 text-center">
						Skills
					</h2>

					<div className="max-w-2xl mx-auto space-y-6">
						{
							skills.map( ( skill, index ) => (
								<div
									className="space-y-2"
									key={ index }>
									<div className="flex justify-between">
										<span className="font-medium">
											{skill.name}
										</span>

										<span className="text-gray-400">
											{skill.level}
											%
										</span>
									</div>

									<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
										<div
											className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000"
											style={
												{
													width: `${ skill.level }%`
												}
											}/>
									</div>
								</div>
							) )
						}
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section
				className="py-20 bg-gray-800"
				id="contact">
				<div className="container mx-auto px-6 text-center">
					<h2 className="text-4xl font-bold mb-8">
						Get In Touch
					</h2>

					<p className="text-xl text-gray-400 mb-8">
						I'm always open to discussing new projects and opportunities.
					</p>

					<a
						className="inline-flex items-center bg-gradient-to-r from-blue-400 to-purple-500 text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
						href="mailto:contact@example.com">
						Say Hello
						<Mail
							className="ml-2"
							size={ 20 }/>
					</a>
				</div>
			</section>
		</div>
	);
};

export default App;
