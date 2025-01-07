import {
	toCapitalized
} from "@/utils/toCapitalized.ts";
import {
	useScrollSpy
} from "@/components/Navbar/useScrollSpy.ts";
import {
	sectionArray
} from "@/components/Navbar/types.ts";
import {
	name
} from "@/content.ts";
import {
	useEffect,
	useRef,
	useState
} from "react";
import {
	Menu,
	X
} from "lucide-react";
import clsx from "clsx";


/**
 * Navbar component that highlights the active section based on the current scroll position
 * */
const Navbar = () => {
	const {
		activeSection
	} = useScrollSpy();

	const navbar = useRef<null | HTMLElement>( null );
	const scrollThreshold = 200; // Distance over which the scroll animation occurs
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );


	// Close the mobile menu when clicking outside of it
	useEffect(
		() => {
			const handleClickOutside = ( event: MouseEvent | TouchEvent ) => {
				if ( navbar.current && event.target && !navbar.current.contains( event.target as Node ) ) {
					setIsMenuOpen( false );
				}
			};

			// Only add the event listener if the menu is open
			if ( isMenuOpen ) {
				document.addEventListener(
					"mousedown",
					handleClickOutside
				);
				document.addEventListener(
					"touchstart",
					handleClickOutside
				);
			} else {
				document.removeEventListener(
					"mousedown",
					handleClickOutside
				);
				document.removeEventListener(
					"touchstart",
					handleClickOutside
				);
			}

			return () => {
				document.removeEventListener(
					"mousedown",
					handleClickOutside
				);
				document.removeEventListener(
					"touchstart",
					handleClickOutside
				);
			};
		},
		[ isMenuOpen ]
	);

	useEffect(
		() => {
			function updateNavbarSize() {
				window.requestAnimationFrame( () => {
					if ( !navbar.current ) return;

					const scrollPosition = window.scrollY;
					const progress = Math.min(
						scrollPosition / scrollThreshold,
						1
					);

					// Initial and final values for each property
					const initialWidth = 80; // 80%
					const finalWidth = 100; // 100%
					const initialTop = 24; // 24px
					const finalTop = 0; // 0px
					const initialRadius = 8; // 8px
					const finalRadius = 0; // 0px

					// Interpolate between initial and final values
					const currentWidth = initialWidth + ( finalWidth - initialWidth ) * progress;
					const currentTop = initialTop + ( finalTop - initialTop ) * progress;
					const currentRadius = initialRadius + ( finalRadius - initialRadius ) * progress;

					// Apply the interpolated values
					const {
						style
					} = navbar.current;
					style.width = `${ currentWidth.toString() }%`;
					style.top = `${ currentTop.toString() }px`;
					style.borderRadius = `${ currentRadius.toString() }px`;

					// Also interpolate the max-width
					const initialMaxWidth = 800; // 800px
					const finalMaxWidth = window.innerWidth; // full viewport width
					const currentMaxWidth = initialMaxWidth + ( finalMaxWidth - initialMaxWidth ) * progress;
					style.maxWidth = `${ currentMaxWidth.toString() }px`;
				} );
			}

			// Update on scroll and resize
			window.addEventListener(
				"scroll",
				updateNavbarSize,
				{
					passive: true
				}
			);
			window.addEventListener(
				"resize",
				updateNavbarSize,
				{
					passive: true
				}
			);

			// Initial update
			updateNavbarSize();

			return () => {
				window.removeEventListener(
					"scroll",
					updateNavbarSize
				);
				window.removeEventListener(
					"resize",
					updateNavbarSize
				);
			};
		},
		[ navbar ]
	);

	return (
		<nav
			className="fixed top-0 w-full bg-gray-900/50 backdrop-blur-lg z-50 drop-shadow-lg left-1/2 transform -translate-x-1/2"
			ref={ navbar }>

			<div className="container mx-auto py-4">
				<div className="flex justify-between items-center px-6">
					<span
						className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
						{name}
					</span>

					{/* Desktop Menu */}
					<div className="space-x-6 hidden md:block">
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

					{/* Mobile Menu Button */}
					<button
						aria-label="Toggle navbar menu"
						className="md:hidden"
						type="button"
						onClick={
							( e ) => {
								e.stopPropagation();
								setIsMenuOpen( !isMenuOpen );
							}
						}>
						{
							isMenuOpen
								? (
									<X className="w-6 h-6 text-gray-400 mx-auto" />
								)
								: (
									<Menu className="w-6 h-6 text-gray-400 mx-auto" />
								)
						}
					</button>
				</div>

				{/* Mobile Menu */}
				<div
					className={
						clsx(
							"md:hidden overflow-hidden transition-all duration-300 ease-in-out",
							isMenuOpen ? "max-h-64" : "max-h-0"
						)
					}>

					<div className="px-4 py-2 text-right">
						{
							sectionArray.map( ( section ) => (
								<a
									className={
										clsx(
											"block py-2 hover:text-blue-400 transition-colors",
											activeSection === section ? "text-blue-400" : "text-gray-200"
										)
									}
									href={ `#${ section }` }
									key={ section }
									onClick={
										() => {
											setIsMenuOpen( false );
										}
									}>
									{toCapitalized( section )}
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
