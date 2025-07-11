import { sql, type SQL } from 'drizzle-orm'
import type { QueryFilters } from './types'

export function getWhereClause(filters?: QueryFilters): SQL | undefined {
    if (!filters || Object.keys(filters).length === 0) {
        return undefined
    }

    const conditions = Object.entries(filters).map(([key, value]) => {
        if (Array.isArray(value)) {
            return sql.raw(`${key} IN (${value.map(v => `'${v}'`).join(',')})`)
        }
        return sql.raw(`${key} = '${value}'`)
    })

    return sql.join(conditions, sql` AND `)
} 