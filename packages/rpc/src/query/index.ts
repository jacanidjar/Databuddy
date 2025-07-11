import { db } from '@databuddy/db/client'
import type { QueryBuilder, QueryDateRange, QueryFilters } from './types'
import { errorBuilders } from './builders/errors'

const allBuilders = {
    ...errorBuilders,
}

export async function executeQuery(
    name: string,
    websiteId: string,
    dateRange: QueryDateRange,
    filters?: QueryFilters,
    limit?: number,
    offset?: number
) {
    const builder: QueryBuilder | undefined = allBuilders[name]

    if (!builder) {
        throw new Error(`Query builder not found for: ${name}`)
    }

    const query = builder(websiteId, dateRange, filters, limit, offset)

    try {
        const results = await db.execute(query)
        return results
    } catch (error) {
        console.error(`Error executing query: ${name}`, error)
        throw new Error('Query execution failed')
    }
} 