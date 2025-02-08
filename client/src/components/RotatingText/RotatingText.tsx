import clsx from "clsx";
import {
	ReactNode
} from "react";

const RotatingText = (
	{
		top,
		bottom,
		className
	}: {
		top: ReactNode,
		bottom: ReactNode,
		className?: string
	}
) => {
	return (
		<div
			className={
				clsx(
					"space-y-2 relative",
					className
				)
			}
			style={
				{
					perspective: "800px"
				}
			}>
			<div className={ clsx( "motion-safe:animate-top-rotate-in origin-[50%_-50px]" ) }>
				{top}
			</div>

			<div className={ clsx( "motion-safe:animate-bottom-rotate-in origin-[50%_150px]" ) }>
				{bottom}
			</div>
		</div>
	);
};

export default RotatingText;
