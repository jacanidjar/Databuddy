import type { SimpleQueryConfig, Filter, TimeUnit } from "../types";

export const SummaryBuilders: Record<string, SimpleQueryConfig> = {
  summary_metrics: {
    customSql: (websiteId: string, startDate: string, endDate: string) => `
            WITH session_metrics AS (
              SELECT
                session_id,
                countIf(event_name = 'screen_view') as page_count
              FROM analytics.events
              WHERE 
                client_id = '${websiteId}'
                AND time >= parseDateTimeBestEffort('${startDate}')
                AND time <= parseDateTimeBestEffort('${endDate}')
              GROUP BY session_id
            ),
            session_durations AS (
              SELECT
                session_id,
                dateDiff('second', MIN(time), MAX(time)) as duration
              FROM analytics.events
              WHERE 
                client_id = '${websiteId}'
                AND time >= parseDateTimeBestEffort('${startDate}')
                AND time <= parseDateTimeBestEffort('${endDate}')
              GROUP BY session_id
              HAVING duration > 0
            ),
            unique_visitors AS (
              SELECT
                countDistinct(anonymous_id) as unique_visitors
              FROM analytics.events
              WHERE 
                client_id = '${websiteId}'
                AND time >= parseDateTimeBestEffort('${startDate}')
                AND time <= parseDateTimeBestEffort('${endDate}')
                AND event_name = 'screen_view'
            ),
            all_events AS (
              SELECT
                count() as total_events
              FROM analytics.events
              WHERE 
                client_id = '${websiteId}'
                AND time >= parseDateTimeBestEffort('${startDate}')
                AND time <= parseDateTimeBestEffort('${endDate}')
            )
            SELECT
              sum(page_count) as pageviews,
              (SELECT unique_visitors FROM unique_visitors) as unique_visitors,
              count(session_metrics.session_id) as sessions,
              ROUND((COALESCE(countIf(page_count = 1), 0) / COALESCE(COUNT(*), 0)) * 100, 2) as bounce_rate,
              ROUND(AVG(sd.duration), 2) as avg_session_duration,
              (SELECT total_events FROM all_events) as total_events
            FROM session_metrics
            LEFT JOIN session_durations as sd ON session_metrics.session_id = sd.session_id
        `,
    timeField: 'time',
    allowedFilters: ['path', 'referrer', 'device_type', 'browser_name', 'country'],
    customizable: true
  },

  today_metrics: {
    table: 'analytics.events',
    fields: [
      'COUNT(*) as pageviews',
      'COUNT(DISTINCT anonymous_id) as visitors',
      'COUNT(DISTINCT session_id) as sessions',
      'ROUND(AVG(CASE WHEN is_bounce = 1 THEN 100 ELSE 0 END), 2) as bounce_rate'
    ],
    where: [
      'event_name = \'screen_view\'',
      'toDate(time) = today()'
    ],
    timeField: 'time',
    allowedFilters: ['path', 'referrer', 'device_type'],
    customizable: true
  },

  events_by_date: {
    customSql: (websiteId: string, startDate: string, endDate: string, filters?: Filter[], granularity?: TimeUnit) => {
      const isHourly = granularity === 'hour' || granularity === 'hourly';
      const timeGroup = isHourly ? 'toStartOfHour(time)' : 'toDate(time)';
      const dateFormat = isHourly ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d';
      const dateRange = isHourly ? 'hour' : 'day';

      return `
                WITH date_range AS (
                  SELECT 
                    ${isHourly ? `toStartOfHour(parseDateTimeBestEffort('${startDate}')) + INTERVAL number HOUR` : `toDate(parseDateTimeBestEffort('${startDate}')) + number`} as date
                  FROM numbers(dateDiff('${dateRange}', 
                    ${isHourly ? `toStartOfHour(parseDateTimeBestEffort('${startDate}'))` : `toDate(parseDateTimeBestEffort('${startDate}'))`}, 
                    ${isHourly ? `toStartOfHour(parseDateTimeBestEffort('${endDate}'))` : `toDate(parseDateTimeBestEffort('${endDate}'))`}
                  ) + 1)
                ),
                time_sessions AS (
                  SELECT
                    ${timeGroup} as date,
                    session_id,
                    countIf(event_name = 'screen_view') as page_count,
                    dateDiff('second', MIN(time), MAX(time)) as session_duration
                  FROM analytics.events
                  WHERE 
                    client_id = '${websiteId}'
                    AND time >= parseDateTimeBestEffort('${startDate}')
                    AND time <= parseDateTimeBestEffort('${endDate}')
                  GROUP BY date, session_id
                ),
                time_visitors AS (
                  SELECT
                    ${timeGroup} as date,
                    count(distinct anonymous_id) as visitors
                  FROM analytics.events
                  WHERE 
                    client_id = '${websiteId}'
                    AND time >= parseDateTimeBestEffort('${startDate}')
                    AND time <= parseDateTimeBestEffort('${endDate}')
                    AND event_name = 'screen_view'
                  GROUP BY date
                ),
                time_metrics AS (
                  SELECT
                    date,
                    sum(page_count) as pageviews,
                    count(distinct session_id) as sessions,
                    countIf(page_count = 1) as bounced_sessions,
                    AVG(CASE WHEN session_duration > 0 THEN session_duration ELSE NULL END) as avg_session_duration
                  FROM time_sessions
                  GROUP BY date
                )
                SELECT
                  formatDateTime(dr.date, '${dateFormat}') as date,
                  COALESCE(tm.pageviews, 0) as pageviews,
                  COALESCE(tv.visitors, 0) as visitors,
                  COALESCE(tm.sessions, 0) as sessions,
                  ROUND(CASE 
                    WHEN COALESCE(tm.sessions, 0) > 0 
                    THEN (COALESCE(tm.bounced_sessions, 0) / COALESCE(tm.sessions, 0)) * 100 
                    ELSE 0 
                  END, 2) as bounce_rate,
                  ROUND(COALESCE(tm.avg_session_duration, 0), 2) as avg_session_duration
                FROM date_range dr
                LEFT JOIN time_metrics tm ON dr.date = tm.date
                LEFT JOIN time_visitors tv ON dr.date = tv.date
                ORDER BY dr.date ASC
            `;
    },
    timeField: 'time',
    allowedFilters: ['path', 'referrer', 'device_type'],
    customizable: true
  },

  active_stats: {
    table: 'analytics.events',
    fields: [
      'COUNT(DISTINCT anonymous_id) as active_users',
      'COUNT(DISTINCT session_id) as active_sessions'
    ],
    where: [
      'event_name = \'screen_view\'',
      'time >= now() - INTERVAL 5 MINUTE'
    ],
    timeField: 'time',
    allowedFilters: ['path', 'referrer'],
    customizable: true
  }
}; 