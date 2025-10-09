import { readFile, writeFile } from "fs/promises";

/* 
	This is useful for tracking date ranges of data ingestion to avoid re-processing data that may already be present in the DuckDB database.

	This returns date range gaps detected from the existing ranges given an input range. This includes an array of every single day in those gaps, which we iterate to retrieve their data from S3.

	This manages a JSON file containing an array of date range tuples, and can find gaps in coverage when given a new date range to process.
*/

// Pair of ISO YYYY-MM-DD dates
type DateRange = [string, string];
type DateRanges = DateRange[];

interface ProcessResult {
	gaps: DateRanges;
	days: string[];
}

class DateRangeManager {
	filePath: string;

	constructor(filePath: string) {
		this.filePath = filePath;
	}

	/**
	 * Finds gaps between an input range and existing ranges, then updates the file
	 * Returns both the gap ranges and individual days within those gaps
	 */
	async processRange(inputRange: DateRange): Promise<ProcessResult> {
		const existingRanges = await this.loadRanges();
		const gaps = this.findGaps(inputRange, existingRanges);
		const days = this.expandRangesToDays(gaps);

		// Merge the input range with existing ranges and save
		const mergedRanges = this.mergeRanges([...existingRanges, inputRange]);
		await this.saveRanges(mergedRanges);

		return { gaps, days };
	}

	/**
	 * Finds portions of the input range not covered by existing ranges
	 */
	findGaps(inputRange: DateRange, existingRanges: DateRanges): DateRanges {
		if (existingRanges.length === 0) {
			return [inputRange];
		}

		const [inputStart, inputEnd] = inputRange;
		const sortedRanges = [...existingRanges].sort((a, b) => a[0].localeCompare(b[0]));
		const gaps: DateRanges = [];

		let currentPosition = inputStart;

		for (const [rangeStart, rangeEnd] of sortedRanges) {
			// Skip ranges that end before our current position
			if (rangeEnd < currentPosition) {
				continue;
			}

			// If we've passed the end of the input range, we're done
			if (rangeStart > inputEnd) {
				break;
			}

			// Add gap before this range if it exists
			if (rangeStart > currentPosition) {
				const gapEnd = this.minDate(this.addDays(rangeStart, -1), inputEnd);
				gaps.push([currentPosition, gapEnd]);
			}

			// Move position past this range
			currentPosition = this.maxDate(this.addDays(rangeEnd, 1), currentPosition);

			// If we've covered the entire input range, we're done
			if (currentPosition > inputEnd) {
				break;
			}
		}

		// Add final gap if there's remaining uncovered range
		if (currentPosition <= inputEnd) {
			gaps.push([currentPosition, inputEnd]);
		}

		return gaps;
	}

	/**
	 * Expands date ranges into an array of individual date strings
	 */
	expandRangesToDays(ranges: DateRanges): string[] {
		const allDays: string[] = [];

		for (const [startDate, endDate] of ranges) {
			let currentDate = startDate;

			while (currentDate <= endDate) {
				allDays.push(currentDate);
				currentDate = this.addDays(currentDate, 1);
			}
		}

		return allDays;
	}

	/**
	 * Merges overlapping or adjacent date ranges
	 */
	mergeRanges(ranges: DateRanges): DateRanges {
		if (ranges.length <= 1) {
			return ranges;
		}

		const sorted = [...ranges].sort((a, b) => a[0].localeCompare(b[0]));
		const merged: DateRanges = [sorted[0]];

		for (let i = 1; i < sorted.length; i++) {
			const lastMerged = merged[merged.length - 1];
			const current = sorted[i];

			// Check if ranges overlap or are adjacent (within 1 day)
			if (this.addDays(lastMerged[1], 1) >= current[0]) {
				// Extend the last merged range
				lastMerged[1] = this.maxDate(lastMerged[1], current[1]);
			} else {
				// Add as a new separate range
				merged.push(current);
			}
		}

		return merged;
	}

	// File I/O methods
	async loadRanges(): Promise<DateRanges> {
		try {
			const content = await readFile(this.filePath, "utf8");
			return JSON.parse(content);
		} catch (error) {
			// Return empty array if file doesn't exist
			return [];
		}
	}

	async saveRanges(ranges: DateRanges): Promise<void> {
		await writeFile(this.filePath, JSON.stringify(ranges, null, 2));
	}

	// Date utility methods
	addDays(dateString: string, days: number): string {
		const date = new Date(dateString + "T00:00:00");
		date.setDate(date.getDate() + days);
		return date.toISOString().split("T")[0];
	}

	minDate(date1: string, date2: string): string {
		return date1 < date2 ? date1 : date2;
	}

	maxDate(date1: string, date2: string): string {
		return date1 > date2 ? date1 : date2;
	}
}

// Example usage
async function example() {
	const manager = new DateRangeManager("date-ranges.json");

	// Your example: existing ranges and new input range
	await manager.saveRanges([
		["2025-08-14", "2025-08-23"],
		["2025-09-21", "2025-09-30"],
	]);

	const result = await manager.processRange(["2025-06-01", "2025-10-24"]);

	console.log("Gaps found:", result.gaps);
	// Expected output:
	// [
	//   ['2025-06-01', '2025-08-13'],
	//   ['2025-08-24', '2025-09-20'],
	//   ['2025-10-01', '2025-10-24']
	// ]

	console.log("Total gap days:", result.days.length);
	console.log("First 5 gap days:", result.days.slice(0, 5));
	// Expected output: ['2025-06-01', '2025-06-02', '2025-06-03', '2025-06-04', '2025-06-05']

	const updatedRanges = await manager.loadRanges();
	console.log("Updated file:", updatedRanges);
	// Expected output: [['2025-06-01', '2025-10-24']]
}

export default DateRangeManager;
export type { DateRange, DateRanges, ProcessResult };
