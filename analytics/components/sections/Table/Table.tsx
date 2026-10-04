import DataTable, {
	DataTableColumnHeader,
	DataTableFeatures,
	DataTablePaginationProps,
} from "@/components/DataTable/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef, createColumnHelper, SortingState } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsEventEnriched, events } from "@djoz-portfolio/shared";

const columnHelper = createColumnHelper<DataTableFeatures, AnalyticsEventEnriched>();
const userFriendlyColumnNames: Record<string, string> = {
	timestamp: "Timestamp",
	eventType: "Event",
	id: "ID",
	ip: "IP Address",
	sessionId: "Session",
	userAgent: "User Agent",
};

const Table = ({
	data,
	onSortingChange,
	sorting,
	pagination,
	filters,
	onFiltersChange,
	timezone,
	setTimezone,
}: {
	data: AnalyticsEventEnriched[];
	sorting: SortingState;
	onSortingChange: (sorting: SortingState) => void;
	pagination: DataTablePaginationProps;
	filters: TableFilter[];
	onFiltersChange: (filters: TableFilter[]) => void;
	timezone: "utc" | "local";
	setTimezone: Dispatch<SetStateAction<"utc" | "local">>;
}) => {
	// Filters being edited, only sent to the parent when applied
	const [draft, setDraft] = useState<TableFilter[]>(filters);
	const dirty = JSON.stringify(draft) !== JSON.stringify(filters);

	const addFilter = (id: string, value?: string | null) => {
		if (!value) return;
		setDraft((prev) => [...prev, { id, value, exclude: false }]);
	};

	const clearFilters = () => {
		setDraft([]);
		if (filters.length > 0) onFiltersChange([]);
	};

	const columns = useMemo<ColumnDef<DataTableFeatures, AnalyticsEventEnriched, any>[]>(
		() => [
			columnHelper.accessor("timestamp", {
				header: ({ column }) => <DataTableColumnHeader column={column} title="Timestamp" />,
				cell: ({ getValue }) => {
					const date = new Date(Number(getValue()));
					return (
						<div>
							{date.toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								hour12: true,
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
								timeZone: timezone === "utc" ? "UTC" : undefined,
							})}
						</div>
					);
				},
				meta: {
					className: "p-2",
				},
			}),
			columnHelper.accessor("eventType", {
				header: ({ column }) => <DataTableColumnHeader column={column} title="Event" />,
				cell: ({ getValue }) => (
					<div
						className="cursor-pointer hover:bg-gray-700 w-full h-full p-2"
						onClick={() => addFilter("eventType", getValue())}
					>
						{getValue()}
					</div>
				),
			}),
			columnHelper.accessor("id", {
				header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
				cell: ({ getValue }) => (
					<div
						className={cn("w-full h-full p-2", getValue() && "cursor-pointer hover:bg-gray-700")}
						onClick={() => addFilter("id", getValue())}
					>
						{getValue()}
					</div>
				),
			}),
			columnHelper.accessor("ip", {
				header: ({ column }) => <DataTableColumnHeader column={column} title="IP Address" />,
				cell: ({ getValue }) => (
					<div
						className="cursor-pointer hover:bg-gray-700 w-full h-full p-2"
						onClick={() => addFilter("ip", getValue())}
					>
						{getValue()}
					</div>
				),
			}),
			columnHelper.accessor("sessionId", {
				header: ({ column }) => <DataTableColumnHeader column={column} title="Session" />,
				cell: ({ getValue }) => (
					<div
						className="cursor-pointer hover:bg-gray-700 w-full h-full p-2"
						onClick={() => addFilter("sessionId", getValue())}
					>
						{getValue()}
					</div>
				),
			}),
			columnHelper.accessor("userAgent", {
				header: "User Agent",
				cell: ({ getValue }) => (
					<div
						className="cursor-pointer hover:bg-gray-700 w-full h-full p-2"
						onClick={() => addFilter("userAgent", getValue())}
					>
						{getValue()}
					</div>
				),
			}),
		],
		[timezone]
	);

	return (
		<section aria-labelledby="table-heading" className="space-y-4">
			<div className="flex">
				<h2 id="table-heading" className="text-lg font-medium">
					Events
				</h2>
				<Select value={timezone} onValueChange={(val) => setTimezone(val as "utc" | "local")}>
					<SelectTrigger className="w-[180px] ml-auto">
						<SelectValue placeholder="Select Timezone" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="utc">UTC</SelectItem>
						<SelectItem value="local">Local</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Card>
				<CardContent className="px-4 py-4 space-y-3">
					<Filter
						items={draft}
						onChange={setDraft}
						dirty={dirty}
						onApply={() => onFiltersChange(draft)}
						onClear={clearFilters}
					/>
					<div className="mt-4">
						<DataTable
							columns={columns}
							data={data}
							sorting={sorting}
							onSortingChange={onSortingChange}
							pagination={pagination}
						/>
					</div>
				</CardContent>
			</Card>
		</section>
	);
};

export default Table;

export interface TableFilter {
	id: string;
	value: string;
	exclude: boolean;
}

const Filter = ({
	items,
	onChange,
	dirty,
	onApply,
	onClear,
}: {
	items: TableFilter[];
	onChange: Dispatch<SetStateAction<TableFilter[]>>;
	// True when the edited filters differ from the applied ones
	dirty: boolean;
	onApply: () => void;
	onClear: () => void;
}) => {
	// Add a new filter with optional default value
	const addFilter = (id: string, defaultValue?: string) => {
		onChange((prev) => [...prev, { id, value: defaultValue || "", exclude: false }]);
	};

	// Handle changes to an existing filter's value or exclusion status
	const handleFilterChange = (index: number, value: string, exclude: boolean) => {
		onChange((prev) => prev.map((filter, i) => (i === index ? { ...filter, value, exclude } : filter)));
	};

	return (
		<div className="rounded-lg border border-gray-700 shadow-md/20 bg-gray-950">
			<details className="group" open>
				<summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-2 hover:bg-blue-500/10 group-open:border-b border-gray-700">
					<div className="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="select-none">
									Add Filter +
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="bg-gray-950" align="start">
								<DropdownMenuLabel>Filter by</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => addFilter("eventType", events.exit)}>
									Event
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => addFilter("id")}>ID</DropdownMenuItem>
								<DropdownMenuItem onClick={() => addFilter("ip")}>IP Address</DropdownMenuItem>
								<DropdownMenuItem onClick={() => addFilter("sessionId")}>Session</DropdownMenuItem>
								<DropdownMenuItem onClick={() => addFilter("userAgent")}>User Agent</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						{items.length > 0 ? (
							<Button variant="ghost" size="sm" onClick={onClear}>
								Clear all <X className="ml-2 h-4 w-4 text-red-500" />
							</Button>
						) : null}
						{dirty ? (
							<Button
								variant="outline"
								onClick={onApply}
								className="bg-green-950 hover:bg-green-900 border-green-900 text-green-300"
							>
								Apply Filters <Check className="ml-2 h-4 w-4 text-green-400" />
							</Button>
						) : null}
					</div>
					<div className="ml-auto flex items-center gap-2">
						<span className="text-sm rounded-md bg-blue-900 px-3 py-1">{items.length}</span>
						<span className="transition-transform duration-200 ease-in-out group-open:-rotate-180">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
							</svg>
						</span>
					</div>
				</summary>
				<div className="flex flex-wrap gap-3 p-4 bg-gray-925 rounded-b-lg">
					{items.length === 0 ? (
						<span className="text-sm text-gray-500">
							No filters applied&nbsp;
							<span className="text-xs text-gray-600">
								(Note: Click cells to add their value to filters)
							</span>
						</span>
					) : null}
					{items.map((filter, index) => (
						<div
							key={index}
							className="flex items-center gap-2 rounded-lg border border-white/10 px-2.5 py-1.5 shadow-sm transition hover:border-white/20 focus-within:ring-1 focus-within:ring-ring bg-gray-900"
						>
							<Label className="text-[11px] font-medium text-muted-foreground">
								{userFriendlyColumnNames[filter.id]}
							</Label>
							{filter.id === "eventType" ? (
								<select
									value={filter.value}
									onChange={(e) => handleFilterChange(index, e.target.value, filter.exclude)}
									className="h-8 w-44 rounded-md border border-white/10 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring/50 focus:ring-1 focus:ring-ring"
								>
									{Object.values(events).map((ev) => (
										<option key={ev} value={ev} className="bg-gray-800">
											{ev}
										</option>
									))}
								</select>
							) : (
								<input
									type="text"
									placeholder="Filter…"
									value={filter.value}
									onChange={(e) => handleFilterChange(index, e.target.value, filter.exclude)}
									className="h-8 w-56 sm:w-64 rounded-md border border-white/10 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring/50 focus:ring-2 focus:ring-ring"
								/>
							)}
							<label
								className={
									"cursor-pointer border border-white/10 rounded-md px-2 py-1 text-xs flex items-center gap-1 hover:bg-white/10 select-none h-8 has-[:checked]:bg-red-950"
								}
							>
								<input
									type="checkbox"
									checked={filter.exclude}
									onChange={(e) => handleFilterChange(index, filter.value, e.target.checked)}
								/>
								Exclude
							</label>
							<Button
								className="border border-white/10 rounded-md p-1 text-muted-foreground hover:bg-red-950/50 hover:text-red-400 focus:ring-2 focus:ring-red-400"
								variant="ghost"
								size="icon"
								onClick={() => onChange((prev) => prev.filter((_, i) => i !== index))}
								aria-label="Remove filter"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					))}
				</div>
			</details>
		</div>
	);
};
