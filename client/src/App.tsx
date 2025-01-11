import {
	ChevronDown,
	ExternalLink,
	Mail
} from "lucide-react";
import GitHub from "@/components/Icons/GitHub.tsx";
import LinkedIn from "@/components/Icons/LinkedIn.tsx";
import {
	intro,
	nextButton,
	projects,
	skills,
	taglines
} from "@/content.ts";
import "./App.css";
import Navbar from "@/components/Navbar/Navbar.tsx";
import {
	useScrollSpy
} from "@/components/Navbar/useScrollSpy.ts";
import Button from "@/components/Button/Button.tsx";
import RotatingText from "@/components/RotatingText/RotatingText.tsx";
import {
	sections
} from "@/components/Navbar/types.ts";

const App = () => {
	const {
		getSectionRef
	} = useScrollSpy();

	return (
		<div className="min-h-screen bg-gray-900 text-white relative w-full">
			<div className="hero-background motion-safe:animate-fade"/>

			<Navbar/>

			<main className="relative z-10">
				{/* About Section */}
				<section
					className="min-h-screen flex flex-col items-center justify-center relative"
					id={ sections.ABOUT }
					ref={ getSectionRef( sections.ABOUT ) }>
					<div className="container mx-auto px-6 text-center my-6">

						<RotatingText
							bottom={ intro[ 1 ] }
							className="text-5xl sm:text-6xl font-bold mb-8 text-center"
							top={
								(
									<span
										className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
										{intro[ 0 ]}
									</span>
								)
							}/>

						<p
							className="sm:text-xl text-md text-gray-400 mb-8 motion-safe:animate-fadeUp"
							style={
								{
									animationDelay: "250ms",
									animationFillMode: "both"
								}
							}>
							{
								taglines.join( " • " )
							}
						</p>

						<div className="flex justify-center space-x-4 mb-8">
							<a
								className="p-2 hover:text-blue-400 transition-colors motion-safe:animate-fadeUp"
								href="#"
								style={
									{
										animationDelay: "500ms",
										animationFillMode: "both"
									}
								}>
								<GitHub/>
							</a>

							<a
								className="p-2 hover:text-blue-400 transition-colors motion-safe:animate-fadeUp"
								href="#"
								style={
									{
										animationDelay: "750ms",
										animationFillMode: "both"
									}
								}>
								<LinkedIn/>
							</a>

							<a
								className="p-2 hover:text-blue-400 transition-colors motion-safe:animate-fadeUp"
								href="#"
								style={
									{
										animationDelay: "1000ms",
										animationFillMode: "both"
									}
								}>
								<Mail size={ 24 }/>
							</a>
						</div>

						<a
							className="inline-block motion-safe:animate-fadeUp"
							href={ `#${ sections.PROJECTS }` }
							style={
								{
									animationDelay: "1000ms",
									animationFillMode: "both"
								}
							}>
							<Button className="group flex pr-4">
								<span className="pr-6 text-nowrap">{nextButton}</span>

								<ChevronDown
									className="group-hover:motion-safe:animate-bounceMid"
									size={ 24 }/>
							</Button>
						</a>
					</div>
				</section>

				{/* Projects Section */}
				<section
					className="py-20 bg-gray-800"
					id={ sections.PROJECTS }
					ref={ getSectionRef( sections.PROJECTS ) }>
					<div className="container mx-auto px-6">
						<h2 className="text-4xl font-bold mb-12 text-center">
							Featured Projects
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{
								projects.map( ( project ) => (
									<div
										className="bg-gray-700 rounded-lg hover:transform hover:scale-105 transition-transform duration-300 flex flex-col"
										key={ project.title }>
										<div className="h-32 relative shadow-lg">
											<img
												alt={ `Picture of ${ project.title }` }
												className="absolute w-full h-full object-cover rounded-lg"
												src={ project.img }/>
										</div>

										<div className="p-6 flex flex-col">
											<h3 className="text-xl font-bold mb-4">
												{project.title}
											</h3>

											<p className="text-gray-300 mb-4">
												{project.description}
											</p>

											<div className="flex flex-wrap gap-2 mb-8">
												{
													project.tech.map( ( tech ) => (
														<span
															className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
															key={ tech }>
															{tech}
														</span>
													) )
												}
											</div>

											<a
												className="inline-flex items-center text-blue-400 hover:text-blue-300 mt-auto"
												href={ project.link }>
												View Project
												<ExternalLink
													className="ml-2"
													size={ 16 }/>
											</a>
										</div>
									</div>
								) )
							}
						</div>
					</div>
				</section>

				{/* Skills Section */}
				<section
					className="py-20"
					id={ sections.SKILLS }
					ref={ getSectionRef( sections.SKILLS ) }>
					<div className="container mx-auto px-6">
						<h2 className="text-4xl font-bold mb-12 text-center">
							Skills
						</h2>

						<div className="max-w-2xl mx-auto space-y-6">
							{
								skills.map( ( skill ) => (
									<div
										className="space-y-2"
										key={ skill.name }>
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
														width: `${ skill.level.toString() }%`
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
					id={ sections.CONTACT }
					ref={ getSectionRef( sections.CONTACT ) }>
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

				{/* Footer Section */}
				<section className="flex flex-col items-center py-8">
					<p className="pl-6 text-gray-600">© {new Date().getFullYear()} David Jozwik · All rights reserved</p>

					<div className="flex items-center gap-6 pt-4">
						<a
							className="text-gray-600 hover:text-blue-400"
							href="https://github.com/yourusername">
							<GitHub/>
						</a>

						<a
							className="text-gray-600 hover:text-blue-400"
							href="https://linkedin.com/in/yourusername">
							<LinkedIn/>
						</a>

						<a
							className="text-gray-600 hover:text-blue-400"
							href="mailto:you@example.com">
							<Mail size={ 24 }/>
						</a>
					</div>
				</section>
			</main>
		</div>
	);
};

export default App;
