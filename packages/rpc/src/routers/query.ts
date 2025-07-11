import { z } from 'zod/v4'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { executeQuery } from '../query'

export const queryRouter = createTRPCRouter({
    query: protectedProcedure
        .input(z.object({
            name: z.string(),
            websiteId: z.string(),
            dateRange: z.object({
                from: z.string().datetime(),
                to: z.string().datetime(),
            }),
            filters: z.record(z.union([
                z.string(),
                z.number(),
                z.array(z.string()),
                z.array(z.number()),
            ])).optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
        }))
        .query(async ({ input }) => {
            const { name, websiteId, dateRange, filters, limit, offset } = input
            const data = await executeQuery(name, websiteId, dateRange, filters, limit, offset)
            return data
        }),
}) 