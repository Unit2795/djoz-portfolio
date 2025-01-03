import clsx from "clsx";
import {
	ButtonProps
} from "@/components/button/types.ts";

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
					"px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg font-medium text-white border border-white/20 shadow-lg hover:bg-white/20 transition-colors duration-200"
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
