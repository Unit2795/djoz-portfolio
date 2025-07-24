// Inspired by: https://tech.reverse.hr/articles/understanding-the-throttle-function-in-typescript
// Trailing throttle function implementation that ensures the callback is called at most once every `delay` milliseconds
export function throttle<T extends unknown[]>(callback: (...args: T) => void, delay: number) {
	let timeout: NodeJS.Timeout | null = null;
	let lastArgs: T | null = null;

	return (...args: T) => {
		lastArgs = args;

		if (!timeout) {
			timeout = setTimeout(() => {
				callback(...lastArgs!);
				timeout = null;
				lastArgs = null;
			}, delay);
		}
	};
}
