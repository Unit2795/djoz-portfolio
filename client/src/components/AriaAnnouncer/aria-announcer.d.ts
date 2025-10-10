export type AriaAnnouncePriority = "polite" | "assertive";

export type AriaAnnouncerFn = (message: string, priority?: AriaAnnouncePriority) => void;

declare global {
	interface Window {
		/**
		 * Announce a message to screen readers
		 * @param message - The message to announce
		 * @param priority - The priority level ('polite' or 'assertive'). Defaults to 'polite'
		 * @example
		 * ```ts
		 * window.announce('Document saved successfully');
		 * window.announce('Error: Connection lost', 'assertive');
		 * ```
		 */
		announce: AriaAnnouncerFn;
	}
}

// This export makes the file a module and prevents global scope pollution
export {};
