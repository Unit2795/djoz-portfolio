import { throttle } from "@/utils/throttle";

const analyticsEndpoint = (import.meta.env.VITE_INGEST_ENDPOINT as string) ?? "/analytics";
const FLUSH_INTERVAL_MS = 5000; // 5 seconds
const BATCH_SIZE = 10;
let lastScrollY = 0;

const events = {
	exit: "exit",
	visit: "visit",
	scroll: "scroll",
	click: "click",
	focus: "focus",
	hover: "hover",
	keydown: "keydown",
} as const;
type EventName = (typeof events)[keyof typeof events];
// We keep the analytics event schema small, simple and flat for easy ingestion and processing
// ⚠️If the AnalyticsEvent schema changes, be sure to adjust the ingest lambda accordingly!
interface AnalyticsEvent {
	// Event type
	e: EventName;
	// Event metadata
	m?: string;
	// User ID
	u: string | null;
	// session ID
	s: string | null;
}

const eventQueue: AnalyticsEvent[] = [];
let timer: NodeJS.Timeout | null = null;

// Add an analytics event to the queue and flush if batch size reached
export const analyticsEvent = (eventName: EventName, memo?: string) => {
	eventQueue.push(createEvent(eventName, memo));

	if (eventQueue.length >= BATCH_SIZE) {
		flushEvents();
	}
};

// Send a single event immediately (for critical events like page visit)
const sendImmediateEvent = (eventName: EventName, memo?: string) => {
	return sendEvents([createEvent(eventName, memo)]);
};

// Handle page close - flush queue and send exit event
const handlePageClose = () => {
	const finalEvents = [...eventQueue, createEvent(events.exit)];
	return sendEvents(finalEvents, true);
};

// Handle visibility changes - pause/resume the flush timer
const handleVisibilityChange = () => {
	if (document.visibilityState === "hidden") {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	} else {
		if (!timer) {
			timer = setInterval(flushEvents, FLUSH_INTERVAL_MS);
		}
	}
};

const handleScroll = () => {
	const deltaScroll = Math.abs(window.scrollY - lastScrollY);
	if (deltaScroll < 500) return; // Only log significant scrolls
	lastScrollY = window.scrollY;

	analyticsEvent(events.scroll, deltaScroll.toString());
};

/* function attachInteractionHandlers() {
	const elements = document.querySelectorAll<HTMLElement>("[data-analytics]");

	elements.forEach((el) => {
		console.log(el.dataset?.analytics);

		el.addEventListener("focus", () => analyticsEvent("focus"));
		el.addEventListener("mouseenter", () => analyticsEvent("hover"));
	});

	window.addEventListener("click", () => analyticsEvent("click"));
	window.addEventListener("keydown", (event) => {
		console.log(event.target.dataset?.analytics);
		if (event.code === "Space" || event.code === "Enter") {
			analyticsEvent("keydown");
		}
	});
} */

// Create an analytics event object with the required metadata
const createEvent = (eventName: EventName, memo?: string): AnalyticsEvent => ({
	// ⚠️If the AnalyticsEvent schema changes, be sure to adjust the ingest lambda accordingly!
	e: eventName,
	u: localStorage.getItem("userId"),
	s: sessionStorage.getItem("sessionId"),
	m: memo,
});

// Send events to the server using fetch or sendBeacon
const sendEvents = async (events: AnalyticsEvent[], useBeacon = false) => {
	if (!events.length) return;

	const payload = JSON.stringify({ events });

	if (useBeacon) {
		return navigator.sendBeacon(analyticsEndpoint, payload);
	}

	return fetch(analyticsEndpoint, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: payload,
	});
};

// Flush all queued events to the server
const flushEvents = () => {
	const eventsToSend = eventQueue.splice(0, eventQueue.length);
	return sendEvents(eventsToSend);
};

export const initAnalytics = () => {
	sessionStorage.setItem("sessionId", crypto.randomUUID());
	if (!localStorage.getItem("userId")) {
		localStorage.setItem("userId", crypto.randomUUID());
	}

	// Send initial visit event
	sendImmediateEvent(events.visit);

	// Start the flush timer
	timer = setInterval(flushEvents, FLUSH_INTERVAL_MS);

	handleScroll();
	// attachInteractionHandlers();

	document.addEventListener("visibilitychange", handleVisibilityChange);
	window.addEventListener("pagehide", handlePageClose, { capture: true });
	window.addEventListener("scroll", throttle(handleScroll, 1000), { capture: true });
};
