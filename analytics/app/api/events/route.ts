export const dynamic = "force-dynamic";

import { convertMsToDays, getTimeStep, toEndOfDay, toISODate } from "@/lib/dates";
import { getDb } from "@/lib/db";
import { awsRegion, bucketName, bucketPathPrefix, concurrency, tmpDirectory } from "@/lib/envvars";
import { importNdjson } from "@/lib/etl/etl";
import { buildWhere } from "@/lib/queries";

export async function POST(request: Request) {
	const db = await getDb();
	const { force, from, to, filters } = await request.json();

	await importNdjson({
		bucket: bucketName,
		bucketPathPrefix,
		endDate: toISODate(to),
		startDate: toISODate(from),
		awsRegion,
		concurrency,
		tmpDir: tmpDirectory,
		force,
	});

	const dbConnection = await db.connect();

	const fromMs = new Date(from).getTime();
	const toMs = toEndOfDay(new Date(to)).getTime(); // Ensure we capture inclusively up to end of day
	const where = buildWhere(filters);

	try {
		const statsResult = await dbConnection.runAndReadAll(
			`
				SELECT 
					COUNT(*) AS event,
					COUNT(*) FILTER (WHERE eventType = 'visit') AS visit,
					COUNT(*) FILTER (WHERE eventType = 'exit') AS exit,
					COUNT(*) FILTER (WHERE eventType = 'scroll') AS scroll,
					COUNT(*) FILTER (WHERE eventType = 'click') AS click,
					COUNT(*) FILTER (WHERE eventType = 'focus') AS focus,
					COUNT(*) FILTER (WHERE eventType = 'hover') AS hover,
					COUNT(*) FILTER (WHERE eventType = 'keydown') AS keydown
				FROM logs_v1
				WHERE timestamp BETWEEN ? AND ? ${where}
			`,
			[String(fromMs), String(toMs)]
		);

		// Be warned! These are cast to bigints, they will be strings in JS.
		const statsRows = statsResult.getRowObjectsJson()[0];
		const totalDays = convertMsToDays(fromMs, toMs);
		const graphTicks = getTimeStep(totalDays);

		const graphResult = await dbConnection.runAndReadAll(
			`
				WITH
					params AS (
						SELECT
							CAST(? AS BIGINT) AS start_ms,
							CAST(? AS BIGINT) AS end_ms,
							CAST(? AS BIGINT) AS step_ms
					),
					src AS (
						SELECT *
						FROM logs_v1, params
						WHERE timestamp >= start_ms AND timestamp < end_ms ${where}
					),
					agg AS (
						-- Compute each event's bucket start using integer flooring
						SELECT
							p.start_ms
							+ CAST(FLOOR( (s.timestamp - p.start_ms)::DOUBLE / p.step_ms ) * p.step_ms AS BIGINT) AS bucket_start,
							COUNT(*) AS event,
							COUNT(*) FILTER (WHERE s.eventType = 'visit') AS visit,
							COUNT(*) FILTER (WHERE s.eventType = 'exit') AS exit,
							COUNT(*) FILTER (WHERE s.eventType = 'scroll') AS scroll,
							COUNT(*) FILTER (WHERE s.eventType = 'click') AS click,
							COUNT(*) FILTER (WHERE s.eventType = 'focus') AS focus,
							COUNT(*) FILTER (WHERE s.eventType = 'hover') AS hover,
							COUNT(*) FILTER (WHERE s.eventType = 'keydown') AS keydown
						FROM src s, params p
						GROUP BY 1
					),
					buckets AS (
						-- Generate all bucket starts so empty slices appear with zeros
						SELECT gs AS bucket_start
						FROM params, generate_series(start_ms, end_ms - step_ms, step_ms) AS t(gs)
					)
				SELECT
					b.bucket_start,
					COALESCE(a.event, 0) AS event,
					COALESCE(a.visit, 0) AS visit,
					COALESCE(a.exit, 0) AS exit,
					COALESCE(a.scroll, 0) AS scroll,
					COALESCE(a.click, 0) AS click,
					COALESCE(a.focus, 0) AS focus,
					COALESCE(a.hover, 0) AS hover,
					COALESCE(a.keydown, 0) AS keydown
				FROM buckets b
				CROSS JOIN params p
				LEFT JOIN agg a USING (bucket_start)
				ORDER BY b.bucket_start;
			`,
			[String(fromMs), String(toMs), String(graphTicks.ms)]
		);

		const graphRows = graphResult.getRowObjectsJson();

		return Response.json({
			stats: statsRows,
			totalDays,
			graph: {
				axis: graphTicks,
				data: graphRows,
			},
		});
	} catch (error) {
		console.error("Error fetching table data:", error);
		return new Response("Internal Server Error", { status: 500 });
	} finally {
		db.disconnect();
	}
}
