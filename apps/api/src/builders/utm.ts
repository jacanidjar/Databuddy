/**
 * Analytics UTM Builders
 *
 * Builders for UTM campaign analytics metrics
 */

import {
	createSqlBuilder,
	buildWhereClauses,
	buildCommonSelect,
	buildCommonGroupBy,
	buildCommonOrderBy,
} from "./utils";

// Data types
export interface UTMData {
	source?: string;
	medium?: string;
	campaign?: string;
	visitors: number;
	visits: number;
}

/**
 * Creates a builder for fetching UTM source data
 */
export function createUTMSourceBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 10,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		utm_source: "utm_source",
		visits: "COUNT(*) as visits",
		visitors: "COUNT(DISTINCT anonymous_id) as visitors",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		source_filter: `utm_source != ''`,
		event_filter: "event_name = 'screen_view'",
	});

	builder.sb.groupBy = buildCommonGroupBy({ utm_source: "utm_source" });
	builder.sb.orderBy = buildCommonOrderBy({ visitors: "visitors DESC" });
	builder.sb.limit = limit;

	return builder;
}

/**
 * Creates a builder for fetching UTM medium data
 */
export function createUTMMediumBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 10,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		utm_medium: "utm_medium",
		visits: "COUNT(*) as visits",
		visitors: "COUNT(DISTINCT anonymous_id) as visitors",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		medium_filter: `utm_medium != ''`,
		event_filter: "event_name = 'screen_view'",
	});

	builder.sb.groupBy = buildCommonGroupBy({ utm_medium: "utm_medium" });
	builder.sb.orderBy = buildCommonOrderBy({ visitors: "visitors DESC" });
	builder.sb.limit = limit;

	return builder;
}

/**
 * Creates a builder for fetching UTM campaign data
 */
export function createUTMCampaignBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 10,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		utm_campaign: "utm_campaign",
		visits: "COUNT(*) as visits",
		visitors: "COUNT(DISTINCT anonymous_id) as visitors",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		campaign_filter: `utm_campaign != ''`,
		event_filter: "event_name = 'screen_view'",
	});

	builder.sb.groupBy = buildCommonGroupBy({ utm_campaign: "utm_campaign" });
	builder.sb.orderBy = buildCommonOrderBy({ visitors: "visitors DESC" });
	builder.sb.limit = limit;

	return builder;
}

/**
 * Creates a builder for fetching combined UTM data
 */
export function createCombinedUTMBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 10,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		utm_source: "utm_source",
		utm_medium: "utm_medium",
		utm_campaign: "utm_campaign",
		visits: "COUNT(*) as visits",
		visitors: "COUNT(DISTINCT anonymous_id) as visitors",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		source_filter: `utm_source != ''`,
		event_filter: "event_name = 'screen_view'",
	});

	builder.sb.groupBy = buildCommonGroupBy({
		utm_source: "utm_source",
		utm_medium: "utm_medium",
		utm_campaign: "utm_campaign",
	});

	builder.sb.orderBy = buildCommonOrderBy({ visitors: "visitors DESC" });
	builder.sb.limit = limit;

	return builder;
}

/**
 * Creates a builder for fetching UTM content data
 */
export function createUTMContentBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 10,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		utm_content: "utm_content",
		visits: "COUNT(*) as visits",
		visitors: "COUNT(DISTINCT anonymous_id) as visitors",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		content_filter: `utm_content != ''`,
		event_filter: "event_name = 'screen_view'",
	});

	builder.sb.groupBy = buildCommonGroupBy({ utm_content: "utm_content" });
	builder.sb.orderBy = buildCommonOrderBy({ visitors: "visitors DESC" });
	builder.sb.limit = limit;

	return builder;
}

/**
 * Creates a builder for fetching UTM term data
 */
export function createUTMTermBuilder(
	websiteId: string,
	startDate: string,
	endDate: string,
	limit = 10,
) {
	const builder = createSqlBuilder();
	builder.setTable("events");

	builder.sb.select = buildCommonSelect({
		utm_term: "utm_term",
		visits: "COUNT(*) as visits",
		visitors: "COUNT(DISTINCT anonymous_id) as visitors",
	});

	builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
		term_filter: `utm_term != ''`,
		event_filter: "event_name = 'screen_view'",
	});

	builder.sb.groupBy = buildCommonGroupBy({ utm_term: "utm_term" });
	builder.sb.orderBy = buildCommonOrderBy({ visitors: "visitors DESC" });
	builder.sb.limit = limit;

	return builder;
}
