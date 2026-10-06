import { disableAnalytics } from "@/content";

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
