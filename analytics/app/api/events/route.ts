export const dynamic = "force-dynamic";

import { eventMetricKeys } from "@djoz-portfolio/shared";
import { DAY_MS, getTimeStep, toDayRange } from "@/lib/dates";
import { TABLE_NAME, withConnection } from "@/lib/db";
import { buildWhere } from "@/lib/queries";

// One count per metric: "event" counts everything, the rest count their event type. Cast to INT so they are numbers in JSON, not bigint strings.
const COUNT_COLUMNS = eventMetricKeys
	.map((key) =>
		key === "event" ? "COUNT(*)::INT AS event" : `(COUNT(*) FILTER (WHERE eventType = '${key}'))::INT AS ${key}`
	)
	.join(",\n");
// Buckets with no events get zeros instead of NULL
const COALESCE_COLUMNS = eventMetricKeys.map((key) => `COALESCE(a.${key}, 0) AS ${key}`).join(",\n");

export async function POST(request: Request) {
	const { from, to, filters } = await request.json();

	const { fromMs, toMs } = toDayRange(from, to);
	const where = buildWhere(filters);
	const axis = getTimeStep((toMs - fromMs) / DAY_MS);

	try {
		return await withConnection(async (connection) => {
			const statsResult = await connection.runAndReadAll(
				`
					SELECT ${COUNT_COLUMNS}
					FROM ${TABLE_NAME}
					WHERE timestamp >= ? AND timestamp < ? ${where}
				`,
				[String(fromMs), String(toMs)]
			);

			const graphResult = await connection.runAndReadAll(
				`
					WITH
						params AS (
							SELECT
								CAST(? AS BIGINT) AS start_ms,
								CAST(? AS BIGINT) AS end_ms,
								CAST(? AS BIGINT) AS step_ms
						),
						agg AS (
							-- Each event's bucket start, using integer division to floor
							SELECT
								p.start_ms + (s.timestamp - p.start_ms) // p.step_ms * p.step_ms AS bucket_start,
								${COUNT_COLUMNS}
							FROM ${TABLE_NAME} s, params p
							WHERE s.timestamp >= p.start_ms AND s.timestamp < p.end_ms ${where}
							GROUP BY 1
						),
						buckets AS (
							-- Every bucket start in [start, end), so empty slices appear with zeros. The last bucket may be partial.
							SELECT gs AS bucket_start
							FROM params, range(start_ms, end_ms, step_ms) AS t(gs)
						)
					SELECT
						b.bucket_start,
						${COALESCE_COLUMNS}
					FROM buckets b
					LEFT JOIN agg a USING (bucket_start)
					ORDER BY b.bucket_start;
				`,
				[String(fromMs), String(toMs), String(axis.ms)]
			);

			return Response.json({
				stats: statsResult.getRowObjectsJson()[0],
				graph: {
					axis,
					data: graphResult.getRowObjectsJson(),
				},
			});
		});
	} catch (error) {
		console.error("Error fetching events data:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
