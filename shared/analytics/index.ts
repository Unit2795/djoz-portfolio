/* 
	We unify all analytics types in one file for easy reference and to ensure consistency across the frontend client, the lambdas, and the local analytics dashboard. It's possible the schema for analytics events may evolve over time, so having a single source of truth helps manage that complexity.
*/

// The various types of analytics events that the client can produce
export const events = {
	exit: "exit",
	visit: "visit",
	scroll: "scroll",
	click: "click",
	focus: "focus",
	hover: "hover",
	keydown: "keydown",
} as const;
export type EventName = keyof typeof events;
const eventArray = Object.values(events) as EventName[];

/*
	Analytics event schema optimized for efficient ingestion and processing.
	Its compact format minimizes payload size for SQS transport.
*/
// Base analytics event representing a single tracked user action or system event
export interface AnalyticsEvent {
	// Event type
	e: EventName;
	// Optional metadata such as an analytics ID
	m?: string;
	// Session ID
	s?: string;
}

// Metadata automatically added by the ingest Lambda API
export interface AnalyticsContext {
	// Unix timestamp in seconds
	timestamp: number;
	// Schema version to allow backward/forward compatibility
	schemaVersion: number;
	// User agent string (if available)
	userAgent: string | null;
	// IP address (if available)
	ip: string | null;
}

// Fully enriched analytics event, including actual event and system metadata
export type AnalyticsEventEnriched = AnalyticsEvent & AnalyticsContext;

// A batch of analytics events that is received by the ingest Lambda and placed into SQS
export interface AnalyticsChunk extends AnalyticsContext {
	events: AnalyticsEvent[];
}

// Utility type to extract the different event types as an array of strings, in addition to the total "event" count
export const eventMetricKeys = ["event", ...eventArray] as const satisfies readonly ["event", ...EventName[]];
// An object containing a total for each event type, as well as a total for all events as aggregated from DuckDB
export type EventMetrics = Record<(typeof eventMetricKeys)[number], number>;

/* 
	The shape of data returned from the analytics API for graphing
	Contains a time range for each point and a count for each event type as well as a total for all events
*/
export interface ChartPoint extends EventMetrics {
	bucket_start: string;
}
export type ChartData = ChartPoint[];
// Time step information for the x-axis of analytics graphs
export type TimeSteps = {
	unit: "hour" | "day";
	step: number;
	ticks: number;
	ms: number;
};
// The shape of the graph data returned from the analytics API
export type APIGraphData = {
	axis: TimeSteps;
	data: ChartData;
};
