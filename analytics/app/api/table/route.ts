export const dynamic = "force-dynamic";

import { toDayRange } from "@/lib/dates";
import { TABLE_NAME, withConnection } from "@/lib/db";
import { buildWhere, TABLE_PAGE_SIZE } from "@/lib/queries";
import { SortingState } from "@tanstack/react-table";

export async function POST(request: Request) {
	const { from, to, page, sort, filters } = await request.json();

	const { fromMs, toMs } = toDayRange(from, to);
	const pageNum = Number(page);
	const orderBy = buildOrderBy(sort);
	const where = buildWhere(filters);

	try {
		return await withConnection(async (connection) => {
			const countResult = await connection.runAndReadAll(
				`
					SELECT COUNT(*)::INT AS total FROM ${TABLE_NAME}
					WHERE timestamp >= ? AND timestamp < ? ${where}
				`,
				[String(fromMs), String(toMs)]
			);

			const tableResult = await connection.runAndReadAll(
				`
					SELECT * EXCLUDE (filename) FROM ${TABLE_NAME}
					WHERE timestamp >= ? AND timestamp < ? ${where}
					${orderBy}
					LIMIT ${TABLE_PAGE_SIZE}
					OFFSET ${TABLE_PAGE_SIZE} * (? - 1);
				`,
				[String(fromMs), String(toMs), pageNum]
			);

			return Response.json({
				events: tableResult.getRowObjectsJson(),
				total: countResult.getRowObjectsJson()[0].total,
			});
		});
	} catch (error) {
		console.error("Error fetching table data:", error);
		return new Response("Internal Server Error", { status: 500 });
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
