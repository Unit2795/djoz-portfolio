import { ChevronDownIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useId, useState } from "react";

const DatePick = ({
	label,
	onChange,
	date,
}: {
	label: string;
	onChange: (date: Date | undefined) => void;
	date: Date | undefined;
}) => {
	const [open, setOpen] = useState(false);
	const id = useId();

	return (
		<div>
			<Label htmlFor={id} className="px-1 mb-1">
				{label}
			</Label>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" id={id} className="w-48 justify-between font-normal">
						{date ? date.toLocaleDateString() : "Select date"}
						<ChevronDownIcon />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto overflow-hidden p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						captionLayout="dropdown"
						onSelect={(date) => {
							onChange(date);
							setOpen(false);
						}}
						disabled={{
							// Disable future dates
							after: new Date(),
						}}
						timeZone="UTC"
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default DatePick;
