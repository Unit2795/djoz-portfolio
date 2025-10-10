/* 
	Lightweight deterministic PRNG used to create stable random-like sequences.
	Algorithm: mulberry32 (public domain), good enough for UI shuffles.
*/
export const makeRng = (seed: number) => {
	let t = seed >>> 0;
	return () => {
		t += 0x6d2b79f5;
		let x = Math.imul(t ^ (t >>> 15), 1 | t);
		x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
		return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
	};
};
