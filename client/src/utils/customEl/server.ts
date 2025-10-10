import { serverGuard } from "@/utils/guards";

/**
 * Creates a `data-props` attribute for a custom element, serializing an object into a string so that data defined in an Astro component’s frontmatter can be passed to the frontend.
 *
 * ⚠️ The generic type parameter `<T>` is required.
 * Omitting it will cause a type error to ensure the data shape is explicit.
 *
 * @example
 * props({ value: "123" }); // ❌ INVALID — missing generic type
 * props<{ value: string }>({ value: "123" }); // ✅ VALID
 *
 * @example
 * <MyComponent {...props<{ value: string }>({ value: "hello world!" })} />
 */
export function props<T = never>(values: NoInfer<T>): { "data-props": string } {
	serverGuard(
		"props() can only be used on the server. Ensure this function is not called in a browser-side context.",
	);

	return {
		"data-props": JSON.stringify(values),
	};
}
