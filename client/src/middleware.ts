import { defineMiddleware } from "astro:middleware";

// https://andrewmara.com/blog/generate-unique-ids-per-request-in-astro
export const onRequest = defineMiddleware(async (context, next) => {
	context.locals.getId = (() => {
		const map = new Map<string, number>();
		return () => {
			const page = context.url?.pathname ?? "global";
			const count = (map.get(page) ?? 0) + 1;
			map.set(page, count);
			return `uid-${count}`;
		};
	})();

	return await next();
});
