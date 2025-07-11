import type { SQL } from 'drizzle-orm'

export type Granularity = 'hour' | 'day' | 'week' | 'month'

export interface QueryDateRange {
    from: string
    to: string
}

export interface QueryFilters {
    [key: string]: string | number | string[] | number[]
}

export type QueryBuilder = (
    websiteId: string,
    dateRange: QueryDateRange,
    filters?: QueryFilters,
    limit?: number,
    offset?: number,
    granularity?: Granularity,
) => SQL

export interface QueryBuilderGroup {
    [key: string]: QueryBuilder
} 