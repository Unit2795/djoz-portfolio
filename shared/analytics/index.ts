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

// Base analytics event representing a single tracked user action or system event
export interface AnalyticsEvent {
	// Event type
	eventType: EventName;
	/* 
		Milliseconds since the first event in the batch. Used to reconstruct event order and timing.

		The server assigns one timestamp to the entire event batch when it’s received.
		Each event only includes an offset, how long after the batch started that event happened.
		A larger offset means the event occurred more recently, closer to when the batch was sent.

		To reconstruct when each event actually happened relative to the batch timestamp, we work backwards.
		The event with the largest offset should line up exactly with the batch timestamp.
		Events with smaller offsets get shifted back in time accordingly.

		This avoids issues with clock skew, timezones, and intentional manipulation of analytics data.

		This is not perfect, but it's a reasonable compromise between accuracy and complexity.
	*/
	offsetMs?: number;
	// Optional metadata such as an analytics ID
	id?: string;
	// Session ID
	sessionId?: string;
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

export const FLUSH_INTERVAL_MS = 5000; // 5 seconds
