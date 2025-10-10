export const dynamic = "force-dynamic";

import { toEndOfDay } from "@/lib/dates";
import { getDb } from "@/lib/db";
import { buildWhere } from "@/lib/queries";
import { SortingState } from "@tanstack/react-table";

export async function POST(request: Request) {
	const db = await getDb();
	const { from, to, page, sort, filters } = await request.json();
	const dbConnection = await db.connect();

	const fromMs = new Date(from).getTime();
	const toMs = toEndOfDay(new Date(to)).getTime(); // Ensure we capture inclusively up to end of day
	const pageNum = Number(page);
	const orderBy = buildOrderBy(sort);
	const where = buildWhere(filters);

	try {
		const tableResult = await dbConnection.runAndReadAll(
			`
				SELECT * FROM logs_v1
				WHERE timestamp BETWEEN ? AND ? ${where}
				${orderBy}
				LIMIT 20
				OFFSET 20 * (? - 1);
			`,
			[String(fromMs), String(toMs), pageNum]
		);

		const tableRows = tableResult.getRowObjectsJson();
		return Response.json({
			events: tableRows,
		});
	} catch (error) {
		console.error("Error fetching table data:", error);
		return new Response("Internal Server Error", { status: 500 });
	} finally {
		db.disconnect();
	}
}

const buildOrderBy = (sort: SortingState) => {
	if (!sort || sort.length === 0) return "";
	let result = "ORDER BY ";
	for (const [index, item] of sort.entries()) {
		const sortDirection = item.desc ? "DESC" : "ASC";
		// Add comma separator except for last item
		const hasAdditional = index < sort.length - 1 ? ", " : "";
		result += `${item.id} ${sortDirection}${hasAdditional}`;
	}
	return result;
};
