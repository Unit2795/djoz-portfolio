// Client-only: import this from <script> tags, never from frontmatter (HTMLElement doesn't exist on the server)
import { PROPS_ATTRIBUTE } from "@/utils/elementProps";

/**
 * Base class for custom elements that receive frontmatter values through `elementProps`.
 * Pass the same `ElementProps` type the frontmatter gives `elementProps<ElementProps>()` to get a typed `this.props`.
 */
export class PropsElement<T extends object> extends HTMLElement {
	#props?: T;

	// Parsed on first read, then cached
	protected get props(): T {
		if (this.#props) return this.#props;

		const json = this.getAttribute(PROPS_ATTRIBUTE);
		if (json === null) {
			throw new Error(
				`<${this.localName}> has no ${PROPS_ATTRIBUTE} attribute. Spread elementProps<...>() onto it in the component's markup.`,
			);
		}
		this.#props = JSON.parse(json) as T;
		return this.#props;
	}
}
