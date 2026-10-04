"use client";

import { useEffect, useState } from "react";
import Header from "@/components/sections/Header/Header";
import Stats from "@/components/sections/Stats/Stats";
import Graph from "@/components/sections/Graph/Graph";
import EventList, { TableFilter } from "@/components/sections/Table/Table";
import type { SortingState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { TABLE_PAGE_SIZE } from "@/lib/queries";
import { AnalyticsEventEnriched, APIGraphData, EventMetrics } from "@djoz-portfolio/shared";

// POSTs JSON and returns the parsed response, throwing on non-2xx so callers can show the error
const postJson = async <T,>(url: string, body?: unknown): Promise<T> => {
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body ?? {}),
	});
	if (!res.ok) {
		throw new Error(`${url} failed (${res.status}): ${await res.text()}`);
	}
	return res.json();
};

export default function Page() {
	const [from, setFrom] = useState<Date | undefined>();
	const [to, setTo] = useState<Date | undefined>();
	const [data, setData] = useState<{ stats: EventMetrics; graph: APIGraphData } | null>(null);
	const [table, setTable] = useState<{ events: AnalyticsEventEnriched[]; total: number }>({ events: [], total: 0 });
	const [page, setPage] = useState(1);
	const [sort, setSort] = useState<SortingState>([{ id: "timestamp", desc: true }]);
	const [filters, setFilters] = useState<TableFilter[]>([]);
	const [timezone, setTimezone] = useState<"utc" | "local">("utc");
	// Number of requests in flight, the loading toast shows while it is above 0
	const [pending, setPending] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [syncing, setSyncing] = useState(false);
	const [syncResult, setSyncResult] = useState<string | null>(null);
	// Bumped after a sync so the current views are fetched again
	const [syncCount, setSyncCount] = useState(0);

	// Tracks a request for the loading toast and shows its error, unless a newer request replaced it
	const track = async (request: () => Promise<void>, isStale = () => false) => {
		setPending((n) => n + 1);
		setError(null);
		try {
			await request();
		} catch (err) {
			if (!isStale()) setError(err instanceof Error ? err.message : String(err));
		} finally {
			// Slight delay to avoid flickering
			setTimeout(() => setPending((n) => n - 1), 500);
		}
	};

	useEffect(() => {
		if (!from || !to) return;
		// Ignore responses that arrive after a newer request has started
		let stale = false;
		track(async () => {
			const result = await postJson<{ stats: EventMetrics; graph: APIGraphData }>("/api/events", {
				from,
				to,
				filters,
			});
			if (!stale) setData(result);
		}, () => stale);
		return () => {
			stale = true;
		};
	}, [from, to, filters, syncCount]);

	useEffect(() => {
		if (!from || !to) return;
		let stale = false;
		track(async () => {
			const result = await postJson<{ events: AnalyticsEventEnriched[]; total: number }>("/api/table", {
				from,
				to,
				page,
				sort,
				filters,
			});
			if (!stale) setTable(result);
		}, () => stale);
		return () => {
			stale = true;
		};
	}, [from, to, filters, page, sort, syncCount]);

	const sync = async () => {
		setSyncing(true);
		await track(async () => {
			const { files, rows } = await postJson<{ files: number; rows: number }>("/api/sync");
			setSyncResult(files ? `Imported ${files} files (${rows.toLocaleString()} rows)` : "Already up to date");
			setSyncCount((n) => n + 1);
		});
		setSyncing(false);
	};

	// A new range or filter starts back at the first page
	const changeFrom = (date: Date | undefined) => {
		setFrom(date);
		setPage(1);
	};
	const changeTo = (date: Date | undefined) => {
		setTo(date);
		setPage(1);
	};
	const changeFilters = (next: TableFilter[]) => {
		setFilters(next);
		setPage(1);
	};

	const loading = pending > 0;

	return (
		<>
			<main className="mx-auto max-w-6xl px-4 py-8 min-h-screen space-y-10">
				<Header
					from={from}
					to={to}
					onFromChange={changeFrom}
					onToChange={changeTo}
					onSync={sync}
					syncing={syncing}
					syncResult={syncResult}
				/>
				{!data ? <p className="text-center">Select a date range to view data...</p> : null}

				{data && (
					<>
						<Stats stats={data.stats} />
						<Graph graphs={data.graph.data} axisUnit={data.graph.axis.unit} timezone={timezone} />
						<EventList
							timezone={timezone}
							setTimezone={setTimezone}
							data={table.events}
							sorting={sort}
							onSortingChange={setSort}
							pagination={{
								currentPage: page,
								pageSize: TABLE_PAGE_SIZE,
								totalItems: table.total,
								onPageChange: setPage,
							}}
							filters={filters}
							onFiltersChange={changeFilters}
						/>
					</>
				)}
			</main>
			<p
				className={cn(
					"fixed bottom-4 right-8 max-w-xl bg-green-800 p-4 rounded-lg flex items-center justify-center text-center text-md text-white border border-green-500 transition-opacity duration-300 pointer-events-none shadow-md shadow-green-500/50",
					error && "bg-red-900 border-red-500 shadow-red-500/50",
					loading || error ? "opacity-100" : "opacity-0"
				)}
				role={error ? "alert" : undefined}
				aria-hidden={!loading && !error}
			>
				{error ? (
					error
				) : (
					<>
						<span className="h-6 w-6 animate-spin rounded-full border-4 border-transparent border-t-green-400 mr-4" />
						{syncing ? "Syncing from S3..." : "Loading data..."}
					</>
				)}
			</p>
		</>
	);
}
