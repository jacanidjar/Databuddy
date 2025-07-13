import type { SimpleQueryConfig } from "../types";

export const PagesBuilders: Record<string, SimpleQueryConfig> = {
    top_pages: {
        table: 'analytics.events',
        fields: [
            'path(path) as name',
            'COUNT(*) as pageviews',
            'COUNT(DISTINCT anonymous_id) as visitors'
        ],
        where: ['event_name = \'screen_view\'', 'path != \'\''],
        groupBy: ['path(path)'],
        orderBy: 'pageviews DESC',
        limit: 100,
        timeField: 'time',
        allowedFilters: ['referrer', 'device_type', 'browser_name'],
        customizable: true
    },

    entry_pages: {
        table: 'analytics.events',
        fields: [
            'path(path) as name',
            'COUNT(DISTINCT session_id) as entries',
            'COUNT(DISTINCT anonymous_id) as visitors'
        ],
        where: [
            'event_name = \'screen_view\'',
            'path != \'\''
        ],
        groupBy: ['path(path)'],
        orderBy: 'entries DESC',
        limit: 100,
        timeField: 'time',
        allowedFilters: ['referrer', 'device_type'],
        customizable: true
    },

    exit_pages: {
        table: 'analytics.events',
        fields: [
            'path(path) as name',
            'COUNT(DISTINCT session_id) as exits',
            'COUNT(DISTINCT anonymous_id) as visitors'
        ],
        where: [
            'event_name = \'screen_view\'',
            'path != \'\''
        ],
        groupBy: ['path(path)'],
        orderBy: 'exits DESC',
        limit: 100,
        timeField: 'time',
        allowedFilters: ['referrer', 'device_type'],
        customizable: true
    },

    page_performance: {
        table: 'analytics.events',
        fields: [
            'path(path) as name',
            'COUNT(*) as pageviews',
            'ROUND(AVG(CASE WHEN time_on_page > 0 THEN time_on_page / 1000 ELSE NULL END), 2) as avg_time_on_page',
            'COUNT(DISTINCT anonymous_id) as visitors'
        ],
        where: ['event_name = \'screen_view\'', 'path != \'\''],
        groupBy: ['path(path)'],
        orderBy: 'pageviews DESC',
        limit: 100,
        timeField: 'time',
        allowedFilters: ['referrer', 'device_type'],
        customizable: true
    }
}; 