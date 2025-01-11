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
					"relative rounded-xl overflow-hidden duration-300 transition-all hover:motion-safe:shadow-lg hover:motion-safe:shadow-black/30 shadow-black/20 shadow-lg cursor-pointer",
					className
				)
			}>
			{/* Inner gradient overlay for shine effect */}
			{/*<div className="absolute inset-0 bg-gradient-to-bl from-white/50 via-transparent to-white/30" />*/}

			{/* Main card content */}
			<div
				className="relative h-full rounded-xl bg-gray-700/50 backdrop-blur-md">
				{children}
			</div>
		</div>
	);
};

export default Card;
