import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
	// This will only work in development
	if (request.headers.get("Content-Type") === "application/json") {
		console.log(await request.json());
		return new Response(null, { status: 200 });
	}
	// In production, return 404 or redirect
	return new Response("Not found", { status: 404 });
};
