"use client";

import GraphToggle from "@/components/GraphToggle/GraphToggle";
import { Card, CardContent } from "@/components/ui/card";
import { ChartData, eventMetricKeys } from "@djoz-portfolio/shared";
import { useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const CHART_HEIGHT = 500;
const CHART_MARGIN = { top: 8, right: 12, bottom: 20, left: 36 };
const X_AXIS_LABEL = {
	value: "Date",
	position: "bottom",
	fontSize: 16,
	fill: "var(--muted-foreground)",
} as const;
const Y_AXIS_LABEL = {
	value: "Count",
	angle: -90,
	position: "insideLeft",
	offset: -10,
	fontSize: 16,
	fill: "var(--muted-foreground)",
} as const;

const COLORS = [
	"#00FFFF", // Electric Cyan
	"#39FF14", // Neon Green
	"#FF00FF", // Magenta
	"#FFFF33", // Bright Yellow
	"#FF3333", // Vivid Red
	"#66B2FF", // Sky Blue
	"#FF9933", // Tangerine
	"#33CCCC", // Aqua Teal
	"#FFFFFF", // White
];

const Graph = ({
	graphs,
	axisUnit,
	timezone,
}: {
	graphs: ChartData;
	axisUnit: "hour" | "day";
	timezone: "utc" | "local";
}) => {
	const mutableKeys = [...eventMetricKeys];
	// Keep track of which event types lines are visible on the graph
	const [visibleKeys, setVisibleKeys] = useState(mutableKeys);

	// Assign colors to each event type's line
	const colorMap = useMemo(() => {
		const map: Record<string, string> = {};
		// Assign a color to each event type, clamping the index to the COLORS array length
		for (const key of eventMetricKeys) {
			const index = eventMetricKeys.indexOf(key);
			map[key] = COLORS[index % COLORS.length];
		}
		return map;
	}, [eventMetricKeys]);

	const toggleKey = (key: (typeof eventMetricKeys)[number]) => {
		setVisibleKeys((previousKeys) => {
			const isAlreadyVisible = previousKeys.includes(key);
			if (isAlreadyVisible) {
				// Remove key from the list of visible ones
				return previousKeys.filter((k) => k !== key);
			}
			// Add the key back to the visible list
			return [...previousKeys, key];
		});
	};

	const formatDate = (value: string) => {
		const isHour = axisUnit === "hour";
		const isUTC = timezone === "utc";
		const date = new Date(Number(value));
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour12: isHour,
			hour: isHour ? "2-digit" : undefined,
			minute: isHour ? "2-digit" : undefined,
			timeZone: isUTC ? "UTC" : undefined,
		});
	};

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (!active || !payload?.length) return null;

		// Sort by value descending and filter visible series
		const items = payload
			.filter((p: any) => visibleKeys.includes(p.dataKey))
			.sort((a: any, b: any) => b.value - a.value);

		return (
			<div className="min-w-[220px] rounded-md border bg-background text-foreground shadow-lg">
				<div className="border-b px-3 py-2 text-base font-bold text-white">Date: {formatDate(label)}</div>
				<ul className="px-2 py-2 space-y-1">
					{items.map((item: any) => {
						const key = item.dataKey;
						const color = colorMap[key];
						return (
							<li key={key} className="flex items-center justify-between px-2 py-1">
								<span className="flex items-center gap-2 font-semibold text-white capitalize">
									<span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
									{key}
								</span>
								<span className="font-semibold tabular-nums" style={{ color }}>
									{item.value.toLocaleString()}
								</span>
							</li>
						);
					})}
				</ul>
			</div>
		);
	};

	return (
		<section aria-labelledby="graphs-heading" className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 id="graphs-heading" className="text-lg font-medium">
					Graphs
				</h2>
				<GraphToggle
					allKeys={mutableKeys}
					visibleKeys={visibleKeys}
					onChange={setVisibleKeys}
					label="Toggle Graph Lines"
				/>
			</div>

			<Card>
				<CardContent>
					{/* Legend */}
					<div className="flex flex-wrap items-center justify-end gap-2 pr-1 pb-2">
						{eventMetricKeys.map((key) => {
							const isActive = visibleKeys.includes(key);
							return (
								<button
									key={key}
									onClick={() => toggleKey(key)}
									className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity ${
										isActive ? "opacity-100" : "opacity-30"
									}`}
									aria-pressed={isActive}
									title={`${isActive ? "Hide" : "Show"} ${key}`}
								>
									<span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorMap[key] }} />
									<span className="text-white capitalize">{key}</span>
								</button>
							);
						})}
					</div>

					<ResponsiveContainer width="100%" height={CHART_HEIGHT}>
						<LineChart data={graphs} margin={CHART_MARGIN}>
							<CartesianGrid strokeOpacity={0.2} strokeDasharray="3 3" />
							<XAxis
								dataKey="bucket_start"
								tick={{ fontSize: 12 }}
								label={X_AXIS_LABEL}
								tickFormatter={formatDate}
							/>
							<YAxis tick={{ fontSize: 12 }} width={30} allowDecimals={false} label={Y_AXIS_LABEL} />
							<Tooltip content={<CustomTooltip />} />
							{visibleKeys.map((key) => (
								<Line
									key={key}
									type="linear"
									dataKey={key}
									stroke={colorMap[key]}
									strokeWidth={2}
									dot={false}
									isAnimationActive={false}
								/>
							))}
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</section>
	);
};

export default Graph;
