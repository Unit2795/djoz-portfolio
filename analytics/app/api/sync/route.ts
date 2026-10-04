export const dynamic = "force-dynamic";

import { syncEvents } from "@/lib/sync";

// Imports event files from S3 that are not in the local DuckDB yet
export async function POST() {
	try {
		return Response.json(await syncEvents());
	} catch (error) {
		console.error("Error syncing events from S3:", error);
		return new Response(error instanceof Error ? error.message : "Sync failed", { status: 500 });
	}
}
