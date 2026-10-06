import type { TimeSteps } from "@djoz-portfolio/shared";

export const HOUR_MS = 1000 * 60 * 60;
export const DAY_MS = HOUR_MS * 24;

// Convert a date string or Date to YYYY-MM-DD format
export const toISODate = (dateString: string | Date) => {
	const date = new Date(dateString);
	return date.toISOString().split("T")[0];
};

// Half-open UTC range [from 00:00, day after to 00:00) so both selected days are included in full
export const toDayRange = (from: string, to: string) => {
	const fromMs = Date.parse(toISODate(from));
	const toMs = Date.parse(toISODate(to)) + DAY_MS;
	return { fromMs, toMs };
};

// Friendly hour/day increments for chart axis intervals.
const HOUR_STEPS = [1, 2, 3, 4, 6, 8, 12, 16];
const DAY_STEPS = [1, 2, 3, 5, 7, 10, 14, 21, 28, 60, 90, 120, 180, 365];
// Give a number of days and desired number of steps, return smallest appropriate time step for charting in hours or days
export const getTimeStep = (totalDays: number, maxTicks: number = 60): TimeSteps => {
	const totalHours = totalDays * 24;

	// First: Attempt to determine a friendly hour step
	for (const h of HOUR_STEPS) {
		if (Math.floor(totalHours / h) <= maxTicks) {
			return { unit: "hour", ms: h * HOUR_MS };
		}
	}

	// Next: Attempt to determine a friendly day step
	for (const d of DAY_STEPS) {
		if (Math.floor(totalDays / d) <= maxTicks) {
			return { unit: "day", ms: d * DAY_MS };
		}
	}

	// Only reached for ranges over ~60 years
	return { unit: "day", ms: DAY_STEPS[DAY_STEPS.length - 1] * DAY_MS };
};
