import {
	useEffect,
	useState
} from "react";

const Navbar = () => {
	const [ activeSection, setActiveSection ] = useState( "about" );

	useEffect(
		() => {
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
	);
};

export default Navbar;
