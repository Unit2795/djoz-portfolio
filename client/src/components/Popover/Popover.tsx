import {
	ReactNode,
	useState
} from "react";
import clsx from "clsx";

const Popover = ( {
	content,
	children,
	className = "",
	onHover
}: {
	content: ReactNode;
	children: ReactNode;
	className?: string;
	onHover?: ( isHovered: boolean )=> void;
} ) => {
	const [ isHovered, setIsHovered ] = useState( false );

	return (
		<div className="relative inline-block">
			<div
				className="flex"
				onMouseEnter={
					() => {
						setIsHovered( true );
						onHover?.( true );
					}
				}
				onMouseLeave={
					() => {
						setIsHovered( false );
						onHover?.( false );
					}
				}>
				{children}
			</div>

			{
				isHovered
					? (
						<div
							className={
								clsx(
									"absolute left-1/2 -translate-x-1/2 mt-2 p-2 bg-gray-600 rounded-lg shadow-lg z-10",
									className
								)
							}>
							<div className="relative">
								{/*Arrow pointer connecting the popover to the button*/}
								<div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-gray-600" />

								<div className="text-gray-200 z-20">
									{content}
								</div>
							</div>
						</div>
					)
					: null
			}
		</div>
	);
};

export default Popover;
