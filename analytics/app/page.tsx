"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Header from "@/components/sections/Header/Header";
import Stats from "@/components/sections/Stats/Stats";
import Graph from "@/components/sections/Graph/Graph";
import EventList, { TableFilter } from "@/components/sections/Table/Table";
import type { SortingState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { AnalyticsEventEnriched, APIGraphData, ChartData } from "@djoz-portfolio/shared";

const TABLE_PAGE_SIZE = 20;

export default function Page() {
	const [from, setFrom] = React.useState<Date | undefined>();
	const [to, setTo] = React.useState<Date | undefined>();
	const [force, setForce] = React.useState<boolean>(false);
	const [data, setData] = useState<{
		stats: Record<string, number> | null;
		graph: APIGraphData | null;
	}>({ stats: null, graph: null });
	const [tableData, setTableData] = useState<AnalyticsEventEnriched[]>([]);
	const [pagination, setPagination] = useState<{ totalItems: number; pages: number; currentPage: number } | null>(
		null
	);
	const [graphData, setGraphData] = useState<ChartData | null>(null);
	const [sort, setSort] = useState<SortingState>([{ id: "timestamp", desc: true }]);
	const [filters, setFilters] = useState<TableFilter[]>([]);
	const [timezone, setTimezone] = useState<"utc" | "local">("utc");
	const [loading, setLoading] = useState(false);

	const fetchData = async () => {
		if (!from || !to) return;

		setLoading(true);

		const res = await fetch("/api/events", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				force,
				from,
				to,
				filters,
			}),
		});
		const data = await res.json();
		setData(data);
		setGraphData(data.graph.data);
		setPagination({
			totalItems: data.stats.event ? Number(data.stats.event) : 0,
			pages: data.stats.event ? Math.ceil(Number(data.stats.event) / TABLE_PAGE_SIZE) : 0,
			currentPage: 1,
		});

		// Slight delay to avoid flickering
		setTimeout(() => {
			setLoading(false);
		}, 500);
	};

	const fetchTableData = async () => {
		if (!from || !to) return;

		setLoading(true);

		const tableRes = await fetch("/api/table", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from,
				to,
				page: pagination?.currentPage || 1,
				sort,
				filters,
			}),
		});
		const tableData = await tableRes.json();
		setTableData(tableData.events);

		// Slight delay to avoid flickering
		setTimeout(() => {
			setLoading(false);
		}, 500);
	};

	useEffect(() => {
		fetchData();
	}, [from, to, filters]);

	useEffect(() => {
		fetchTableData();
	}, [pagination?.currentPage, pagination?.totalItems, sort, filters]);

	return (
		<>
			<main className="mx-auto max-w-6xl px-4 py-8 min-h-screen space-y-10">
				<Header from={from} to={to} setFrom={setFrom} setTo={setTo} force={force} setForce={setForce} />
				{!data.stats && !data.graph ? <p className="text-center">Select a date range to view data...</p> : null}

				{data.stats && graphData && pagination && (
					<>
						<Stats stats={data.stats} />
						<Graph graphs={graphData} axisUnit={data.graph?.axis.unit || "day"} timezone={timezone} />
						<EventList
							timezone={timezone}
							setTimezone={setTimezone}
							data={tableData}
							sorting={sort}
							onSortingChange={setSort}
							pagination={{
								currentPage: pagination.currentPage,
								pageSize: TABLE_PAGE_SIZE,
								totalItems: pagination.totalItems,
								onPageChange: (pageNum) =>
									setPagination((prevState) => {
										if (!prevState) return prevState;
										return {
											...prevState,
											currentPage: pageNum,
										};
									}),
							}}
							filters={filters}
							onFiltersChange={setFilters}
						/>
					</>
				)}
			</main>
			<p
				className={cn(
					"fixed bottom-4 right-8 bg-green-800 p-4 rounded-lg flex items-center justify-center text-center text-md text-white border border-green-500 transition-opacity duration-300 pointer-events-none shadow-md shadow-green-500/50",
					loading ? "opacity-100" : "opacity-0"
				)}
				aria-hidden={!loading}
			>
				<span className="h-6 w-6 animate-spin rounded-full border-4 border-transparent border-t-green-400 mr-4" />
				Loading data...
			</p>
		</>
	);
}
