export const ids = {
	nav: {
		root: "navbar",
		mobileMenuButton: "mobile-menu-button",
		mobileMenu: "mobile-menu",
	},
} as const;

type NestedStringObject = {
	[key: string]: string | NestedStringObject;
};

/**
 * Recursively verifies that all string values in a nested object are globally unique. If any duplicate value is found,
 * the function will throw a descriptive error with the path to the offending entry. Useful for catching issues at
 * build time in projects that centralize ID definitions.
 *
 * An example use case is objects that define element IDs, where duplicate IDs can lead to invalid or ambiguous DOM
 * behavior.
 *
 *
 * @template T - A deeply nested object whose leaf values are strings.
 * @param {T} obj - The object to validate for uniqueness.
 * @returns {T} The original object if all values are unique.
 * @throws {Error} If duplicate string values are detected.
 */
function assertUniqueValues<T extends NestedStringObject>(obj: T): T {
	// Set to track string values encountered to detect duplicates
	const seenValues = new Set<string>();

	// Recursive function to traverse nested objects
	function walk(currentObject: NestedStringObject, currentPath: string[] = []) {
		for (const [currentKey, currentId] of Object.entries(currentObject)) {
			// Build the current JSON path by adding the current key to the path array (e.g. ["nav", "root"])
			const activePath = [...currentPath, currentKey];
			// Dot-notation string for current path (e.g. "nav.root")
			const pathString = activePath.join(".");

			// If current value is a string (leaf node)
			if (typeof currentId === "string") {
				if (seenValues.has(currentId)) {
					throw new Error(
						`Duplicate ID value ("${currentId}") found at path "${pathString}". All ID values must be unique.`,
					);
				}
				seenValues.add(currentId);
			} else if (typeof currentId === "object" && currentId !== null) {
				walk(currentId, activePath);
			} else {
				throw new Error(`Invalid value at path "${pathString}": must be a string or nested object.`);
			}
		}
	}

	walk(obj);
	return obj;
}

// Ensure that all IDs are unique at build time, but do not bundle this in production builds.
if (import.meta.env.SSR) {
	assertUniqueValues(ids);
}
