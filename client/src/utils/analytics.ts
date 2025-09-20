import { disableAnalytics } from "@/content";

const analyticsEndpoint = (import.meta.env.PUBLIC_API_INGEST_ENDPOINT as string) ?? "/analytics";
const FLUSH_INTERVAL_MS = 5000; // 5 seconds
// If this batch size is changed, be sure to adjust the ingest lambda accordingly!
const BATCH_SIZE = 10;

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

// Add data attributes to elements for analytics tracking
// Scroll captures intersection, interact captures clicks, focus, hovers, keydowns
export const getAnalyticsAttribute = (
	eventName: "scroll" | "interact",
	id: string | boolean,
	isDisabled?: boolean | null,
) => {
	if (isDisabled || disableAnalytics) return {};
	return { [`data-analytics-${eventName}`]: id };
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

const scrollWatcher = () => {
	const io = new IntersectionObserver(
		(entries, obs) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const target = entry.target as HTMLElement;
					obs.unobserve(target);
					analyticsEvent("scroll", target.dataset?.analyticsScroll);
				}
			});
		},
		// Adjust rootMargin to trigger after before the element is fully in view
		{ threshold: 0, rootMargin: "0px 0px -20px 0px" },
	);

	const scrollElements = document.querySelectorAll<HTMLElement>("[data-analytics-scroll]");
	scrollElements.forEach((el) => {
		io.observe(el);
	});
};

const interactWatcher = () => {
	const elements = document.querySelectorAll<HTMLElement>("[data-analytics-interact]");
	elements.forEach((el) => {
		el.addEventListener("click", () => analyticsEvent("click", el.dataset?.analyticsInteract), { once: true });
		el.addEventListener("focus", () => analyticsEvent("focus", el.dataset?.analyticsInteract), { once: true });
		el.addEventListener("mouseenter", () => analyticsEvent("hover", el.dataset?.analyticsInteract), { once: true });
		el.addEventListener(
			"keydown",
			(event) => {
				if (event.code === "Space" || event.code === "Enter") {
					analyticsEvent("keydown", el.dataset?.analyticsInteract);
				}
			},
			{ once: true },
		);
	});
};

function attachInteractionHandlers() {
	scrollWatcher();
	interactWatcher();
}

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

	attachInteractionHandlers();

	document.addEventListener("visibilitychange", handleVisibilityChange);
	window.addEventListener("pagehide", handlePageClose, { capture: true });
};
