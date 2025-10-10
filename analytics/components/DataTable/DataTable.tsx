import {
	Column,
	ColumnDef,
	flexRender,
	getCoreRowModel,
	Row,
	useReactTable,
	SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { HTMLAttributes, MouseEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
	ArrowDown,
	ArrowUp,
	ChevronsUpDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";

interface DataTableColumnHeaderProps<TableData, TableValue> extends HTMLAttributes<HTMLDivElement> {
	column: Column<TableData, TableValue>;
	title: string;
}

export const DataTableColumnHeader = <TableData, TableValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TableData, TableValue>) => {
	// If column has had sorting disabled, render div temporarily
	if (!column.getCanSort()) {
		return <div className={cn(className)}>{title}</div>;
	}

	const current = column.getIsSorted();
	// If multi-sorting is enabled, this will be the index (0-based) of the sort, if not sorted, will be -1
	const sortIndex = column.getSortIndex();
	const isSorted = !!current;

	const handleClick = () => {
		if (current === "asc") {
			column.clearSorting();
		} else {
			column.toggleSorting(!current, true);
		}
	};

	const icon =
		current === "desc" ? (
			<ArrowDown className="h-3.5 w-3.5" />
		) : current === "asc" ? (
			<ArrowUp className="h-3.5 w-3.5" />
		) : (
			<ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/70" />
		);

	return (
		<div className={cn("flex space-x-2", className)}>
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8 w-full justify-start"
				onClick={handleClick}
				title={!current ? "Sort: descending" : current === "desc" ? "Sort: ascending" : "Clear sort"}
			>
				<span>{title}</span>
				{icon}
				{isSorted ? (
					<Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
						{sortIndex + 1}
					</Badge>
				) : null}
			</Button>
		</div>
	);
};

export interface DataTablePaginationProps {
	currentPage: number; // 1-based
	// Number of items per page
	pageSize: number;
	// Total number of items across all pages
	totalItems: number;
	onPageChange?: (page: number) => void;
}

const DataTablePagination = ({ currentPage, pageSize, totalItems, onPageChange }: DataTablePaginationProps) => {
	const [pageInput, setPageInput] = useState<string>(String(currentPage));

	let totalPages = 0;
	let startItem = 0;
	let endItem = 0;

	if (totalItems > 0) {
		startItem = (currentPage - 1) * pageSize + 1;
		endItem = Math.min(totalItems, currentPage * pageSize);
		totalPages = Math.ceil(totalItems / pageSize);
	}

	useEffect(() => {
		setPageInput(String(currentPage));
	}, [currentPage]);

	const safeOnPageChange = (page: number) => {
		if (onPageChange) {
			onPageChange(page);
		}
	};

	const goToInputPage = () => {
		let clamped = 1;
		const parsedInput = Number(pageInput);
		// If exceeds bounds, clamp to max page count
		if (parsedInput > totalPages) {
			clamped = totalPages;
			// Cannot be less than 1
		} else if (parsedInput < 1) {
			clamped = 1;
		} else {
			clamped = parsedInput;
		}
		setPageInput(String(clamped));
		safeOnPageChange(clamped);
	};

	const handlePrev = () => {
		if (currentPage <= 1) return;
		safeOnPageChange(currentPage - 1);
	};

	const handleNext = () => {
		if (currentPage >= totalPages) return;
		safeOnPageChange(currentPage + 1);
	};

	const handleFirst = () => {
		if (currentPage === 1) return;
		safeOnPageChange(1);
	};

	const handleLast = () => {
		if (currentPage === totalPages) return;
		safeOnPageChange(totalPages);
	};

	return (
		<div className="flex items-center justify-between px-2 py-3">
			<div className="text-muted-foreground flex-1 text-sm">
				Showing {startItem}-{endItem} of {totalItems}
			</div>
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={handleFirst}
						disabled={currentPage <= 1}
					>
						<span className="sr-only">Go to first page</span>
						<ChevronsLeft />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={handlePrev}
						disabled={currentPage <= 1}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeft />
					</Button>
					<div className="flex items-center gap-2">
						<span className="text-sm">Page</span>
						<input
							type="number"
							min={1}
							max={totalPages}
							value={pageInput}
							onChange={(e) => setPageInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									goToInputPage();
								}
							}}
							className="h-8 w-16 rounded-md border bg-transparent px-2 text-center text-sm outline-none focus:ring-1"
						/>
						<span className="text-sm">of {totalPages}</span>
						<Button
							variant="outline"
							size="icon"
							className="size-8"
							onClick={goToInputPage}
							disabled={
								String(pageInput) === String(currentPage) ||
								Number(pageInput) > totalPages ||
								Number(pageInput) < 1
							}
						>
							Go
						</Button>
					</div>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={handleNext}
						disabled={currentPage >= totalPages}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRight />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={handleLast}
						disabled={currentPage >= totalPages}
					>
						<span className="sr-only">Go to last page</span>
						<ChevronsRight />
					</Button>
				</div>
			</div>
		</div>
	);
};

interface DataTableProps<TableData, TableValue> {
	columns: ColumnDef<TableData, TableValue>[];
	data: TableData[];
	onRowClick?: (row: Row<TableData>, event: MouseEvent<HTMLTableRowElement>) => void;
	/** Controlled sorting state (optional). Keeps component generic and UI-only. */
	sorting?: SortingState;
	onSortingChange?: (sorting: SortingState) => void;
	pagination?: DataTablePaginationProps;
}

const DataTable = <TableData, TableValue>({
	data,
	columns,
	onRowClick,
	sorting: controlledSorting,
	onSortingChange,
	pagination,
}: DataTableProps<TableData, TableValue>) => {
	const [uncontrolledSorting, setUncontrolledSorting] = useState<SortingState>([]);
	const sorting = controlledSorting ?? uncontrolledSorting;
	const table = useReactTable<TableData>({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		enableSorting: true,
		enableMultiSort: true,
		state: { sorting },
		onSortingChange: (updater) => {
			const next =
				typeof updater === "function" ? (updater as (old: SortingState) => SortingState)(sorting) : updater;
			if (onSortingChange) {
				onSortingChange(next);
			} else {
				setUncontrolledSorting(next);
			}
		},
	});

	const currentPage = pagination?.currentPage ?? 1;
	const pageSize = pagination?.pageSize ?? data?.length ?? 1;
	const totalItems = pagination?.totalItems ?? data?.length ?? 0;

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader className="bg-gray-900">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead
										key={header.id}
										aria-sort={
											header.column.getCanSort()
												? header.column.getIsSorted() === "asc"
													? "ascending"
													: header.column.getIsSorted() === "desc"
													? "descending"
													: "none"
												: undefined
										}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => {
							return (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className={cn(onRowClick && "cursor-pointer")}
									onClick={(event) => {
										if (onRowClick) {
											onRowClick(row, event);
										}
									}}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cell.column.columnDef.meta?.className ?? undefined}
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			<DataTablePagination
				currentPage={currentPage}
				pageSize={pageSize}
				totalItems={totalItems}
				onPageChange={pagination?.onPageChange}
			/>
		</div>
	);
};

export default DataTable;
