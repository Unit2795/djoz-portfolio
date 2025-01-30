import {
	sections
} from "@/components/Navbar/types.ts";
import {
	showAvailability
} from "@/content.tsx";

const AvailabilityBadge = () => {
	return (
		<a href={ `#${ sections.CONTACT }` }>
			<div className="fixed z-50 bottom-2 right-2 group">
				<div
					className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 backdrop-blur-sm">
					<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>

					<span className="text-blue-400 font-medium group-hover:underline">{showAvailability}</span>
				</div>
			</div>
		</a>
	);
};

export default AvailabilityBadge;
