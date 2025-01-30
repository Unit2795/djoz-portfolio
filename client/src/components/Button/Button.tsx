import clsx from "clsx";
import "./button.css";
import {
	ButtonHTMLAttributes
} from "react";

const Button = (
	{
		children,
		className,
		type = "button",
		...rest
	}: ButtonHTMLAttributes<HTMLButtonElement>
) => {
	return (
		<button
			className={
				clsx(
					className,
					"bg-white/5 text-neutral px-6 py-3 backdrop-blur-xs rounded-lg font-medium border border-white/20 shadow-lg hover:bg-white/10 transition-colors duration-200 glass-btn"
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
