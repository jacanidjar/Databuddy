/**
 * Analytics Performance Builders
 *
 * Builders for website performance analytics metrics
 */

import {
	createSqlBuilder,
	buildWhereClauses,
	buildCommonSelect,
} from "./utils";

// Data types
export interface PerformanceMetrics {
	avg_load_time: number;
	avg_ttfb: number;
	avg_dom_ready_time: number;
	avg_render_time: number;
	avg_fcp: number;
	avg_lcp: number;
	avg_cls: number;
}

/**
 * Creates a builder for fetching performance metrics data
 */
export function createPerformanceBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		avg_load_time:
			"AVG(CASE WHEN load_time > 0 AND load_time IS NOT NULL THEN load_time ELSE NULL END) as avg_load_time",
		avg_ttfb:
			"AVG(CASE WHEN ttfb > 0 AND ttfb IS NOT NULL THEN ttfb ELSE NULL END) as avg_ttfb",
		avg_dom_ready_time:
			"AVG(CASE WHEN dom_ready_time > 0 AND dom_ready_time IS NOT NULL THEN dom_ready_time ELSE NULL END) as avg_dom_ready_time",
		avg_render_time:
			"AVG(CASE WHEN render_time > 0 AND render_time IS NOT NULL THEN render_time ELSE NULL END) as avg_render_time",
		avg_fcp:
			"AVG(CASE WHEN fcp > 0 AND fcp IS NOT NULL THEN fcp ELSE NULL END) as avg_fcp",
		avg_lcp:
			"AVG(CASE WHEN lcp > 0 AND lcp IS NOT NULL THEN lcp ELSE NULL END) as avg_lcp",
		avg_cls:
			"AVG(CASE WHEN cls > 0 AND cls IS NOT NULL THEN cls ELSE NULL END) as avg_cls",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		valid_filter: "(event_name = 'screen_view' OR event_name = 'performance')",
		performance_filter:
			"(load_time IS NOT NULL OR ttfb IS NOT NULL OR fcp IS NOT NULL OR lcp IS NOT NULL)",
	});

	return builder;
}

/**
 * Creates a builder for fetching performance metrics over time
 */
export function createPerformanceTimeSeriesBuilder(
	websiteId: string,
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
    daily_performance AS (
      SELECT 
        toDate(time) as perf_date,
        AVG(CASE WHEN load_time > 0 AND load_time IS NOT NULL THEN load_time ELSE NULL END) as avg_load_time,
        AVG(CASE WHEN ttfb > 0 AND ttfb IS NOT NULL THEN ttfb ELSE NULL END) as avg_ttfb,
        AVG(CASE WHEN fcp > 0 AND fcp IS NOT NULL THEN fcp ELSE NULL END) as avg_fcp,
        AVG(CASE WHEN lcp > 0 AND lcp IS NOT NULL THEN lcp ELSE NULL END) as avg_lcp,
        AVG(CASE WHEN cls > 0 AND cls IS NOT NULL THEN cls ELSE NULL END) as avg_cls
      FROM analytics.events
      WHERE 
        client_id = '${websiteId}'
        AND time >= parseDateTimeBestEffort('${startDate}')
        AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        AND (event_name = 'screen_view' OR event_name = 'performance')
        AND (load_time IS NOT NULL OR ttfb IS NOT NULL OR fcp IS NOT NULL OR lcp IS NOT NULL)
      GROUP BY perf_date
    )
    SELECT
      date_range.date,
      COALESCE(dp.avg_load_time, 0) as avg_load_time,
      COALESCE(dp.avg_ttfb, 0) as avg_ttfb,
      COALESCE(dp.avg_fcp, 0) as avg_fcp,
      COALESCE(dp.avg_lcp, 0) as avg_lcp,
      COALESCE(dp.avg_cls, 0) as avg_cls
    FROM date_range
    LEFT JOIN daily_performance dp ON date_range.date = dp.perf_date
    ORDER BY date_range.date ASC
  `;

	// Override the getSql method to return our custom query
	builder.getSql = () => sql;

	return builder;
}

/**
 * Creates a builder for fetching performance metrics by page
 */
export function createPerformanceByPageBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 20,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = {
		path: "path",
		avg_load_time:
			"AVG(CASE WHEN load_time > 0 AND load_time IS NOT NULL THEN load_time ELSE NULL END) as avg_load_time",
		avg_ttfb:
			"AVG(CASE WHEN ttfb > 0 AND ttfb IS NOT NULL THEN ttfb ELSE NULL END) as avg_ttfb",
		avg_fcp:
			"AVG(CASE WHEN fcp > 0 AND fcp IS NOT NULL THEN fcp ELSE NULL END) as avg_fcp",
		avg_lcp:
			"AVG(CASE WHEN lcp > 0 AND lcp IS NOT NULL THEN lcp ELSE NULL END) as avg_lcp",
		avg_cls:
			"AVG(CASE WHEN cls > 0 AND cls IS NOT NULL THEN cls ELSE NULL END) as avg_cls",
		count: "COUNT(*) as count",
	};

	builder.sb.where = {
		client_filter: `client_id = '${websiteId}'`,
		date_filter: `time >= parseDateTimeBestEffort('${startDate}') AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')`,
		event_filter: "event_name = 'screen_view'",
		path_filter: "path != ''",
	};

	builder.sb.groupBy = {
		path: "path",
	};

	builder.sb.orderBy = {
		count: "count DESC",
	};

	builder.sb.limit = limit;

	return builder;
}

/**
 * Creates a builder for fetching performance metrics by device type
 */
export function createPerformanceByDeviceBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = {
		device_type: "COALESCE(device_type, 'desktop') as device_type",
		avg_load_time:
			"AVG(CASE WHEN load_time > 0 AND load_time IS NOT NULL THEN load_time ELSE NULL END) as avg_load_time",
		avg_ttfb:
			"AVG(CASE WHEN ttfb > 0 AND ttfb IS NOT NULL THEN ttfb ELSE NULL END) as avg_ttfb",
		avg_fcp:
			"AVG(CASE WHEN fcp > 0 AND fcp IS NOT NULL THEN fcp ELSE NULL END) as avg_fcp",
		avg_lcp:
			"AVG(CASE WHEN lcp > 0 AND lcp IS NOT NULL THEN lcp ELSE NULL END) as avg_lcp",
		count: "COUNT(*) as count",
	};

	builder.sb.where = {
		client_filter: `client_id = '${websiteId}'`,
		date_filter: `time >= parseDateTimeBestEffort('${startDate}') AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')`,
		event_filter: "(event_name = 'screen_view' OR event_name = 'performance')",
		metric_filter:
			"(load_time IS NOT NULL OR ttfb IS NOT NULL OR fcp IS NOT NULL OR lcp IS NOT NULL)",
	};

	builder.sb.groupBy = {
		device_type: "device_type",
	};

	builder.sb.orderBy = {
		count: "count DESC",
	};

	return builder;
}
