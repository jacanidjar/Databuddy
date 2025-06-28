/**
 * Analytics Time Series Builders
 *
 * Builders for time-based analytics metrics
 */

import { createSqlBuilder } from "./utils";

// Data types
export interface EventByDate {
	date: string;
	pageviews: number;
	unique_visitors: number;
	sessions: number;
	bounce_rate: number;
	avg_session_duration: number;
}

export interface MiniChartDataPoint {
	date: string;
	value: number;
}

/**
 * Creates a builder for fetching analytics data broken down by time periods
 * Supports hourly or daily granularity
 */
export function createEventsByDateBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	granularity: "hourly" | "daily" = "daily",
) {
	const builder = createSqlBuilder();

	// For hourly data, we need to generate hourly intervals instead of daily
	if (granularity === "hourly") {
		const sql = `
      WITH hour_range AS (
        SELECT arrayJoin(arrayMap(
          h -> toDateTime('${startDate} 00:00:00') + (h * 3600),
          range(toUInt32(dateDiff('hour', toDateTime('${startDate} 00:00:00'), toDateTime('${endDate} 23:59:59')) + 1))
        )) AS datetime
      ),
      session_details AS (
        SELECT
          session_id,
          toStartOfHour(MIN(time)) as session_start_hour,
          countIf(event_name = 'screen_view') as page_count,
          dateDiff('second', MIN(time), MAX(time)) as duration
        FROM analytics.events
        WHERE 
          client_id = '${websiteId}'
          AND time >= parseDateTimeBestEffort('${startDate}')
          AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        GROUP BY session_id
      ),
      hourly_session_metrics AS (
        SELECT
          session_start_hour as event_hour,
          count(session_id) as sessions,
          countIf(page_count = 1) as bounced_sessions,
          avgIf(duration, duration > 0) as avg_session_duration
        FROM session_details
        GROUP BY session_start_hour
      ),
      hourly_event_metrics AS (
        SELECT
          toStartOfHour(time) as event_hour,
          countIf(event_name = 'screen_view') as pageviews,
          count(distinct anonymous_id) as unique_visitors
        FROM analytics.events
        WHERE 
          client_id = '${websiteId}'
          AND time >= parseDateTimeBestEffort('${startDate}')
          AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        GROUP BY event_hour
      )
      SELECT
        formatDateTime(hr.datetime, '%Y-%m-%d %H:00:00') as date,
        COALESCE(hem.pageviews, 0) as pageviews,
        COALESCE(hem.unique_visitors, 0) as unique_visitors,
        COALESCE(hsm.sessions, 0) as sessions,
        CASE 
          WHEN COALESCE(hsm.sessions, 0) > 0 
          THEN (COALESCE(hsm.bounced_sessions, 0) / hsm.sessions) * 100 
          ELSE 0 
        END as bounce_rate,
        COALESCE(hsm.avg_session_duration, 0) as avg_session_duration
      FROM hour_range hr
      LEFT JOIN hourly_session_metrics hsm ON hr.datetime = hsm.event_hour
      LEFT JOIN hourly_event_metrics hem ON hr.datetime = hem.event_hour
      ORDER BY hr.datetime ASC
    `;

		// Override the getSql method to return our custom query
		builder.getSql = () => sql;

		return builder;
	}

	// Default daily granularity query
	const sql = `
    WITH date_range AS (
      SELECT arrayJoin(arrayMap(
        d -> toDate('${startDate}') + d,
        range(toUInt32(dateDiff('day', toDate('${startDate}'), toDate('${endDate}')) + 1))
      )) AS date
    ),
    session_details AS (
      SELECT
        session_id,
        toDate(MIN(time)) as session_start_date,
        countIf(event_name = 'screen_view') as page_count,
        dateDiff('second', MIN(time), MAX(time)) as duration
      FROM analytics.events
      WHERE
        client_id = '${websiteId}'
        AND time >= parseDateTimeBestEffort('${startDate}')
        AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
      GROUP BY session_id
    ),
    daily_session_metrics AS (
      SELECT
        session_start_date,
        count(session_id) as sessions,
        countIf(page_count = 1) as bounced_sessions,
        avgIf(duration, duration > 0) as avg_session_duration
      FROM session_details
      GROUP BY session_start_date
    ),
    daily_event_metrics AS (
      SELECT
        toDate(time) as event_date,
        countIf(event_name = 'screen_view') as pageviews,
        count(distinct anonymous_id) as unique_visitors
      FROM analytics.events
      WHERE
        client_id = '${websiteId}'
        AND time >= parseDateTimeBestEffort('${startDate}')
        AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
      GROUP BY event_date
    )
    SELECT
      dr.date,
      COALESCE(dem.pageviews, 0) as pageviews,
      COALESCE(dem.unique_visitors, 0) as unique_visitors,
      COALESCE(dsm.sessions, 0) as sessions,
      CASE 
        WHEN COALESCE(dsm.sessions, 0) > 0 
        THEN (COALESCE(dsm.bounced_sessions, 0) / dsm.sessions) * 100 
        ELSE 0 
      END as bounce_rate,
      COALESCE(dsm.avg_session_duration, 0) as avg_session_duration
    FROM date_range dr
    LEFT JOIN daily_session_metrics dsm ON dr.date = dsm.session_start_date
    LEFT JOIN daily_event_metrics dem ON dr.date = dem.event_date
    ORDER BY dr.date ASC
  `;

	// Override the getSql method to return our custom query
	builder.getSql = () => sql;

	return builder;
}

/**
 * Creates a builder for fetching error timeline data
 */
export function createErrorTimelineBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = {
		date: "toDate(time) as date",
		error_type: "error_type",
		count: "COUNT(*) as count",
	};

	builder.sb.where = {
		client_filter: `client_id = '${websiteId}'`,
		date_filter: `time >= parseDateTimeBestEffort('${startDate}') AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')`,
		event_filter: "event_name = 'error'",
	};

	builder.sb.groupBy = {
		date: "toDate(time)",
		error_type: "error_type",
	};

	builder.sb.orderBy = {
		date: "date ASC",
		count: "count DESC",
	};

	return builder;
}

/**
 * Creates a builder for fetching mini chart data for website cards
 * Returns last 7 days of pageviews data for simple visualization
 */
export function createMiniChartBuilder(websiteId: string) {
	const builder = createSqlBuilder();

	const sql = `
    WITH date_range AS (
      SELECT arrayJoin(arrayMap(
        d -> toDate(today()) - d,
        range(7) -- Last 7 days
      )) AS date
    ),
    daily_pageviews AS (
      SELECT 
        toDate(time) as event_date,
        countIf(event_name = 'screen_view') as pageviews
      FROM analytics.events
      WHERE 
        client_id = '${websiteId}'
        AND toDate(time) >= (today() - 6) -- Last 7 days including today
        AND toDate(time) <= today()
      GROUP BY event_date
    )
    SELECT
      toString(date_range.date) as date,
      COALESCE(dp.pageviews, 0) as value
    FROM date_range
    LEFT JOIN daily_pageviews dp ON date_range.date = dp.event_date
    ORDER BY date_range.date ASC
  `;

	// Override the getSql method
	builder.getSql = () => sql;

	return builder;
}
