import clsx from "clsx";
import {
	usePrefersReducedMotion
} from "@/utils/useReducedMotion.ts";
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
	const prefersReducedMotion = usePrefersReducedMotion();

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
			<div className={ clsx( !prefersReducedMotion && "animate-topRotateIn origin-[50%_-50px]" ) }>
				{top}
			</div>

			<div className={ clsx( !prefersReducedMotion && "animate-bottomRotateIn origin-[50%_150px]" ) }>
				{bottom}
			</div>
		</div>
	);
};

export default RotatingText;
