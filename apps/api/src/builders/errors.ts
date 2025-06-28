/**
 * Analytics Errors Builders
 *
 * Builders for error tracking analytics metrics
 */

import {
	createSqlBuilder,
	buildWhereClauses,
	buildCommonSelect,
	buildCommonGroupBy,
	buildCommonOrderBy,
} from "./utils";

// Data types
export interface ErrorData {
	error_type: string;
	error_message: string;
	count: number;
	unique_users: number;
	last_occurrence?: string;
}

/**
 * Creates a builder for fetching error types data
 */
export function createErrorTypesBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 10,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		error_type: "error_type",
		error_message: "error_message",
		count: "COUNT(*) as count",
		unique_users: "COUNT(DISTINCT anonymous_id) as unique_users",
		last_occurrence: "MAX(time) as last_occurrence",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		event_filter: "event_name = 'error'",
	});

	builder.sb.groupBy = buildCommonGroupBy({
		error_type: "error_type",
		error_message: "error_message",
	});

	builder.sb.orderBy = buildCommonOrderBy({ count: "count DESC" });
	builder.sb.limit = limit;

	return builder;
}

/**
 * Creates a builder for fetching detailed error data
 */
export function createErrorDetailsBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 100,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		error_type: "error_type",
		error_message: "error_message",
		error_filename: "error_filename",
		error_lineno: "error_lineno",
		error_colno: "error_colno",
		error_stack: "error_stack",
		url: "url",
		user_agent: "user_agent",
		time: "time",
		anonymous_id: "anonymous_id",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		event_filter: "event_name = 'error'",
	});

	builder.sb.orderBy = buildCommonOrderBy({ time: "time DESC" });
	builder.sb.limit = limit;

	return builder;
}

/**
 * Creates a builder for fetching error data for a specific error type
 */
export function createErrorTypeDetailsBuilder(
	websiteId: string,
	errorType: string,
	startDate: string,
	endDate: string,
	limit = 100,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		error_message: "error_message",
		error_filename: "error_filename",
		error_lineno: "error_lineno",
		error_colno: "error_colno",
		error_stack: "error_stack",
		url: "url",
		path: "path",
		time: "time",
		browser_name: "browser_name",
		os_name: "os_name",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		event_filter: "event_name = 'error'",
		error_type_filter: `error_type = '${errorType}'`,
	});

	builder.sb.orderBy = buildCommonOrderBy({ time: "time DESC" });
	builder.sb.limit = limit;

	return builder;
}

/**
 * Creates a builder for fetching error frequency over time
 */
export function createErrorFrequencyBuilder(
	websiteId: string,
	errorType: string,
	startDate: string,
	endDate: string,
) {
	const builder = createSqlBuilder();

	const sql = `
    WITH date_range AS (
      SELECT arrayJoin(arrayMap(
        d -> toDate('${startDate}') + d,
        range(toUInt32(dateDiff('day', toDate('${startDate}'), toDate('${endDate}')) + 1))
      )) AS date
    ),
    daily_errors AS (
      SELECT 
        toDate(time) as error_date,
        COUNT(*) as error_count
      FROM analytics.events
      WHERE 
        client_id = '${websiteId}'
        AND time >= parseDateTimeBestEffort('${startDate}')
        AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        AND event_name = 'error'
        AND error_type = '${errorType}'
      GROUP BY error_date
    )
    SELECT
      date_range.date,
      COALESCE(de.error_count, 0) as count
    FROM date_range
    LEFT JOIN daily_errors de ON date_range.date = de.error_date
    ORDER BY date_range.date ASC
  `;

	// Override the getSql method to return our custom query
	builder.getSql = () => sql;

	return builder;
}
