export const PROPS_ATTRIBUTE = "data-props";

/**
 * Passes frontmatter values to a custom element's <script>, where a `PropsElement` reads them back as typed `this.props`.
 * The type argument is required, so the frontmatter and the script share one contract: a misspelled, missing or
 * mistyped key is a type error on either side. Values are JSON-serialized, so only pass JSON-safe data.
 *
 * @example
 * export type ElementProps = { interval: number }; // frontmatter
 * <my-element {...elementProps<ElementProps>({ interval: 250 })}> // markup
 * class MyElement extends PropsElement<ElementProps> {} // <script>, reads this.props.interval
 */
export const elementProps = <T extends object = never>(props: NoInfer<T>) => ({
	[PROPS_ATTRIBUTE]: JSON.stringify(props),
});
