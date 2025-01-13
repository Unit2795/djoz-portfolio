import {
	sections
} from "@/components/Navbar/types.ts";
import {
	skills
} from "@/content.ts";
import {
	useScrollSpy
} from "@/components/Navbar/useScrollSpy.ts";
import {
	useIntersectionObserver
} from "@/utils/useIntersectionObserver.ts";
import clsx from "clsx";
import mergeRefs from "@/utils/mergeRefs.ts";
import AnimatedCounter from "@/components/SkillMatrix/AnimatedCounter.tsx";
import {
	useEffect,
	useState
} from "react";

const SkillMatrix = () => {
	const {
		getSectionRef
	} = useScrollSpy();
	const {
		elementRef,
		isIntersecting
	} = useIntersectionObserver<HTMLElement>( {
		threshold: 0.4,
	} );
	const [ revealed, setRevealed ] = useState( false );

	useEffect(
		() => {
			if ( isIntersecting && !revealed ) {
				setRevealed( true );
			}
		},
		[ isIntersecting, revealed ]
	);

	return (
		<section
			className="py-20"
			id={ sections.SKILLS }
			ref={
				mergeRefs(
					getSectionRef( sections.SKILLS ),
					elementRef
				)
			}>
			<div className="container mx-auto px-6">
				<h2 className="text-4xl font-bold mb-12 text-center">
					Skills
				</h2>

				<div className="max-w-2xl mx-auto space-y-6">
					{
						skills.map( ( skill, i ) => {
							const delay = 1500 + ( i * 300 );

							return (
								<div
									className="space-y-2"
									key={ skill.name }>
									<div className="flex justify-between">
										<span className="font-medium">
											{skill.name}
										</span>

										<AnimatedCounter
											duration={ delay }
											isVisible={ revealed }
											value={ skill.level }/>
									</div>

									<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
										<div
											className={
												clsx(
													"h-full bg-gradient-to-r from-primary to-secondary transition-all transform origin-left rounded-full",
													revealed ? "scale-x-100" : "scale-x-0",

												)
											}
											style={
												{
													transitionDuration: `${ delay.toString() }ms`,
													width: `${ skill.level.toString() }%`
												}
											}/>
									</div>
								</div>
							);
						} )
					}
				</div>
			</div>
		</section>
	);
};

export default SkillMatrix;
