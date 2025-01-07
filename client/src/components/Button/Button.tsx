import clsx from "clsx";
import {
	ButtonProps
} from "@/components/Button/types.ts";
import "./Button.css";

const Button = (
	{
		children,
		className,
		variant = "neutral",
		type = "button",
		...rest
	}: ButtonProps
) => {
	const variantClass = {
		primary: "bg-primary text-white",
		secondary: "bg-secondary text-white",
		neutral: "bg-white/5 text-neutral"
	};

	return (
		<button
			className={
				clsx(
					variantClass[ variant ],
					className,
					"px-6 py-3 backdrop-blur-sm rounded-lg font-medium border border-white/20 shadow-lg hover:bg-white/10 transition-colors duration-200 glass-btn"
				)
			}
			type={
				/* eslint-disable-next-line react/button-has-type */
				type
			}
			{ ...rest }>
			{children}
		</button>
	);
};

export default Button;
