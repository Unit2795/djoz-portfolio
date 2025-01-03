import {
	toCapitalized
} from "@/utils/toCapitalized.ts";
import {
	useScrollSpy
} from "@/components/navbar/useScrollSpy.ts";
import {
	sectionArray
} from "@/components/navbar/types.ts";


/**
 * Navbar component that highlights the active section based on the current scroll position
 * */
const Navbar = () => {
	const {
		activeSection
	} = useScrollSpy();

	return (
		<nav className="fixed top-0 w-full bg-gray-900/50 backdrop-blur-sm z-50 drop-shadow-lg">
			<div className="container mx-auto px-6 py-4">
				<div className="flex justify-between items-center">
					<span
						className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						David Jozwik
					</span>

					<div className="space-x-6">
						{
							sectionArray.map( ( section ) => {
								return (
									<a
										className={
											`hover:text-blue-400 transition-colors ${
												activeSection === section ? "text-blue-400" : "text-gray-200"
											}`
										}
										href={ `#${ section }` }
										key={ section }>
										{toCapitalized( section )}
									</a>
								);
							} )
						}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
