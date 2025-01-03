import clsx from "clsx";
import {
	ButtonProps
} from "@/components/button/types.ts";
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

	return (
		<button
			className={
				clsx(
					className,
					"px-6 py-3 bg-white/5 backdrop-blur-sm rounded-lg font-medium border border-white/20 shadow-lg hover:bg-white/10 transition-colors duration-200 glass-btn text-neutral"
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
