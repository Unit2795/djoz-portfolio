export const PROPS_ATTRIBUTE = "data-props";

// Values travel as JSON. Functions and anything with methods (Date, Map, Set, class instances) would arrive broken,
// so they map to this message and fail the type check.
type JsonValue<T> = T extends string | number | boolean | null | undefined
	? T
	: T extends bigint | symbol | ((...args: never) => unknown)
		? "is not JSON-safe"
		: JsonSafe<T>;
export type JsonSafe<T> = { [K in keyof T]: JsonValue<T[K]> };

/**
 * Passes frontmatter values to a custom element's `<script>`, where a `PropsElement` reads them back as typed `this.props`.
 * Both sides use the `ElementProps` type the frontmatter exports, and the type argument is required, so a misspelled,
 * missing or mistyped value fails `astro check`. Values are sent as JSON: a Date, Map, Set, function or class instance
 * is a type error.
 *
 * @example
 * ---
 * import { elementProps } from "@/utils/elementProps";
 *
 * interface Props { interval: number }
 * // Props, Pick<Props, ...>, or a type of its own for values that don't come from Props
 * export type ElementProps = Props;
 * ---
 *
 * <my-element {...elementProps<ElementProps>({ interval: Astro.props.interval })}></my-element>
 *
 * <script>
 * 	import type { ElementProps } from "@/components/MyElement/MyElement.astro";
 * 	import { PropsElement } from "@/utils/PropsElement";
 *
 * 	class MyElement extends PropsElement<ElementProps> {
 * 		connectedCallback() {
 * 			setInterval(() => this.toggleAttribute("data-on"), this.props.interval);
 * 		}
 * 	}
 *
 * 	customElements.define("my-element", MyElement);
 * </script>
 */
export const elementProps = <T extends object & JsonSafe<T> = never>(props: NoInfer<T>) => ({
	[PROPS_ATTRIBUTE]: JSON.stringify(props),
});
