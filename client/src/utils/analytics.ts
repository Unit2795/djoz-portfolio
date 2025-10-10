import { disableAnalytics } from "@/content";
import { type AnalyticsEvent, type EventName, events, FLUSH_INTERVAL_MS } from "@djoz-portfolio/shared";

const analyticsEndpoint = (import.meta.env.PUBLIC_API_INGEST_ENDPOINT as string) ?? "/api/ingest";
// If this batch size is changed, be sure to adjust the ingest lambda accordingly!
const BATCH_SIZE = 10;

const eventQueue: AnalyticsEvent[] = [];
let timer: NodeJS.Timeout | null = null;
let batchStartTime: number | null = null;

// Get current time with high resolution if available
const getNow = () => {
	if (typeof performance !== "undefined" && performance.now) {
		return performance.now();
	}
	return Date.now();
};

const getOffsetMs = () => {
	if (!batchStartTime) batchStartTime = getNow();
	const offset = getNow() - batchStartTime;

	return offset;
};

/* 
	Generate a unique ID, preferring crypto.randomUUID if available.
	Fallback to a combination of timestamp and random number if not.
*/
const genUUID = () => {
	if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function")
		return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	if (crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();

	return "uuidfailed";
};
/* 
	Check if localStorage is functional
*/
const localStorageFunctional = () => {
	try {
		const value = "test";
		const key = "__analytics_storage_test__";
		localStorage.setItem(key, value);
		const readout = localStorage.getItem(key);
		localStorage.removeItem(key);
		return value === readout;
	} catch {
		return false;
	}
};
/* 
	Retrieve or generate a persistent session ID
*/
let _cachedSessionId: string | null = null;
const getSessionId = () => {
	if (_cachedSessionId) return _cachedSessionId;
	if (localStorageFunctional()) {
		let sessionId = sessionStorage.getItem("sessionID");
		if (!sessionId) {
			sessionId = genUUID();
			sessionStorage.setItem("sessionID", sessionId);
		}
		_cachedSessionId = sessionId;
		return sessionId;
	} else {
		_cachedSessionId = genUUID();
		return _cachedSessionId;
	}
};

// Add an analytics event to the queue and flush if batch size reached
export const analyticsEvent = (eventName: EventName, id?: string) => {
	eventQueue.push(createEvent(eventName, id, getOffsetMs()));

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
const sendImmediateEvent = (eventName: EventName, id?: string) => {
	return sendEvents([createEvent(eventName, id, getOffsetMs())]);
};

// Handle page close - flush queue and send exit event
const handlePageClose = () => {
	const finalEvents = [...eventQueue, createEvent(events.exit, undefined, getOffsetMs())];
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
const createEvent = (eventType: EventName, id?: string, offsetMs?: number): AnalyticsEvent => ({
	// ⚠️If the AnalyticsEvent schema changes, be sure to adjust the ingest & processor lambda accordingly!
	eventType,
	sessionId: getSessionId(),
	id,
	offsetMs: Math.round(offsetMs ?? 0), // milliseconds since batch start
});

// Send events to the server using fetch or sendBeacon
const sendEvents = async (events: AnalyticsEvent[], useBeacon = false) => {
	if (!events.length) return;

	const payload = JSON.stringify({ events });

	if (useBeacon) {
		// Give the server a JSON Content-Type even though we can't set headers
		const blob = new Blob([payload], { type: "application/json; charset=UTF-8" });
		const queued = navigator.sendBeacon(analyticsEndpoint, blob);

		// If the beacon queue rejects (too big), fall back to fetch
		if (!queued) {
			return fetch(analyticsEndpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: payload,
				keepalive: true,
			});
		}

		return;
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
	batchStartTime = null; // Reset batch timer for next batch
	return sendEvents(eventsToSend);
};

export const initAnalytics = () => {
	// Send initial visit event
	sendImmediateEvent(events.visit);

	// Start the flush timer
	timer = setInterval(flushEvents, FLUSH_INTERVAL_MS);

	attachInteractionHandlers();

	document.addEventListener("visibilitychange", handleVisibilityChange);
	window.addEventListener("pagehide", handlePageClose, { capture: true });
};
