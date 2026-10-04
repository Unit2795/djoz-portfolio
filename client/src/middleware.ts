import { defineMiddleware } from "astro:middleware";

// Generates globally unique IDs (unique per page), mainly for accessibility attributes.
// https://andrewmara.com/blog/generate-unique-ids-per-request-in-astro
export const onRequest = defineMiddleware(async (context, next) => {
	let count = 0;
	context.locals.getId = () => `uid-${++count}`;

	return await next();
});
