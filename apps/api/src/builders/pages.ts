/**
 * Analytics Pages Builders
 *
 * Builders for page view analytics metrics
 */

import {
	createSqlBuilder,
	buildWhereClauses,
	buildCommonSelect,
	buildCommonGroupBy,
	buildCommonOrderBy,
} from "./utils";

// Data types
export interface PageData {
	path: string;
	pageviews: number;
	visitors: number;
	avg_time_on_page: number | null;
}

export interface TopPage {
	path: string;
	pageviews: number;
	visitors: number;
}

/**
 * Creates a builder for fetching top pages data
 */
export function createTopPagesBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 5,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		path: "path",
		pageviews: "COUNT(*) as pageviews",
		visitors: "COUNT(DISTINCT anonymous_id) as visitors",
		avg_time_on_page:
			"AVG(CASE WHEN time_on_page > 0 AND time_on_page IS NOT NULL THEN time_on_page / 1000 ELSE NULL END) as avg_time_on_page",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		page_filter: "event_name = 'screen_view'",
	});

	builder.sb.groupBy = buildCommonGroupBy({ path: "path" });
	builder.sb.orderBy = buildCommonOrderBy({ pageviews: "pageviews DESC" });
	builder.sb.limit = limit;

	return builder;
}

/**
 * Creates a builder for fetching data for a specific page
 */
export function createPageDetailBuilder(
	websiteId: string,
	path: string,
	startDate: string,
	endDate: string,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		pageviews: "COUNT(*) as pageviews",
		visitors: "COUNT(DISTINCT anonymous_id) as visitors",
		avg_time_on_page:
			"AVG(CASE WHEN time_on_page > 0 AND time_on_page IS NOT NULL THEN time_on_page / 1000 ELSE NULL END) as avg_time_on_page",
		bounce_rate:
			"AVG(CASE WHEN is_bounce = 1 THEN 100 ELSE 0 END) as bounce_rate",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		page_filter: "event_name = 'screen_view'",
		path_filter: `path = '${path}'`,
	});

	return builder;
}

/**
 * Creates a builder for fetching page view time series data for a specific page
 */
export function createPageTimeSeriesBuilder(
	websiteId: string,
	path: string,
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
    daily_page_metrics AS (
      SELECT 
        toDate(time) as event_date,
        COUNT(*) as pageviews,
        COUNT(DISTINCT anonymous_id) as visitors
      FROM analytics.events
      WHERE 
        client_id = '${websiteId}'
        AND time >= parseDateTimeBestEffort('${startDate}')
        AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        AND event_name = 'screen_view'
        AND path = '${path}'
      GROUP BY event_date
    )
    SELECT
      date_range.date,
      COALESCE(dpm.pageviews, 0) as pageviews,
      COALESCE(dpm.visitors, 0) as visitors
    FROM date_range
    LEFT JOIN daily_page_metrics dpm ON date_range.date = dpm.event_date
    ORDER BY date_range.date ASC
  `;

	// Override the getSql method to return our custom query
	builder.getSql = () => sql;

	return builder;
}

/**
 * Creates a builder for fetching entry pages data
 */
export function createEntryPagesBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 10,
) {
	const builder = createSqlBuilder();

	const sql = `
    WITH sessions AS (
      SELECT
        session_id,
        MIN(time) as session_start_time
      FROM analytics.events
      WHERE 
        client_id = '${websiteId}'
        AND time >= parseDateTimeBestEffort('${startDate}')
        AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        AND event_name = 'screen_view'
        AND notEmpty(path)
      GROUP BY session_id
    ),
    entry_pages AS (
      SELECT
        CASE 
          WHEN startsWith(e.path, 'http') THEN 
            CASE 
              WHEN position(e.path, '?') > 0 THEN substring(e.path, position(e.path, '/', 9), position(e.path, '?') - position(e.path, '/', 9))
              ELSE substring(e.path, position(e.path, '/', 9))
            END
          WHEN startsWith(e.path, '/') THEN 
            CASE 
              WHEN position(e.path, '?') > 0 THEN substring(e.path, 1, position(e.path, '?') - 1)
              ELSE e.path
            END
          ELSE 
            CASE 
              WHEN position(e.path, '?') > 0 THEN substring(e.path, 1, position(e.path, '?') - 1)
              ELSE CONCAT('/', e.path)
            END
        END as path,
        COUNT(DISTINCT e.session_id) as entries,
        COUNT(DISTINCT e.anonymous_id) as visitors
      FROM analytics.events e
      INNER JOIN sessions s ON e.session_id = s.session_id AND e.time = s.session_start_time
      WHERE 
        e.client_id = '${websiteId}'
        AND e.time >= parseDateTimeBestEffort('${startDate}')
        AND e.time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        AND e.event_name = 'screen_view'
        AND notEmpty(e.path)
      GROUP BY path
    )
    SELECT 
      path,
      entries,
      visitors
    FROM entry_pages
    WHERE notEmpty(path)
    ORDER BY entries DESC
    LIMIT ${limit}
  `;

	// Override the getSql method to return our custom query
	builder.getSql = () => sql;

	return builder;
}

/**
 * Creates a builder for fetching exit pages data
 */
export function createExitPagesBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 10,
) {
	const builder = createSqlBuilder();

	const sql = `
    WITH sessions AS (
      SELECT
        session_id,
        MAX(time) as session_end_time
      FROM analytics.events
      WHERE 
        client_id = '${websiteId}'
        AND time >= parseDateTimeBestEffort('${startDate}')
        AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        AND event_name = 'screen_view'
        AND notEmpty(path)
      GROUP BY session_id
    ),
    exit_pages AS (
      SELECT
        CASE 
          WHEN startsWith(e.path, 'http') THEN 
            CASE 
              WHEN position(e.path, '?') > 0 THEN substring(e.path, position(e.path, '/', 9), position(e.path, '?') - position(e.path, '/', 9))
              ELSE substring(e.path, position(e.path, '/', 9))
            END
          WHEN startsWith(e.path, '/') THEN 
            CASE 
              WHEN position(e.path, '?') > 0 THEN substring(e.path, 1, position(e.path, '?') - 1)
              ELSE e.path
            END
          ELSE 
            CASE 
              WHEN position(e.path, '?') > 0 THEN substring(e.path, 1, position(e.path, '?') - 1)
              ELSE CONCAT('/', e.path)
            END
        END as path,
        COUNT(DISTINCT e.session_id) as exits,
        COUNT(DISTINCT e.anonymous_id) as visitors
      FROM analytics.events e
      INNER JOIN sessions s ON e.session_id = s.session_id AND e.time = s.session_end_time
      WHERE 
        e.client_id = '${websiteId}'
        AND e.time >= parseDateTimeBestEffort('${startDate}')
        AND e.time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        AND e.event_name = 'screen_view'
        AND notEmpty(e.path)
      GROUP BY path
    )
    SELECT 
      path,
      exits,
      visitors
    FROM exit_pages
    WHERE notEmpty(path)
    ORDER BY exits DESC
    LIMIT ${limit}
  `;

	// Override the getSql method to return our custom query
	builder.getSql = () => sql;

	return builder;
}
