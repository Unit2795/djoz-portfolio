// Debounce function implementation that delays execution until after `delay` milliseconds have passed since the last call
export function debounce<T extends unknown[]>(callback: (...args: T) => void, delay: number) {
	let timeout: NodeJS.Timeout | null = null;

	return (...args: T) => {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			callback(...args);
			timeout = null;
		}, delay);
	};
}
