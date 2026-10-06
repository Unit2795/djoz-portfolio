export const dynamic = "force-dynamic";

import { syncEvents } from "@/lib/sync";

// Imports event files from S3 that are not in the local DuckDB yet. With { rebuild: true }, empties the table and imports every file again
export async function POST(request: Request) {
	try {
		const { rebuild } = await request.json();
		return Response.json(await syncEvents(rebuild === true));
	} catch (error) {
		console.error("Error syncing events from S3:", error);
		return new Response(error instanceof Error ? error.message : "Sync failed", { status: 500 });
	}
}
