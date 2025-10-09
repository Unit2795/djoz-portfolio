import { TableFilter } from "@/components/sections/Table/Table";

// Columns that will use wildcard matching instead of exact matching
const wildcardColumns = ["ip", "userAgent", "m"];

/* 
	Builds a SQL WHERE clause from an incoming array of filters

	Each filter is an object with 'id' (column name), 'value' (filter value), and 'exclude' (boolean for exclusion)
	
	Multiple inclusive filters on the same column are combined with OR, exclusive filters use AND (to combine exclusions)

	Wildcard matching is used for certain columns defined in wildcardColumns

	Returns a string like "AND e = 'scroll' AND (e != 'visit' AND e != 'exit') AND ip LIKE '%127.0.0.1%' AND (ip NOT LIKE '%192.18.0.1%' AND ip NOT LIKE '%192.18.0.2%') AND (m LIKE '%Intro%' OR m LIKE '%NavLink%')"

	- If you have multiple inclusions for the same column, you don’t want all of them to be true at once (that’s impossible: e.g., event = 'scroll' AND event = 'visit'). Instead, you want any one of them to match. That means you combine them with OR, like: (event = 'scroll' OR event = 'visit')
	- If you have multiple exclusions for the same column, you want to block all of them. That means you combine them with AND like: (event != 'scroll' AND event != 'visit')
	- You could mix inclusions and exclusions on the same column. In which case you join both with "AND", because both rules need to hold true. Like: (user_agent LIKE '%Mozilla%' OR user_agent LIKE '%Chrome%') AND (user_agent NOT LIKE '%Windows%' AND user_agent NOT LIKE '%Edge%')
		- This means: the user agent must include either "Mozilla" or "Chrome" AND at the same time, must not include "Windows" or "Edge."
	- Parentheses tell SQL how to group the logic together. Without them, SQL may misapply the AND/OR order.

	If no filters are provided, returns an empty string
*/
export const buildWhere = (filters: TableFilter[]) => {
	// If no filters are provided, nothing to build
	if (!filters?.length) return "";

	// Group filters by column id into include/exclude buckets, skipping empty values
	const groupedFilters = new Map<string, { includes: string[]; excludes: string[] }>();

	/* 
		Group filters by column and inclusion/exclusion status
		Grouping is essential because it’s the only way to correctly preserve the intended boolean logic of multiple filters per column
	*/
	for (const filter of filters) {
		// Skip filters with no value
		if (!filter?.value) continue;
		// Retrieve existing group for this column, or create a new one
		const bucket = groupedFilters.get(filter.id) ?? { includes: [], excludes: [] };

		// Add the filter value to either includes or excludes depending on "exclude" flag
		if (filter.exclude) {
			bucket.excludes.push(filter.value);
		} else {
			bucket.includes.push(filter.value);
		}

		// Store back into the map
		groupedFilters.set(filter.id, bucket);
	}

	// No valid filters found after grouping
	if (groupedFilters.size === 0) return "";

	const conditions: string[] = [];

	// Build SQL conditions for each column
	for (const [column, { includes, excludes }] of groupedFilters.entries()) {
		const includeConditions = buildConditions(column, includes, false);
		const excludeConditions = buildConditions(column, excludes, true);

		// Inclusive filters on the same column use OR, exclusive filters use AND
		if (includeConditions.length > 0) {
			conditions.push(`(${includeConditions.join(" OR ")})`);
		}
		if (excludeConditions.length > 0) {
			conditions.push(`(${excludeConditions.join(" AND ")})`);
		}
	}

	// Return combined WHERE clause, prefixed with "AND" to fit into larger queries
	if (conditions.length === 0) return "";
	return `AND ${conditions.join(" AND ")}`;
};

/*
 * Builds SQL conditions for a given column and list of values.
 */
function buildConditions(column: string, values: string[], isExclusion: boolean): string[] {
	if (!values.length) return [];

	return values.map((value) => {
		/* 
			Escapes single quotes so values can be safely embedded in SQL string literals.
			Example: O'Connor becomes O''Connor.
		*/
		const safeValue = value.replaceAll("'", "''");

		// Check if column should use wildcard (LIKE / NOT LIKE) instead of exact match
		const usesWildcard = wildcardColumns.includes(column);

		if (usesWildcard) {
			// Example: ip LIKE '%127.0.0.1%' or ip NOT LIKE '%192.18.0.1%'
			return isExclusion ? `${column} NOT LIKE '%${safeValue}%'` : `${column} LIKE '%${safeValue}%'`;
		}

		// Otherwise, use exact equality or inequality
		// Example: event = 'scroll' or event != 'exit'
		return isExclusion ? `${column} != '${safeValue}'` : `${column} = '${safeValue}'`;
	});
}
