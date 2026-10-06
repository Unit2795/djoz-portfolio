import { type AnalyticsEvent, BATCH_SIZE, type EventName, events, FLUSH_INTERVAL_MS } from "@djoz-portfolio/shared";

// Same-origin by default. Set PUBLIC_API_INGEST_ENDPOINT at build time to send events elsewhere (see docs/analytics.md)
const analyticsEndpoint = import.meta.env.PUBLIC_API_INGEST_ENDPOINT || "/api/ingest";

// Queued events, each with the performance.now() time it happened. Unlike Date.now(), it isn't affected by changes to the device's clock
const eventQueue: { event: AnalyticsEvent; createdAt: number }[] = [];

/*
	Retrieve or generate a session ID, kept in sessionStorage so it survives reloads in the same tab
*/
let _cachedSessionId: string | null = null;
// crypto.randomUUID only exists on HTTPS and localhost, not plain HTTP on a LAN address (e.g. `astro dev --host`)
const newSessionId = () =>
	crypto.randomUUID?.() ?? `${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
const getSessionId = () => {
	if (_cachedSessionId) return _cachedSessionId;
	try {
		_cachedSessionId = sessionStorage.getItem("sessionID");
		if (!_cachedSessionId) {
			_cachedSessionId = newSessionId();
			sessionStorage.setItem("sessionID", _cachedSessionId);
		}
	} catch {
		// sessionStorage is unavailable (e.g. blocked by privacy settings), keep the ID in memory for this page load
		_cachedSessionId ??= newSessionId();
	}
	return _cachedSessionId;
};

// Add an analytics event to the queue and flush if batch size reached
export const analyticsEvent = (eventName: EventName, id?: string) => {
	eventQueue.push({ event: createEvent(eventName, id), createdAt: performance.now() });

	if (eventQueue.length >= BATCH_SIZE) {
		flush();
	}
};

// Handle page close - queue the exit event and send everything left in the queue
const handlePageClose = () => {
	analyticsEvent(events.exit);
	flush();
};

// Send queued events when the page is hidden, it may never become visible again (e.g. a mobile browser killing the tab)
const handleVisibilityChange = () => {
	if (document.visibilityState === "hidden") {
		flush();
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
		// Record only the first Space/Enter press, other keys (e.g. Tab) shouldn't use up the listener
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.code === "Space" || event.code === "Enter") {
				el.removeEventListener("keydown", handleKeydown);
				analyticsEvent("keydown", el.dataset?.analyticsInteract);
			}
		};
		el.addEventListener("keydown", handleKeydown);
	});
};

function attachInteractionHandlers() {
	scrollWatcher();
	interactWatcher();
}

// Create an analytics event object with the required metadata
const createEvent = (eventType: EventName, id?: string): AnalyticsEvent => ({
	// ⚠️If the AnalyticsEvent schema changes, be sure to adjust the ingest & processor lambda accordingly!
	eventType,
	sessionId: getSessionId(),
	id,
});

/*
	Empty the queue and send its events to the server.
	sendBeacon is used for every send because the browser still delivers it after the page is hidden or closed.
	If the browser refuses the beacon (e.g. its size quota is used up), fetch sends the batch instead so it isn't lost.
*/
const flush = () => {
	if (!eventQueue.length) return;

	// Each event is sent with its age, the server subtracts it from the time it receives the batch to get the event's time
	const now = performance.now();
	const batch = eventQueue
		.splice(0, eventQueue.length)
		.map(({ event, createdAt }): AnalyticsEvent => ({ ...event, ageMs: Math.round(now - createdAt) }));
	const payload = JSON.stringify({ events: batch });
	// Give the server a JSON Content-Type even though we can't set headers
	const blob = new Blob([payload], { type: "application/json; charset=UTF-8" });
	if (!navigator.sendBeacon(analyticsEndpoint, blob)) {
		fetch(analyticsEndpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: payload,
		}).catch(() => {});
	}
};

export const initAnalytics = () => {
	// Send the visit event right away
	analyticsEvent(events.visit);
	flush();

	// Periodically send any queued events
	setInterval(flush, FLUSH_INTERVAL_MS);

	attachInteractionHandlers();

	document.addEventListener("visibilitychange", handleVisibilityChange);
	window.addEventListener("pagehide", handlePageClose, { capture: true });
};
