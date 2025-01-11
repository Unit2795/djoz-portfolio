import {
	ReactNode
} from "react";
import clsx from "clsx";

const Card = (
	{
		children, className
	}:
	{
		children: ReactNode;
		className?: string
	}
) => {
	return (
		<div
			className={
				clsx(
					"relative p-px rounded-xl overflow-hidden duration-300 transition-all hover:motion-safe:shadow-lg hover:motion-safe:shadow-black/20 shadow-black/10 shadow-lg cursor-pointer",
					className
				)
			}>
			{/* Inner gradient overlay for shine effect */}
			<div className="absolute inset-0 bg-gradient-to-bl from-white/50 via-transparent to-white/30" />

			{/* Main card content */}
			<div
				className="relative h-full rounded-xl bg-gradient-to-br from-gray-700 to-gray-800  backdrop-blur-md shadow-lg">
				{children}
			</div>
		</div>
	);
};

export default Card;
