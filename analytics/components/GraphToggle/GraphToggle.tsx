"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface GraphToggleProps<K extends string> {
	allKeys: K[];
	visibleKeys: K[];
	onChange: (keys: K[]) => void;
	label?: string;
}

const GraphToggle = <K extends string>({ allKeys, visibleKeys, onChange, label = "Lines" }: GraphToggleProps<K>) => {
	const toggleKey = (key: K, checked: boolean | "indeterminate") => {
		const keysSet = new Set(visibleKeys);
		if (checked === true) {
			keysSet.add(key);
		} else {
			keysSet.delete(key);
		}
		onChange([...keysSet]);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm">
					{label}
					<ChevronDown className="ml-2 h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>Show series</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{allKeys.map((key) => (
					<DropdownMenuCheckboxItem
						key={key}
						checked={visibleKeys.includes(key)}
						onCheckedChange={(checked) => toggleKey(key, checked)}
						onSelect={(e) => e.preventDefault()}
						className="capitalize"
					>
						{key}
					</DropdownMenuCheckboxItem>
				))}

				<DropdownMenuSeparator />
				<div className="px-2 py-1.5 flex items-center gap-2">
					<Button variant="ghost" size="sm" onClick={() => onChange(allKeys)} className="h-8 px-2">
						Select all
					</Button>
					<Button variant="ghost" size="sm" onClick={() => onChange([])} className="h-8 px-2">
						Clear all
					</Button>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default GraphToggle;
