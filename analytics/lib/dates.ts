import { TimeSteps } from "@djoz-portfolio/shared";

export const HOUR_MS = 1000 * 60 * 60;
export const DAY_MS = HOUR_MS * 24;

// End of Day in UTC
export const toEndOfDay = (date: Date) => {
	const d = new Date(date);
	d.setUTCHours(23, 59, 59, 999);
	return d;
};

// Convert milliseconds to number of days, rounding up
export const convertMsToDays = (from: number, to: number) => {
	return Math.ceil((to - from) / DAY_MS);
};

// Convert 24-hour time to 12-hour AM/PM format
export const convertToAmPm = (utcHour: number) => {
	let period = utcHour >= 12 ? "PM" : "AM";
	let hour = utcHour % 12;
	// If hour is 0, it should be 12 (midnight or noon)
	hour = hour === 0 ? 12 : hour;
	return `${hour} ${period}`;
};

// Convert a date string or Date to YYYY-MM-DD format
export const toISODate = (dateString: string | Date) => {
	const date = new Date(dateString);
	return date.toISOString().split("T")[0];
};

// Friendly hour/day increments for chart axis intervals.
const HOUR_STEPS = [1, 2, 3, 4, 6, 8, 12, 16];
const DAY_STEPS = [1, 2, 3, 5, 7, 10, 14, 21, 28, 60, 90, 120, 180, 365];
// Give a number of days and desired number of steps, return smallest appropriate time step for charting in hours or days
export const getTimeStep = (totalDays: number, maxTicks: number = 60): TimeSteps => {
	const totalHours = totalDays * 24;

	// First: Attempt to determine a friendly hour step
	for (const h of HOUR_STEPS) {
		const n = Math.floor(totalHours / h);
		if (n <= maxTicks) {
			return { unit: "hour", step: h, ticks: n, ms: h * HOUR_MS };
		}
	}

	// Next: Attempt to determine a friendly day step
	for (const d of DAY_STEPS) {
		const n = Math.floor(totalDays / d);
		if (n <= maxTicks) {
			return { unit: "day", step: d, ticks: n, ms: d * DAY_MS };
		}
	}

	// Fallback: Cannot find a friendly step, create an approximate but arbitrary one
	const roughTickSize = totalDays / maxTicks;
	const pow10 = Math.pow(10, Math.floor(Math.log10(roughTickSize)));
	const candidates = [1, 2, 5].map((m) => m * pow10).concat([10 * pow10]);
	let best = candidates.find((d) => d >= roughTickSize);
	if (best === undefined) best = 10 * pow10;
	const ticks = Math.floor(totalDays / best);

	return { unit: "day", step: best, ticks, ms: best * DAY_MS };
};
