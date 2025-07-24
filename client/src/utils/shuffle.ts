import { hashString } from "@/utils/hash";
import { makeRng } from "@/utils/rng";

/* 
	Returns a new array that is a deterministic Fisher–Yates shuffle of the input array, based on the given seed string. The order is stable for the same seed.
*/
export const shuffleDeterministic = <T>(array: T[], seed: string): T[] => {
	const rng = makeRng(hashString(seed));
	const a = array.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};
