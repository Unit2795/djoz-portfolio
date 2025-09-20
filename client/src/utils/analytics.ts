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

// Safely get user and session IDs by leveraging localStorage and sessionStorage if available
class SessionManager {
	private hasLocalStorage = false;
	private hasSessionStorage = false;
	private _sessionID: string | null = null;

	private _cacheUserID: string | null = null;
	private _cacheSessionID: string | null = null;

	constructor() {
		this._checkStorage();
	}

	_checkStorage() {
		this.hasLocalStorage = this._isAvailable("localStorage");
		this.hasSessionStorage = this._isAvailable("sessionStorage");
	}

	// Test if storage API is available and functional
	_isAvailable(type: "localStorage" | "sessionStorage") {
		try {
			const storage = window[type];
			const testKey = "__storage_test__";
			const testValue = "test";
			storage.setItem(testKey, testValue);
			const value = storage.getItem(testKey);
			storage.removeItem(testKey);
			return value === testValue;
		} catch {
			return false;
		}
	}

	// Generate a UUID using crypto API if available, otherwise fallback to timestamp and random number
	_generateUUID() {
		if (typeof window === "undefined") return "server";
		if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function")
			return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
		if (crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();

		return "uuidfailed";
	}

	get userID() {
		if (this._cacheUserID) return this._cacheUserID;
		try {
			if (this.hasLocalStorage) {
				const item = localStorage.getItem("userID");
				if (item) {
					this._cacheUserID = item;
					return item;
				} else {
					const newID = this._generateUUID();
					localStorage.setItem("userID", newID);
					this._cacheUserID = newID;
					return newID;
				}
			} else {
				this._cacheUserID = "no-local-storage";
				return "nolocalstorage";
			}
		} catch {
			this._cacheUserID = "localstorageerror";
			return "localstorageerror";
		}
	}

	get sessionID() {
		if (this._cacheSessionID) return this._cacheSessionID;
		if (this.hasSessionStorage) {
			const item = sessionStorage.getItem("sessionID");
			if (item) {
				this._cacheSessionID = item;
				return item;
			} else {
				const newID = this._generateUUID();
				sessionStorage.setItem("sessionID", newID);
				this._cacheSessionID = newID;
				return newID;
			}
		} else {
			this._sessionID = this._generateUUID();
			this._cacheSessionID = this._sessionID;
			return this._sessionID;
		}
	}
}

const sessionManager = new SessionManager();

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
	u: sessionManager.userID,
	s: sessionManager.sessionID,
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
	document.addEventListener("DOMContentLoaded", () => {
		// Send initial visit event
		sendImmediateEvent(events.visit);

		// Start the flush timer
		timer = setInterval(flushEvents, FLUSH_INTERVAL_MS);

		attachInteractionHandlers();

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("pagehide", handlePageClose, { capture: true });
	});
};
