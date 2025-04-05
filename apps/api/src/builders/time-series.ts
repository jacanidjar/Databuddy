/**
 * Analytics Time Series Builders
 *
 * Builders for time-based analytics metrics
 */

import { createSqlBuilder } from './utils';

// Data types
export interface EventByDate {
  date: string;
  pageviews: number;
  unique_visitors: number;
  sessions: number;
  bounce_rate: number;
  avg_session_duration: number;
}

/**
 * Creates a builder for fetching analytics data broken down by time periods
 * Supports hourly or daily granularity
 */
export function createEventsByDateBuilder(
  websiteId: string, 
  startDate: string, 
  endDate: string, 
  granularity: 'hourly' | 'daily' = 'daily'
) {
  const builder = createSqlBuilder();
  
  // For hourly data, we need to generate hourly intervals instead of daily
  if (granularity === 'hourly') {
    // For hourly data, we should limit the range to avoid generating too many rows
    // Check if date range is more than 2 days and adjust if needed
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    const diffInDays = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));
    
    // If more than 2 days, limit to the last 48 hours from the end date
    let adjustedStartDate = startDate;
    if (diffInDays > 2) {
      const adjustedStart = new Date(endDateTime);
      adjustedStart.setHours(adjustedStart.getHours() - 48);
      adjustedStartDate = adjustedStart.toISOString().split('T')[0];
    }
    
    const sql = `
      WITH hour_range AS (
        SELECT arrayJoin(arrayMap(
          h -> toDateTime('${adjustedStartDate} 00:00:00') + (h * 3600),
          range(toUInt32(dateDiff('hour', toDateTime('${adjustedStartDate} 00:00:00'), toDateTime('${endDate} 23:59:59')) + 1))
        )) AS datetime
      ),
      session_metrics AS (
        SELECT 
          toStartOfHour(time) as event_hour,
          session_id,
          countIf(event_name = 'screen_view') as page_count
        FROM analytics.events
        WHERE 
          client_id = '${websiteId}'
          AND time >= parseDateTimeBestEffort('${adjustedStartDate} 00:00:00')
          AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        GROUP BY event_hour, session_id
      ),
      hourly_visitors AS (
        SELECT
          toStartOfHour(time) as event_hour,
          count(distinct anonymous_id) as unique_visitors
        FROM analytics.events
        WHERE 
          client_id = '${websiteId}'
          AND time >= parseDateTimeBestEffort('${adjustedStartDate} 00:00:00')
          AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
          AND event_name = 'screen_view'
        GROUP BY event_hour
      ),
      session_durations AS (
        SELECT 
          toStartOfHour(min_time) as event_hour,
          session_id,
          dateDiff('second', min_time, max_time) as duration
        FROM (
          SELECT 
            session_id, 
            MIN(time) as min_time, 
            MAX(time) as max_time
          FROM analytics.events
          WHERE 
            client_id = '${websiteId}'
            AND time >= parseDateTimeBestEffort('${adjustedStartDate} 00:00:00')
            AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
          GROUP BY session_id
          HAVING min_time < max_time
        )
      ),
      hourly_metrics AS (
        SELECT
          event_hour,
          sum(page_count) as pageviews,
          count(distinct session_id) as sessions,
          countIf(page_count = 1) as bounced_sessions
        FROM session_metrics
        GROUP BY event_hour
      )
      SELECT
        formatDateTime(hour_range.datetime, '%Y-%m-%d %H:00:00') as date,
        COALESCE(hm.pageviews, 0) as pageviews,
        COALESCE(hv.unique_visitors, 0) as unique_visitors,
        COALESCE(hm.sessions, 0) as sessions,
        CASE 
          WHEN COALESCE(hm.sessions, 0) > 0 
          THEN (COALESCE(hm.bounced_sessions, 0) / COALESCE(hm.sessions, 0)) * 100 
          ELSE 0 
        END as bounce_rate,
        COALESCE(AVG(sd.duration), 0) as avg_session_duration
      FROM hour_range
      LEFT JOIN hourly_metrics hm ON hour_range.datetime = hm.event_hour
      LEFT JOIN hourly_visitors hv ON hour_range.datetime = hv.event_hour
      LEFT JOIN session_durations sd ON hour_range.datetime = sd.event_hour
      GROUP BY 
        hour_range.datetime, 
        hm.pageviews, 
        hv.unique_visitors, 
        hm.sessions, 
        hm.bounced_sessions
      ORDER BY hour_range.datetime ASC
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
    session_metrics AS (
      SELECT 
        toDate(time) as event_date,
        session_id,
        anonymous_id,
        countIf(event_name = 'screen_view') as page_count
      FROM analytics.events
      WHERE 
        client_id = '${websiteId}'
        AND time >= parseDateTimeBestEffort('${startDate}')
        AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
      GROUP BY event_date, session_id, anonymous_id
    ),
    session_durations AS (
      SELECT 
        toDate(min_time) as event_date,
        session_id,
        dateDiff('second', min_time, max_time) as duration
      FROM (
        SELECT 
          session_id, 
          MIN(time) as min_time, 
          MAX(time) as max_time
        FROM analytics.events
        WHERE 
          client_id = '${websiteId}'
          AND time >= parseDateTimeBestEffort('${startDate}')
          AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')
        GROUP BY session_id
        HAVING min_time < max_time
      )
    ),
    daily_metrics AS (
      SELECT
        event_date,
        sum(page_count) as pageviews,
        count(distinct session_id) as sessions,
        countIf(page_count = 1) as bounced_sessions,
        count(distinct anonymous_id) as unique_visitors
      FROM session_metrics
      GROUP BY event_date
    )
    SELECT
      date_range.date,
      COALESCE(dm.pageviews, 0) as pageviews,
      COALESCE(dm.unique_visitors, 0) as unique_visitors,
      COALESCE(dm.sessions, 0) as sessions,
      CASE 
        WHEN COALESCE(dm.sessions, 0) > 0
        THEN (COALESCE(dm.bounced_sessions, 0) / COALESCE(dm.sessions, 0)) * 100 
        ELSE 0 
      END as bounce_rate,
      COALESCE(avg(sd.duration), 0) as avg_session_duration
    FROM date_range
    LEFT JOIN daily_metrics dm ON date_range.date = dm.event_date
    LEFT JOIN session_durations sd ON date_range.date = sd.event_date
    GROUP BY 
      date_range.date, 
      dm.pageviews, 
      dm.unique_visitors, 
      dm.sessions, 
      dm.bounced_sessions
    ORDER BY date_range.date ASC
  `;
  
  // Override the getSql method to return our custom query
  builder.getSql = () => sql;
  
  return builder;
}

/**
 * Creates a builder for fetching error timeline data
 */
export function createErrorTimelineBuilder(websiteId: string, startDate: string, endDate: string) {
  const builder = createSqlBuilder();
  builder.setTable('events');
  
  builder.sb.select = {
    date: 'toDate(time) as date',
    error_type: 'error_type',
    count: 'COUNT(*) as count'
  };
  
  builder.sb.where = {
    client_filter: `client_id = '${websiteId}'`,
    date_filter: `time >= parseDateTimeBestEffort('${startDate}') AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')`,
    event_filter: "event_name = 'error'"
  };
  
  builder.sb.groupBy = {
    date: 'toDate(time)',
    error_type: 'error_type'
  };
  
  builder.sb.orderBy = {
    date: 'date ASC',
    count: 'count DESC'
  };
  
  return builder;
} 