import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { and, eq, isNull, desc, sql, inArray } from 'drizzle-orm';
import { escape as sqlEscape } from 'sqlstring';
import { TRPCError } from '@trpc/server';
import { goals, chQuery } from '@databuddy/db';
import { authorizeWebsiteAccess } from '../utils/auth';
import { logger } from '../utils/discord-webhook';

const goalSchema = z.object({
    type: z.enum(['PAGE_VIEW', 'EVENT', 'CUSTOM']),
    target: z.string().min(1),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    filters: z.array(z.object({
        field: z.string(),
        operator: z.enum(['equals', 'contains', 'not_equals', 'in', 'not_in']),
        value: z.union([z.string(), z.array(z.string())]),
    })).optional(),
});

const createGoalSchema = z.object({
    websiteId: z.string(),
    ...goalSchema.shape,
});

const updateGoalSchema = z.object({
    id: z.string(),
    type: z.enum(['PAGE_VIEW', 'EVENT', 'CUSTOM']).optional(),
    target: z.string().min(1).optional(),
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    filters: z.array(z.object({
        field: z.string(),
        operator: z.enum(['equals', 'contains', 'not_equals', 'in', 'not_in']),
        value: z.union([z.string(), z.array(z.string())]),
    })).optional(),
    isActive: z.boolean().optional(),
});

const analyticsDateRangeSchema = z.object({
    goalId: z.string(),
    websiteId: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

const ALLOWED_FIELDS = new Set([
    'id', 'client_id', 'event_name', 'anonymous_id', 'time', 'session_id',
    'event_type', 'event_id', 'session_start_time', 'timestamp',
    'referrer', 'url', 'path', 'title', 'ip', 'user_agent', 'browser_name',
    'browser_version', 'os_name', 'os_version', 'device_type', 'device_brand',
    'device_model', 'country', 'region', 'city', 'screen_resolution',
    'viewport_size', 'language', 'timezone', 'connection_type', 'rtt',
    'downlink', 'time_on_page', 'scroll_depth', 'interaction_count',
    'exit_intent', 'page_count', 'is_bounce', 'has_exit_intent', 'page_size',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'load_time', 'dom_ready_time', 'dom_interactive', 'ttfb', 'connection_time',
    'request_time', 'render_time', 'redirect_time', 'domain_lookup_time',
    'fcp', 'lcp', 'cls', 'fid', 'inp', 'href', 'text', 'value',
    'error_message', 'error_filename', 'error_lineno', 'error_colno',
    'error_stack', 'error_type', 'properties', 'created_at',
]);

const ALLOWED_OPERATORS = new Set([
    'equals', 'contains', 'not_equals', 'in', 'not_in',
]);

// Refactored buildFilterConditions to use parameterized values
const buildFilterConditions = (filters: Array<{ field: string; operator: string; value: string | string[] }>, paramPrefix: string, params: Record<string, unknown>) => {
    if (!filters || filters.length === 0) return '';
    const filterConditions = filters.map((filter, i) => {
        if (!ALLOWED_FIELDS.has(filter.field)) return '';
        if (!ALLOWED_OPERATORS.has(filter.operator)) return '';
        const field = filter.field;
        const value = Array.isArray(filter.value) ? filter.value : [filter.value];
        const key = `${paramPrefix}_${i}`;
        switch (filter.operator) {
            case 'equals':
                params[key] = value[0];
                return `${field} = {${key}:String}`;
            case 'contains':
                params[key] = `%${value[0]}%`;
                return `${field} LIKE {${key}:String}`;
            case 'not_equals':
                params[key] = value[0];
                return `${field} != {${key}:String}`;
            case 'in':
                params[key] = value;
                return `${field} IN {${key}:Array(String)}`;
            case 'not_in':
                params[key] = value;
                return `${field} NOT IN {${key}:Array(String)}`;
            default:
                return '';
        }
    }).filter(Boolean);
    return filterConditions.length > 0 ? ` AND ${filterConditions.join(' AND ')}` : '';
};

const getDefaultDateRange = () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return { startDate, endDate };
};

export const goalsRouter = createTRPCRouter({
    // List all goals for a website
    list: protectedProcedure
        .input(z.object({ websiteId: z.string() }))
        .query(async ({ ctx, input }) => {
            await authorizeWebsiteAccess(ctx, input.websiteId, 'read');
            const result = await ctx.db
                .select()
                .from(goals)
                .where(and(
                    eq(goals.websiteId, input.websiteId),
                    isNull(goals.deletedAt)
                ))
                .orderBy(desc(goals.createdAt));
            return result;
        }),
    // Get a specific goal
    getById: protectedProcedure
        .input(z.object({ id: z.string(), websiteId: z.string() }))
        .query(async ({ ctx, input }) => {
            await authorizeWebsiteAccess(ctx, input.websiteId, 'read');
            const result = await ctx.db
                .select()
                .from(goals)
                .where(and(
                    eq(goals.id, input.id),
                    eq(goals.websiteId, input.websiteId),
                    isNull(goals.deletedAt)
                ))
                .limit(1);
            if (result.length === 0) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Goal not found' });
            }
            return result[0];
        }),
    // Create a new goal
    create: protectedProcedure
        .input(createGoalSchema)
        .mutation(async ({ ctx, input }) => {
            await authorizeWebsiteAccess(ctx, input.websiteId, 'update');
            const goalId = crypto.randomUUID();
            const [newGoal] = await ctx.db
                .insert(goals)
                .values({
                    id: goalId,
                    websiteId: input.websiteId,
                    type: input.type,
                    target: input.target,
                    name: input.name,
                    description: input.description,
                    filters: input.filters,
                    isActive: true,
                    createdBy: ctx.user.id,
                } as any)
                .returning();

            return newGoal;
        }),
    // Update a goal
    update: protectedProcedure
        .input(updateGoalSchema)
        .mutation(async ({ ctx, input }) => {
            const existingGoal = await ctx.db
                .select({ websiteId: goals.websiteId })
                .from(goals)
                .where(and(
                    eq(goals.id, input.id),
                    isNull(goals.deletedAt)
                ))
                .limit(1);
            if (existingGoal.length === 0) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Goal not found' });
            }
            await authorizeWebsiteAccess(ctx, existingGoal[0].websiteId, 'update');
            const { id, ...updates } = input;
            const [updatedGoal] = await ctx.db
                .update(goals)
                .set({
                    ...updates,
                    updatedAt: new Date().toISOString(),
                } as any)
                .where(and(
                    eq(goals.id, id),
                    isNull(goals.deletedAt)
                ))
                .returning();
            return updatedGoal;
        }),
    // Delete a goal (soft delete)
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const existingGoal = await ctx.db
                .select({ websiteId: goals.websiteId })
                .from(goals)
                .where(and(
                    eq(goals.id, input.id),
                    isNull(goals.deletedAt)
                ))
                .limit(1);
            if (existingGoal.length === 0) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Goal not found' });
            }
            await authorizeWebsiteAccess(ctx, existingGoal[0].websiteId, 'delete');
            await ctx.db
                .update(goals)
                .set({
                    deletedAt: new Date().toISOString(),
                    isActive: false,
                } as any)
                .where(and(
                    eq(goals.id, input.id),
                    isNull(goals.deletedAt)
                ));
            return { success: true };
        }),
    // Get goal analytics (conversion rate)
    getAnalytics: protectedProcedure
        .input(analyticsDateRangeSchema)
        .query(async ({ ctx, input }) => {
            await authorizeWebsiteAccess(ctx, input.websiteId, 'read');
            const { startDate, endDate } = input.startDate && input.endDate
                ? { startDate: input.startDate, endDate: input.endDate }
                : getDefaultDateRange();
            const goal = await ctx.db
                .select()
                .from(goals)
                .where(and(
                    eq(goals.id, input.goalId),
                    eq(goals.websiteId, input.websiteId),
                    isNull(goals.deletedAt)
                ))
                .limit(1);
            if (goal.length === 0) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Goal not found' });
            }
            const goalData = goal[0];
            const filters = goalData.filters as Array<{ field: string; operator: string; value: string | string[] }> || [];
            const params: Record<string, unknown> = {
                websiteId: input.websiteId,
                startDate,
                endDate,
            };
            let goalWhereCondition = '';
            if (goalData.type === 'PAGE_VIEW') {
                // Direct interpolation for path
                const targetPath = (goalData.target || '').replace(/'/g, "''");
                goalWhereCondition = `event_name = 'screen_view' AND (path = '${targetPath}' OR path LIKE '%${targetPath}%')`;
            } else if (goalData.type === 'EVENT') {
                // Direct interpolation for event name
                const eventName = (goalData.target || '').replace(/'/g, "''");
                goalWhereCondition = `event_name = '${eventName}'`;
            }
            const filterConditions = buildFilterConditions(filters, 'f', params);
            const analyticsQuery = `
                WITH 
                total_sessions AS (
                    SELECT COUNT(DISTINCT session_id) as total_users
                    FROM analytics.events
                    WHERE client_id = {websiteId:String}
                        AND time >= parseDateTimeBestEffort({startDate:String})
                        AND time <= parseDateTimeBestEffort(concat({endDate:String}, ' 23:59:59'))${filterConditions}
                ),
                goal_sessions AS (
                    SELECT COUNT(DISTINCT session_id) as goal_users
                    FROM analytics.events
                    WHERE client_id = {websiteId:String}
                        AND time >= parseDateTimeBestEffort({startDate:String})
                        AND time <= parseDateTimeBestEffort(concat({endDate:String}, ' 23:59:59'))
                        AND ${goalWhereCondition}${filterConditions}
                )
                SELECT 
                    total_sessions.total_users,
                    goal_sessions.goal_users,
                    CASE 
                        WHEN total_sessions.total_users > 0 
                        THEN ROUND((goal_sessions.goal_users * 100.0) / total_sessions.total_users, 2)
                        ELSE 0.0 
                    END as conversion_rate
                FROM total_sessions, goal_sessions
            `;
            const results = await chQuery<{
                total_users: number;
                goal_users: number;
                conversion_rate: number;
            }>(analyticsQuery, params);
            const result = results[0] || { total_users: 0, goal_users: 0, conversion_rate: 0 };
            return {
                overall_conversion_rate: result.conversion_rate,
                total_users_entered: result.total_users,
                total_users_completed: result.goal_users,
                avg_completion_time: 0,
                avg_completion_time_formatted: '0s',
                steps_analytics: [{
                    step_number: 1,
                    step_name: goalData.name,
                    users: result.goal_users,
                    total_users: result.total_users,
                    conversion_rate: result.conversion_rate,
                    dropoffs: result.total_users - result.goal_users,
                    dropoff_rate: result.total_users > 0 ?
                        Math.round(((result.total_users - result.goal_users) / result.total_users) * 100 * 100) / 100 : 0,
                    avg_time_to_complete: 0
                }]
            };
        }),
    // Bulk analytics for multiple goals
    bulkAnalytics: protectedProcedure
        .input(z.object({
            websiteId: z.string(),
            goalIds: z.array(z.string()),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            await authorizeWebsiteAccess(ctx, input.websiteId, 'read');
            const { startDate, endDate } = input.startDate && input.endDate
                ? { startDate: input.startDate, endDate: input.endDate }
                : getDefaultDateRange();
            const goalsList = await ctx.db
                .select()
                .from(goals)
                .where(and(
                    eq(goals.websiteId, input.websiteId),
                    isNull(goals.deletedAt),
                    input.goalIds.length > 0 ? inArray(goals.id, input.goalIds) : sql`1=0`
                ))
                .orderBy(desc(goals.createdAt));
            const analyticsResults: Record<string, any> = {};

            for (const [idx, goalData] of goalsList.entries()) {
                const filters = goalData.filters as Array<{ field: string; operator: string; value: string | string[] }> || [];
                const params: Record<string, unknown> = {
                    websiteId: input.websiteId,
                    startDate,
                    endDate,
                };
                let goalWhereCondition = '';
                if (goalData.type === 'PAGE_VIEW') {
                    // Direct interpolation for path
                    const targetPath = (goalData.target || '').replace(/'/g, "''");
                    goalWhereCondition = `event_name = 'screen_view' AND (path = '${targetPath}' OR path LIKE '%${targetPath}%')`;
                } else if (goalData.type === 'EVENT') {
                    // Direct interpolation for event name
                    const eventName = (goalData.target || '').replace(/'/g, "''");
                    goalWhereCondition = `event_name = '${eventName}'`;
                }

                // If no goal condition, skip this goal
                if (!goalWhereCondition) {
                    analyticsResults[goalData.id] = {
                        overall_conversion_rate: 0,
                        total_users_entered: 0,
                        total_users_completed: 0,
                        avg_completion_time: 0,
                        avg_completion_time_formatted: '0s',
                        steps_analytics: [{
                            step_number: 1,
                            step_name: goalData.name,
                            users: 0,
                            total_users: 0,
                            conversion_rate: 0,
                            dropoffs: 0,
                            dropoff_rate: 0,
                            avg_time_to_complete: 0
                        }]
                    };
                    continue;
                }

                const filterConditions = buildFilterConditions(filters, `f${idx}`, params);
                const analyticsQuery = `
                    WITH 
                    total_sessions AS (
                        SELECT COUNT(DISTINCT session_id) as total_users
                        FROM analytics.events
                        WHERE client_id = {websiteId:String}
                            AND time >= parseDateTimeBestEffort({startDate:String})
                            AND time <= parseDateTimeBestEffort(concat({endDate:String}, ' 23:59:59'))${filterConditions}
                    ),
                    goal_sessions AS (
                        SELECT COUNT(DISTINCT session_id) as goal_users
                        FROM analytics.events
                        WHERE client_id = {websiteId:String}
                            AND time >= parseDateTimeBestEffort({startDate:String})
                            AND time <= parseDateTimeBestEffort(concat({endDate:String}, ' 23:59:59'))
                            AND ${goalWhereCondition}${filterConditions}
                    )
                    SELECT 
                        total_sessions.total_users,
                        goal_sessions.goal_users,
                        CASE 
                            WHEN total_sessions.total_users > 0 
                            THEN ROUND((goal_sessions.goal_users * 100.0) / total_sessions.total_users, 2)
                            ELSE 0.0 
                        END as conversion_rate
                    FROM total_sessions, goal_sessions
                `;
                const results = await chQuery<{
                    total_users: number;
                    goal_users: number;
                    conversion_rate: number;
                }>(analyticsQuery, params);
                const result = results[0] || { total_users: 0, goal_users: 0, conversion_rate: 0 };
                analyticsResults[goalData.id] = {
                    overall_conversion_rate: result.conversion_rate,
                    total_users_entered: result.total_users,
                    total_users_completed: result.goal_users,
                    avg_completion_time: 0,
                    avg_completion_time_formatted: '0s',
                    steps_analytics: [{
                        step_number: 1,
                        step_name: goalData.name,
                        users: result.goal_users,
                        total_users: result.total_users,
                        conversion_rate: result.conversion_rate,
                        dropoffs: result.total_users - result.goal_users,
                        dropoff_rate: result.total_users > 0 ?
                            Math.round(((result.total_users - result.goal_users) / result.total_users) * 100 * 100) / 100 : 0,
                        avg_time_to_complete: 0
                    }]
                };
            }
            return analyticsResults;
        }),
}); 