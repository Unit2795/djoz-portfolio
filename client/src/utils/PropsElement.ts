// Client-only: import this from <script> tags, never from frontmatter (HTMLElement doesn't exist on the server)
import { PROPS_ATTRIBUTE, type JsonSafe } from "@/utils/elementProps";

/**
 * Base class for custom elements that receive frontmatter values through `elementProps` (its JSDoc has a full example).
 * Pass the frontmatter's `ElementProps` type to read them as typed `this.props`. Elements without props extend `HTMLElement`.
 * Class fields may query children and read `this.props`, since Astro runs component scripts after the page is parsed.
 */
export class PropsElement<T extends object & JsonSafe<T>> extends HTMLElement {
	#props?: T;

	// Parsed on first read, then cached
	protected get props(): T {
		if (this.#props) return this.#props;

		const json = this.getAttribute(PROPS_ATTRIBUTE);
		if (json === null) {
			throw new Error(
				`<${this.localName}> has no ${PROPS_ATTRIBUTE} attribute. Spread elementProps<ElementProps>() onto it in the component's markup.`,
			);
		}
		this.#props = JSON.parse(json) as T;
		return this.#props;
	}
}
