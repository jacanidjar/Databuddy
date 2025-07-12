import { Elysia, t } from "elysia";
import { executeQuery, compileQuery } from "../query";
import { QueryBuilders } from "../query/builders";

const FilterSchema = t.Object({
    field: t.String(),
    op: t.Enum({
        eq: 'eq',
        ne: 'ne',
        like: 'like',
        gt: 'gt',
        lt: 'lt',
        in: 'in',
        notIn: 'notIn'
    }),
    value: t.Union([t.String(), t.Number(), t.Array(t.Union([t.String(), t.Number()]))])
});

export const query = new Elysia({ prefix: '/query' })
    .get('/types', () => ({
        success: true,
        types: Object.keys(QueryBuilders),
        configs: Object.fromEntries(
            Object.entries(QueryBuilders).map(([key, config]) => [
                key,
                {
                    allowedFilters: config.allowedFilters || [],
                    customizable: config.customizable || false,
                    defaultLimit: config.limit
                }
            ])
        )
    }))

    .post('/compile', async ({ body }) => {
        try {
            const result = compileQuery(body);
            return { success: true, ...result };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Compilation failed'
            };
        }
    }, {
        body: t.Object({
            projectId: t.String(),
            type: t.Enum(Object.fromEntries(Object.keys(QueryBuilders).map(k => [k, k]))),
            from: t.String(),
            to: t.String(),
            timeUnit: t.Optional(t.Enum({
                minute: 'minute',
                hour: 'hour',
                day: 'day',
                week: 'week',
                month: 'month'
            })),
            filters: t.Optional(t.Array(FilterSchema)),
            groupBy: t.Optional(t.Array(t.String())),
            orderBy: t.Optional(t.String()),
            limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
            offset: t.Optional(t.Number({ minimum: 0 }))
        })
    })

    .post('/', async ({ body }) => {
        try {
            const result = await executeQuery(body);
            return { success: true, data: result };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Query failed'
            };
        }
    }, {
        body: t.Object({
            projectId: t.String(),
            type: t.Enum(Object.fromEntries(Object.keys(QueryBuilders).map(k => [k, k]))),
            from: t.String(),
            to: t.String(),
            timeUnit: t.Optional(t.Enum({
                minute: 'minute',
                hour: 'hour',
                day: 'day',
                week: 'week',
                month: 'month'
            })),
            filters: t.Optional(t.Array(FilterSchema)),
            groupBy: t.Optional(t.Array(t.String())),
            orderBy: t.Optional(t.String()),
            limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
            offset: t.Optional(t.Number({ minimum: 0 }))
        })
    }); 