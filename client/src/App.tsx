import {
	ChevronDown,
	ExternalLink
} from "lucide-react";
import {
	footerLink,
	intro,
	links,
	name,
	nextButton,
	projects,
	showAvailability,
	taglines
} from "@/content.tsx";
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
import ContactForm from "@/components/ContactForm/ContactForm.tsx";
import CopyValue from "@/components/CopyValue/CopyValue.tsx";
import AvailabilityBadge from "@/components/AvailabilityBadge/AvailabilityBadge.tsx";

const App = () => {
	const {
		getSectionRef
	} = useScrollSpy();


	return (
		<div className="min-h-screen bg-gray-900 text-white relative w-full">
			{
				showAvailability ? <AvailabilityBadge/> : null
			}

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
										className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
										{intro[ 0 ]}
									</span>
								)
							}/>

						<p
							className="sm:text-xl text-md text-gray-400 mb-8 motion-safe:animate-fade-up"
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
							{
								links.map( ( {
									link,
									value,
									icon,
									label
								}, i ) => {
									const delay = i * 250 + 500;
									if ( link ) {
										return (
											<a
												aria-label={ label }
												className="p-2 hover:text-blue-400 transition-colors motion-safe:animate-fade-up"
												href={ link }
												key={ link }
												rel="noreferrer"
												style={
													{
														animationDelay: `${ String( delay ) }ms`,
														animationFillMode: "both"
													}
												}
												target="_blank">
												{icon}
											</a>
										);
									} else if ( value ) {
										return (
											<CopyValue
												animationDelay={ delay }
												icon={ icon }
												key={ value }
												label={ label }
												value={ value }/>
										);
									}
								} )
							}
						</div>

						<a
							aria-label="Scroll to projects section"
							className="inline-block motion-safe:animate-fade-up"
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
									className="motion-safe:group-hover:animate-bounce-mid"
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

						<ContactForm/>
					</div>
				</section>

				{/* Footer Section */}
				<section className="flex flex-col items-center mx-8 text-center my-14">
					<p className="text-gray-400">{name} · All rights reserved</p>

					{
						footerLink
							? (
								<a
									className="mt-4 text-blue-400 underline"
									href={ footerLink.href }
									rel="noreferrer"
									target="_blank">
									{footerLink.label}
								</a>
							)
							: null
					}
				</section>
			</main>
		</div>
	);
};

export default App;
