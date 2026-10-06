import DatePick from "@/components/DatePick/DatePick";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Header = ({
	from,
	to,
	onFromChange,
	onToChange,
	onSync,
	onRebuild,
	syncing,
	syncResult,
}: {
	from: Date | undefined;
	to: Date | undefined;
	onFromChange: (date: Date | undefined) => void;
	onToChange: (date: Date | undefined) => void;
	onSync: () => void;
	onRebuild: () => void;
	syncing: boolean;
	syncResult: string | null;
}) => {
	return (
		<header className="flex items-center justify-between">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
			</div>
			<div className="flex items-end gap-3">
				{syncResult && <span className="mb-2 text-sm text-muted-foreground">{syncResult}</span>}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline" onClick={onSync} disabled={syncing}>
							{syncing ? "Syncing..." : "Sync"}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Imports new event files from S3 into the local database.</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline" className="mr-4" onClick={onRebuild} disabled={syncing}>
							Rebuild
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Clears the local database and re-downloads all event files from S3.</p>
					</TooltipContent>
				</Tooltip>

				<div className="flex flex-col gap-1">
					<DatePick label="Start" date={from} onChange={onFromChange} />
				</div>
				<span className="mb-2 text-muted-foreground">→</span>
				<div className="flex flex-col gap-1">
					<DatePick label="End" date={to} onChange={onToChange} />
				</div>
			</div>
		</header>
	);
};

export default Header;
