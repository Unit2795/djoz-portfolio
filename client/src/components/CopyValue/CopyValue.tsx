import {
	CheckCircle
} from "lucide-react";
import Popover from "@/components/Popover/Popover.tsx";
import {
	ReactNode,
	useRef,
	useState
} from "react";
import clsx from "clsx";

const CopyValue = (
	{
		value,
		label,
		animationDelay,
		icon
	}: {
		value: string;
		label: string;
		animationDelay: number
		icon: ReactNode;
	}
) => {
	const [ copyValue, setCopyValue ] = useState<boolean>( false );
	const timeoutRef = useRef<NodeJS.Timeout>( null );

	return (
		<Popover
			className={
				clsx(
					copyValue && "border-green-500 border"
				)
			}
			content={
				(
					<>
						{
							copyValue
								? (
									<div className="flex items-center text-nowrap">
										<CheckCircle
											className="text-green-500 mr-2"/>

										<p>Copied successfully!</p>
									</div>
								)
								: (
									<div>
										<div className="text-sm text-gray-400 text-nowrap mb-1">Click to copy:</div>

										<div>{value}</div>
									</div>
								)
						}
					</>
				)
			}
			onHover={
				( isHovered ) => {
					if ( !isHovered && timeoutRef.current ) {
						clearTimeout( timeoutRef.current );
						setCopyValue( false );
					}
				}
			}>
			<button
				aria-label={ label }
				className="p-2 hover:text-blue-400 transition-colors motion-safe:animate-fadeUp"
				style={
					{
						animationDelay: `${ String( animationDelay ) }ms`,
						animationFillMode: "both"
					}
				}
				type="button"
				onClick={
					async() => {
						setCopyValue( true );
						timeoutRef.current = setTimeout(
							() => {
								setCopyValue( false );
							},
							2500
						);

						await navigator.clipboard.writeText( value );
					}
				}>
				{icon}
			</button>
		</Popover>
	);
};

export default CopyValue;
