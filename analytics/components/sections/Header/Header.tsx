import DatePick from "@/components/DatePick/DatePick";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dispatch, SetStateAction } from "react";

const Header = ({
	from,
	to,
	setFrom,
	setTo,
	force,
	setForce,
}: {
	from: Date | undefined;
	to: Date | undefined;
	force: boolean;
	setFrom: Dispatch<SetStateAction<Date | undefined>>;
	setTo: Dispatch<SetStateAction<Date | undefined>>;
	setForce: Dispatch<SetStateAction<boolean>>;
}) => {
	return (
		<header className="flex items-center justify-between">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
			</div>
			<div className="flex items-end gap-3">
				<Tooltip>
					<TooltipTrigger>
						<label
							className={
								"cursor-pointer border border-white/10 rounded-md px-2 py-1 text-xs flex items-center gap-1 hover:bg-white/10 select-none has-[:checked]:bg-blue-500 h-9 mr-4"
							}
						>
							<input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
							Force Refresh
						</label>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							Clears previously fetched data and reloads it from S3. Useful if you're not seeing the data
							you expect.
						</p>
					</TooltipContent>
				</Tooltip>

				<div className="flex flex-col gap-1">
					<DatePick label="Start" date={from} onChange={setFrom} />
				</div>
				<span className="mb-2 text-muted-foreground">→</span>
				<div className="flex flex-col gap-1">
					<DatePick label="End" date={to} onChange={setTo} />
				</div>
			</div>
		</header>
	);
};

export default Header;
