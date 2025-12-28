import { Analytics } from "../../types/tables";
import type { Filter, SimpleQueryConfig, TimeUnit } from "../types";

export const CustomEventsBuilders: Record<string, SimpleQueryConfig> = {
	custom_events: {
		customSql: (
			websiteId: string,
			startDate: string,
			endDate: string,
			_filters?: Filter[],
			_granularity?: TimeUnit,
			_limit?: number,
			_offset?: number,
			_timezone?: string,
			filterConditions?: string[],
			filterParams?: Record<string, Filter["value"]>
		) => {
			const limit = _limit ?? 10_000;
			const combinedWhereClause = filterConditions?.length
				? `AND ${filterConditions.join(" AND ")}`
				: "";

			return {
				sql: `
					WITH enriched_events AS (
						SELECT 
							ce.event_name,
							ce.anonymous_id,
							ce.session_id,
							ce.timestamp,
							ce.properties,
							ce.path,
							-- Get context from events table using session_id
							any(e.country) as country,
							any(e.device_type) as device_type,
							any(e.browser_name) as browser_name,
							any(e.os_name) as os_name,
							any(e.referrer) as referrer,
							any(e.utm_source) as utm_source,
							any(e.utm_medium) as utm_medium,
							any(e.utm_campaign) as utm_campaign
						FROM ${Analytics.custom_event_spans} ce
						LEFT JOIN ${Analytics.events} e ON (
							ce.session_id = e.session_id 
							AND ce.client_id = e.client_id
							AND abs(dateDiff('second', ce.timestamp, e.time)) < 60
						)
						WHERE 
							ce.client_id = {websiteId:String}
							AND ce.timestamp >= toDateTime({startDate:String})
							AND ce.timestamp <= toDateTime(concat({endDate:String}, ' 23:59:59'))
							AND ce.event_name != ''
							${combinedWhereClause}
						GROUP BY 
							ce.event_name,
							ce.anonymous_id,
							ce.session_id,
							ce.timestamp,
							ce.properties,
							ce.path
					)
					SELECT 
						event_name as name,
						COUNT(*) as total_events,
						COUNT(DISTINCT anonymous_id) as unique_users,
						COUNT(DISTINCT session_id) as unique_sessions,
						MAX(timestamp) as last_occurrence,
						MIN(timestamp) as first_occurrence,
						countIf(properties != '{}' AND isValidJSON(properties)) as events_with_properties,
						ROUND((COUNT(DISTINCT anonymous_id) / SUM(COUNT(DISTINCT anonymous_id)) OVER()) * 100, 2) as percentage
					FROM enriched_events
					GROUP BY event_name
					ORDER BY total_events DESC
					LIMIT {limit:UInt32}
				`,
				params: {
					websiteId,
					startDate,
					endDate,
					limit,
					...filterParams,
				},
			};
		},
		timeField: "timestamp",
		allowedFilters: [
			"path",
			"country",
			"device_type",
			"browser_name",
			"os_name",
			"referrer",
			"utm_source",
			"utm_medium",
			"utm_campaign",
			"client_id",
			"anonymous_id",
			"session_id",
			"event_name",
		],
		customizable: true,
	},
	custom_event_properties: {
		customSql: (
			websiteId: string,
			startDate: string,
			endDate: string,
			_filters?: Filter[],
			_granularity?: TimeUnit,
			_limit?: number,
			_offset?: number,
			_timezone?: string,
			filterConditions?: string[],
			filterParams?: Record<string, Filter["value"]>
		) => {
			const limit = _limit ?? 10_000;
			const combinedWhereClause = filterConditions?.length
				? `AND ${filterConditions.join(" AND ")}`
				: "";

			return {
				sql: `
					WITH enriched_events AS (
						SELECT 
							ce.event_name,
							ce.anonymous_id,
							ce.session_id,
							ce.timestamp,
							ce.properties,
							ce.path,
							-- Get context from events table using session_id
							any(e.country) as country,
							any(e.device_type) as device_type,
							any(e.browser_name) as browser_name,
							any(e.os_name) as os_name,
							any(e.referrer) as referrer,
							any(e.utm_source) as utm_source,
							any(e.utm_medium) as utm_medium,
							any(e.utm_campaign) as utm_campaign
						FROM ${Analytics.custom_event_spans} ce
						LEFT JOIN ${Analytics.events} e ON (
							ce.session_id = e.session_id 
							AND ce.client_id = e.client_id
							AND abs(dateDiff('second', ce.timestamp, e.time)) < 60
						)
						WHERE 
							ce.client_id = {websiteId:String}
							AND ce.timestamp >= toDateTime({startDate:String})
							AND ce.timestamp <= toDateTime(concat({endDate:String}, ' 23:59:59'))
							AND ce.event_name != ''
							AND ce.properties != '{}'
							AND isValidJSON(ce.properties)
							${combinedWhereClause}
						GROUP BY 
							ce.event_name,
							ce.anonymous_id,
							ce.session_id,
							ce.timestamp,
							ce.properties,
							ce.path
					)
					SELECT 
						event_name as name,
						arrayJoin(JSONExtractKeys(properties)) as property_key,
						JSONExtractRaw(properties, property_key) as property_value,
						COUNT(*) as count
					FROM enriched_events
					GROUP BY event_name, property_key, property_value
					ORDER BY count DESC
					LIMIT {limit:UInt32}
				`,
				params: {
					websiteId,
					startDate,
					endDate,
					limit,
					...filterParams,
				},
			};
		},
		timeField: "timestamp",
		allowedFilters: [
			"path",
			"country",
			"device_type",
			"browser_name",
			"os_name",
			"referrer",
			"utm_source",
			"utm_medium",
			"utm_campaign",
			"client_id",
			"anonymous_id",
			"session_id",
			"event_name",
		],
		customizable: true,
	},

	custom_events_by_path: {
		customSql: (
			websiteId: string,
			startDate: string,
			endDate: string,
			_filters?: Filter[],
			_granularity?: TimeUnit,
			_limit?: number,
			_offset?: number,
			_timezone?: string,
			filterConditions?: string[],
			filterParams?: Record<string, Filter["value"]>
		) => {
			const limit = _limit ?? 50;
			const combinedWhereClause = filterConditions?.length
				? `AND ${filterConditions.join(" AND ")}`
				: "";

			return {
				sql: `
					SELECT 
						path as name,
						COUNT(*) as total_events,
						COUNT(DISTINCT event_name) as unique_event_types,
						COUNT(DISTINCT anonymous_id) as unique_users
					FROM ${Analytics.custom_event_spans}
					WHERE 
						client_id = {websiteId:String}
						AND timestamp >= toDateTime({startDate:String})
						AND timestamp <= toDateTime(concat({endDate:String}, ' 23:59:59'))
						AND event_name != ''
						AND path != ''
						${combinedWhereClause}
					GROUP BY path
					ORDER BY total_events DESC
					LIMIT {limit:UInt32}
				`,
				params: {
					websiteId,
					startDate,
					endDate,
					limit,
					...filterParams,
				},
			};
		},
		timeField: "timestamp",
		allowedFilters: ["path", "event_name"],
		customizable: true,
	},

	custom_events_trends: {
		customSql: (
			websiteId: string,
			startDate: string,
			endDate: string,
			_filters?: Filter[],
			_granularity?: TimeUnit,
			_limit?: number,
			_offset?: number,
			_timezone?: string,
			filterConditions?: string[],
			filterParams?: Record<string, Filter["value"]>
		) => {
			const limit = _limit ?? 1000;
			const combinedWhereClause = filterConditions?.length
				? `AND ${filterConditions.join(" AND ")}`
				: "";

			return {
				sql: `
					SELECT 
						toDate(timestamp) as date,
						COUNT(*) as total_events,
						COUNT(DISTINCT event_name) as unique_event_types,
						COUNT(DISTINCT anonymous_id) as unique_users
					FROM ${Analytics.custom_event_spans}
					WHERE 
						client_id = {websiteId:String}
						AND timestamp >= toDateTime({startDate:String})
						AND timestamp <= toDateTime(concat({endDate:String}, ' 23:59:59'))
						AND event_name != ''
						${combinedWhereClause}
					GROUP BY toDate(timestamp)
					ORDER BY date ASC
					LIMIT {limit:UInt32}
				`,
				params: {
					websiteId,
					startDate,
					endDate,
					limit,
					...filterParams,
				},
			};
		},
		timeField: "timestamp",
		allowedFilters: ["path", "event_name"],
	},

	custom_events_summary: {
		customSql: (
			websiteId: string,
			startDate: string,
			endDate: string,
			_filters?: Filter[],
			_granularity?: TimeUnit,
			_limit?: number,
			_offset?: number,
			_timezone?: string,
			filterConditions?: string[],
			filterParams?: Record<string, Filter["value"]>
		) => {
			const combinedWhereClause = filterConditions?.length
				? `AND ${filterConditions.join(" AND ")}`
				: "";

			return {
				sql: `
					SELECT 
						COUNT(*) as total_events,
						COUNT(DISTINCT event_name) as unique_event_types,
						COUNT(DISTINCT anonymous_id) as unique_users,
						COUNT(DISTINCT session_id) as unique_sessions,
						COUNT(DISTINCT path) as unique_pages
					FROM ${Analytics.custom_event_spans}
					WHERE 
						client_id = {websiteId:String}
						AND timestamp >= toDateTime({startDate:String})
						AND timestamp <= toDateTime(concat({endDate:String}, ' 23:59:59'))
						AND event_name != ''
						${combinedWhereClause}
				`,
				params: {
					websiteId,
					startDate,
					endDate,
					...filterParams,
				},
			};
		},
		timeField: "timestamp",
		allowedFilters: ["path", "event_name"],
	},

	custom_events_property_cardinality: {
		customSql: (
			websiteId: string,
			startDate: string,
			endDate: string,
			_filters?: Filter[],
			_granularity?: TimeUnit,
			_limit?: number,
			_offset?: number,
			_timezone?: string,
			filterConditions?: string[],
			filterParams?: Record<string, Filter["value"]>
		) => {
			const limit = _limit ?? 100;
			const combinedWhereClause = filterConditions?.length
				? `AND ${filterConditions.join(" AND ")}`
				: "";

			return {
				sql: `
					WITH property_keys AS (
						SELECT 
							event_name,
							arrayJoin(JSONExtractKeys(properties)) as property_key
						FROM ${Analytics.custom_event_spans}
						WHERE 
							client_id = {websiteId:String}
							AND timestamp >= toDateTime({startDate:String})
							AND timestamp <= toDateTime(concat({endDate:String}, ' 23:59:59'))
							AND event_name != ''
							AND properties != '{}'
							AND isValidJSON(properties)
							${combinedWhereClause}
					)
					SELECT 
						event_name,
						property_key,
						uniqExact(JSONExtractRaw(ce.properties, pk.property_key)) as unique_values,
						COUNT(*) as occurrences
					FROM ${Analytics.custom_event_spans} ce
					INNER JOIN property_keys pk ON ce.event_name = pk.event_name
					WHERE 
						ce.client_id = {websiteId:String}
						AND ce.timestamp >= toDateTime({startDate:String})
						AND ce.timestamp <= toDateTime(concat({endDate:String}, ' 23:59:59'))
						AND ce.event_name != ''
						AND ce.properties != '{}'
						AND isValidJSON(ce.properties)
						${combinedWhereClause}
					GROUP BY event_name, property_key
					ORDER BY occurrences DESC
					LIMIT {limit:UInt32}
				`,
				params: {
					websiteId,
					startDate,
					endDate,
					limit,
					...filterParams,
				},
			};
		},
		timeField: "timestamp",
		allowedFilters: ["path", "event_name"],
	},

	custom_events_recent: {
		customSql: (
			websiteId: string,
			startDate: string,
			endDate: string,
			_filters?: Filter[],
			_granularity?: TimeUnit,
			_limit?: number,
			_offset?: number,
			_timezone?: string,
			filterConditions?: string[],
			filterParams?: Record<string, Filter["value"]>
		) => {
			const limit = _limit ?? 50;
			const offset = _offset ?? 0;
			const combinedWhereClause = filterConditions?.length
				? `AND ${filterConditions.join(" AND ")}`
				: "";

			return {
				sql: `
					SELECT 
						event_name,
						path,
						properties,
						anonymous_id,
						session_id,
						timestamp
					FROM ${Analytics.custom_event_spans}
					WHERE 
						client_id = {websiteId:String}
						AND timestamp >= toDateTime({startDate:String})
						AND timestamp <= toDateTime(concat({endDate:String}, ' 23:59:59'))
						AND event_name != ''
						${combinedWhereClause}
					ORDER BY timestamp DESC
					LIMIT {limit:UInt32}
					OFFSET {offset:UInt32}
				`,
				params: {
					websiteId,
					startDate,
					endDate,
					limit,
					offset,
					...filterParams,
				},
			};
		},
		timeField: "timestamp",
		allowedFilters: ["path", "event_name"],
	},
};
