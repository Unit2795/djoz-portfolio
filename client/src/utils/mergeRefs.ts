// https://github.com/wojtekmaj/merge-refs/blob/main/src/index.ts

import {
	MutableRefObject,
	Ref,
	RefCallback
} from "react";

/**
 * A function that merges React refs into one.
 * Supports both functions and ref objects created using createRef() and useRef().
 *
 * Usage:
 * ```tsx
 * <div ref={mergeRefs(ref1, ref2, ref3)} />
 * ```
 */
export default function mergeRefs<T>(
	...inputRefs: ( Ref<T> | undefined )[]
): Ref<T> | RefCallback<T> {
	const filteredInputRefs = inputRefs.filter( Boolean );

	if ( filteredInputRefs.length <= 1 ) {
		const firstRef = filteredInputRefs[ 0 ];

		return firstRef ?? null;
	}

	return function mergedRefs( ref ) {
		for ( const inputRef of filteredInputRefs ) {
			if ( typeof inputRef === "function" ) {
				inputRef( ref );
			} else if ( inputRef ) {
				( inputRef as MutableRefObject<T | null> ).current = ref;
			}
		}
	};
}
