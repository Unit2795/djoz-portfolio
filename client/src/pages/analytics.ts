import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
	console.log(await request.json());

	return new Response(null, { status: 200 });
};
