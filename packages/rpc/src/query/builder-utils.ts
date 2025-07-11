import { sql, type SQL } from 'drizzle-orm'
import type { QueryDateRange, QueryFilters } from './types'
import { getWhereClause } from './utils'

type QueryOptions = {
    select: (SQL | string)[]
    groupBy?: (SQL | string)[]
    orderBy?: (SQL | string)[]
    baseWhere?: (SQL | string)[]
}

export function createQueryBuilder(table: `analytics.${string}`) {
    return (
        websiteId: string,
        dateRange: QueryDateRange,
        options: QueryOptions,
        filters?: QueryFilters,
        limit = 100,
        offset = 0
    ): SQL => {
        const { select, groupBy, orderBy, baseWhere } = options

        const whereClauses = [
            sql`website_id = ${websiteId}`,
            sql`timestamp >= ${dateRange.from}`,
            sql`timestamp <= ${dateRange.to}`,
            ...(baseWhere || []).map(w => (typeof w === 'string' ? sql.raw(w) : w)),
        ]

        const filterWhere = getWhereClause(filters)
        if (filterWhere) {
            whereClauses.push(filterWhere)
        }

        const finalQuery = sql`
      SELECT ${sql.join(select.map(s => (typeof s === 'string' ? sql.raw(s) : s)), sql`, `)}
      FROM ${sql.raw(table)}
      WHERE ${sql.join(whereClauses, sql` AND `)}
      ${groupBy ? sql`GROUP BY ${sql.join(groupBy.map(g => (typeof g === 'string' ? sql.raw(g) : g)), sql`, `)}` : sql``}
      ${orderBy ? sql`ORDER BY ${sql.join(orderBy.map(o => (typeof o === 'string' ? sql.raw(o) : o)), sql`, `)}` : sql``}
      LIMIT ${limit}
      OFFSET ${offset}
    `
        return finalQuery
    }
} 