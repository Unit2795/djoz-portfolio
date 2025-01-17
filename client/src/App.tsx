import {
	ChevronDown,
	ExternalLink,
	Mail
} from "lucide-react";
import GitHub from "@/components/Icons/GitHub.tsx";
import LinkedIn from "@/components/Icons/LinkedIn.tsx";
import {
	intro,
	name,
	nextButton,
	projects,
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
import SkillMatrix from "@/components/SkillMatrix/SkillMatrix.tsx";

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
								aria-label="Visit my GitHub profile"
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
								aria-label="Visit my LinkedIn profile"
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
								aria-label="Send me an email"
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
							aria-label="Scroll to projects section"
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
									<a
										aria-label={ `Visit ${ project.title } project homepage` }
										className="group"
										href={ project.link }
										key={ project.title }>
										<div className="rounded-xl overflow-hidden duration-300 transition-all cursor-pointer bg-gray-700/50 h-full flex flex-col">
											<img
												alt={ `Picture of ${ project.title }` }
												className="h-32 rounded-lg object-cover object-top shadow-lg"
												src={ project.img }/>

											<div className="p-6 flex flex-col flex-1">
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

												<p
													className="inline-flex items-center text-blue-400 group-hover:text-blue-300 mt-auto">
													View Project
													<ExternalLink
														className="ml-2"
														size={ 16 }/>
												</p>
											</div>
										</div>
									</a>
								) )
							}
						</div>
					</div>
				</section>

				{/* Skills Section */}
				<SkillMatrix/>

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
							aria-label="Send me an email"
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
					<p className="pl-6 text-gray-400">{name} · All rights reserved</p>
				</section>
			</main>
		</div>
	);
};

export default App;
