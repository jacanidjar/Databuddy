import type { QueryBuilderGroup } from '../types'
import { createQueryBuilder } from '../builder-utils'

const buildQuery = createQueryBuilder('analytics.errors')

const groupableFields: Record<string, { select: string, groupBy: string, where?: string }> = {
    page: { select: 'path', groupBy: 'path', where: `path != ''` },
    browser: { select: `CONCAT(browser_name, ' ', browser_version)`, groupBy: 'browser_name, browser_version', where: `browser_name != '' AND browser_version IS NOT NULL AND browser_version != ''` },
    os: { select: 'os_name', groupBy: 'os_name', where: `os_name != ''` },
    country: { select: 'country', groupBy: 'country', where: `country != ''` },
    device: { select: 'device_type', groupBy: 'device_type', where: `device_type != ''` },
    error: { select: 'message', groupBy: 'message' }
}

export const errorBuilders: QueryBuilderGroup = {
    recent_errors: (websiteId, dateRange, filters, limit, offset) =>
        buildQuery(websiteId, dateRange, {
            select: [
                'message as error_message',
                'stack as error_stack',
                'path as page_url',
                'anonymous_id',
                'session_id',
                'timestamp as time',
                'browser_name',
                'browser_version',
                'os_name',
                'device_type',
                'country',
                'region',
            ],
            orderBy: ['timestamp DESC'],
            baseWhere: [`message != ''`],
        }, filters, limit, offset),

    error_types: (websiteId, dateRange, filters, limit, offset) =>
        buildQuery(websiteId, dateRange, {
            select: [
                'message as name',
                'COUNT(*) as total_occurrences',
                'uniq(anonymous_id) as affected_users',
                'uniq(session_id) as affected_sessions',
                'MAX(timestamp) as last_occurrence',
                'MIN(timestamp) as first_occurrence'
            ],
            groupBy: ['message'],
            orderBy: ['total_occurrences DESC'],
            baseWhere: [`message != ''`],
        }, filters, limit, offset),

    error_trends: (websiteId, dateRange, filters, limit, offset) =>
        buildQuery(websiteId, dateRange, {
            select: [
                'toDate(timestamp) as date',
                'COUNT(*) as total_errors',
                'COUNT(DISTINCT message) as unique_error_types',
                'uniq(anonymous_id) as affected_users',
                'uniq(session_id) as affected_sessions'
            ],
            groupBy: ['toDate(timestamp)'],
            orderBy: ['date ASC'],
            baseWhere: [`message != ''`],
        }, filters, limit, offset),
} 