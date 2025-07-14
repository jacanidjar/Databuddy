import type { SimpleQueryConfig } from "../types";

export const GeoBuilders: Record<string, SimpleQueryConfig> = {
    country: {
        table: 'analytics.events',
        fields: [
            'country as name',
            'COUNT(*) as pageviews',
            'COUNT(DISTINCT anonymous_id) as visitors',
            'ROUND((COUNT(*) / SUM(COUNT(*)) OVER()) * 100, 2) as percentage'
        ],
        where: ['country != \'\'', 'event_name = \'screen_view\''],
        groupBy: ['country'],
        orderBy: 'pageviews DESC',
        limit: 100,
        timeField: 'time',
        allowedFilters: ['path', 'device_type', 'browser_name'],
        customizable: true,
        plugins: { normalizeGeo: true, deduplicateGeo: true }
    },

    region: {
        table: 'analytics.events',
        fields: [
            'region as name',
            'COUNT(*) as pageviews',
            'COUNT(DISTINCT anonymous_id) as visitors',
            'ROUND((COUNT(*) / SUM(COUNT(*)) OVER()) * 100, 2) as percentage'
        ],
        where: ['region != \'\'', 'event_name = \'screen_view\''],
        groupBy: ['region'],
        orderBy: 'pageviews DESC',
        limit: 100,
        timeField: 'time',
        allowedFilters: ['country', 'path', 'device_type'],
        customizable: true
    },

    timezone: {
        table: 'analytics.events',
        fields: [
            'timezone as name',
            'COUNT(*) as pageviews',
            'COUNT(DISTINCT anonymous_id) as visitors',
            'ROUND((COUNT(*) / SUM(COUNT(*)) OVER()) * 100, 2) as percentage'
        ],
        where: ['timezone != \'\'', 'event_name = \'screen_view\''],
        groupBy: ['timezone'],
        orderBy: 'pageviews DESC',
        limit: 100,
        timeField: 'time',
        allowedFilters: ['country', 'path', 'device_type'],
        customizable: true
    },

    language: {
        table: 'analytics.events',
        fields: [
            'language as name',
            'COUNT(*) as pageviews',
            'COUNT(DISTINCT anonymous_id) as visitors',
            'ROUND((COUNT(*) / SUM(COUNT(*)) OVER()) * 100, 2) as percentage'
        ],
        where: ['language != \'\'', 'event_name = \'screen_view\''],
        groupBy: ['language'],
        orderBy: 'pageviews DESC',
        limit: 100,
        timeField: 'time',
        allowedFilters: ['country', 'path', 'device_type'],
        customizable: true
    },

    countries: {
        table: 'analytics.events',
        fields: [
            'country as name',
            'COUNT(*) as pageviews',
            'COUNT(DISTINCT anonymous_id) as visitors',
            'ROUND((COUNT(*) / SUM(COUNT(*)) OVER()) * 100, 2) as percentage'
        ],
        where: ['country != \'\'', 'event_name = \'screen_view\''],
        groupBy: ['country'],
        orderBy: 'pageviews DESC',
        limit: 25,
        timeField: 'time',
        allowedFilters: ['country', 'path', 'device_type', 'browser_name'],
        customizable: true,
        plugins: { normalizeGeo: true, deduplicateGeo: true }
    },

    cities: {
        table: 'analytics.events',
        fields: [
            'city as name',
            'COUNT(*) as pageviews',
            'COUNT(DISTINCT anonymous_id) as visitors',
            'ROUND((COUNT(*) / SUM(COUNT(*)) OVER()) * 100, 2) as percentage'
        ],
        where: ['city != \'\'', 'event_name = \'screen_view\''],
        groupBy: ['city'],
        orderBy: 'pageviews DESC',
        limit: 25,
        timeField: 'time',
        allowedFilters: ['city', 'country', 'path', 'device_type'],
        customizable: true
    },

    regions: {
        table: 'analytics.events',
        fields: [
            'region as name',
            'COUNT(*) as pageviews',
            'COUNT(DISTINCT anonymous_id) as visitors',
            'ROUND((COUNT(*) / SUM(COUNT(*)) OVER()) * 100, 2) as percentage'
        ],
        where: ['region != \'\'', 'event_name = \'screen_view\''],
        groupBy: ['region'],
        orderBy: 'pageviews DESC',
        limit: 25,
        timeField: 'time',
        allowedFilters: ['region', 'country', 'path', 'device_type'],
        customizable: true
    },

    geo_time_series: {
        table: 'analytics.events',
        fields: [
            'toDate(time) as date',
            'country',
            'COUNT(*) as pageviews',
            'COUNT(DISTINCT anonymous_id) as visitors'
        ],
        where: ['country != \'\'', 'event_name = \'screen_view\''],
        groupBy: ['toDate(time)', 'country'],
        orderBy: 'date ASC, pageviews DESC',
        timeField: 'time',
        allowedFilters: ['country', 'city', 'region', 'path'],
        customizable: true
    }
}; 