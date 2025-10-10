import { clientGuard } from "@/utils/guards";

// Define a base class for custom elements that can only be used on the client
const HTMLElementBase: typeof HTMLElement = clientGuard(
	"Custom elements can only be defined in the browser. Are you accidentally importing this file in a server context?",
)
	? HTMLElement
	: class extends HTMLElement {};

/**
 * Abstract base class for typed custom elements.
 *
 * Ensures that custom elements created with {@link customEl} have
 * properly typed access to their `this.props` value, which represents
 * deserialized `data-props` passed from an Astro component's frontmatter using {@link ./props.ts/props}.
 *
 * ⚠️ If the generic type parameter `<T>` is not provided to the CustomEl abstract class, accessing `this.props` will throw a type error.
 *
 * @example
 * class MyEl extends CustomEl<{ message: string }> {
 *   connectedCallback() {
 *     console.log(this.props.message); // typed as string
 *   }
 */
export abstract class CustomEl<T = undefined> extends HTMLElementBase {
	declare props: T;
}

/**
 * Registers a custom element web component for use in Astro components.
 *
 * This helper is particularly useful when you need to pass serialized
 * frontmatter data from Astro into the frontend. It enables deserialization
 * through `this.props`, providing a typed and convenient way to access
 * server-provided data inside your component instance.
 *
 * Features:
 * - Defines a `props` property on the element prototype that automatically
 *   deserializes the `data-props` attribute into a typed object.
 * - Registers the element with the Custom Elements Registry so it can be
 *   directly used in the DOM.
 *
 * * ⚠️ If the generic type parameter `<T>` is not provided to the CustomEl abstract class, accessing `this.props` will throw a type error.
 *
 * @example
 * customEl(
 * 	 "djoz-nav",
 *   class DjozNav extends CustomEl<Expose> {
 *     sections = this.props.sections;
 *
 *     connectedCallback() {
 *       console.log("Navbar initialized with:", this.sections);
 *     }
 *   }
 * );
 * // Usage in DOM:
 * // <my-component {...props({mydata: "myvalue"})}></my-component>
 *
 */
export function customEl(elementName: string, construct: CustomElementConstructor, opts?: ElementDefinitionOptions) {
	try {
		// Allow this.props to quickly deserialize and read the "data-props" attribute
		const attr = "data-props";
		const field = "props";
		Object.defineProperty(construct.prototype, field, {
			get(this: HTMLElement) {
				const raw = this.getAttribute(attr);
				if (raw == null) return undefined;
				try {
					return JSON.parse(raw);
				} catch {
					return undefined;
				}
			},
			configurable: true,
			enumerable: false,
		});

		customElements.define(elementName, construct, opts);
	} catch (error) {
		console.error("Failed to define custom element:", error);
	}
}
