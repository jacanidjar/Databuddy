import { appRouter, createRPCContext } from "@databuddy/rpc";
import { ORPCError } from "@orpc/server";
import { tool } from "ai";
import { z } from "zod";
import type { AppContext } from "../config/context";
import { createToolLogger } from "./utils/logger";

const stepSchema = z.object({
    type: z.enum(["PAGE_VIEW", "EVENT", "CUSTOM"]),
    target: z.string().min(1),
    name: z.string().min(1),
    conditions: z.record(z.string(), z.unknown()).optional(),
});

const filterSchema = z.object({
    field: z.string(),
    operator: z.enum(["equals", "contains", "not_equals", "in", "not_in"]),
    value: z.union([z.string(), z.array(z.string())]),
});

const logger = createToolLogger("Funnels Tools");

async function callRPCProcedure(
    routerName: string,
    method: string,
    input: unknown,
    context: AppContext
) {
    try {
        const headers = context.requestHeaders || new Headers();
        const rpcContext = await createRPCContext({ headers });

        const router = appRouter[routerName as keyof typeof appRouter];
        if (!router) {
            throw new Error(`Router ${routerName} not found`);
        }

        const procedure = router[method as keyof typeof router];
        if (!procedure) {
            throw new Error(`Procedure ${routerName}.${method} not found`);
        }

        // ORPC procedures can be called directly as functions
        // They accept { context, input } as parameters
        const procedureFn = procedure as unknown as (args: {
            context: typeof rpcContext;
            input: unknown;
        }) => Promise<unknown>;

        if (typeof procedureFn !== "function") {
            // Fallback: try accessing .handler if it exists
            const procedureWithHandler = procedure as {
                handler?: (args: {
                    context: typeof rpcContext;
                    input: unknown;
                }) => Promise<unknown>;
            };

            if (procedureWithHandler.handler) {
                const result = await procedureWithHandler.handler({
                    context: rpcContext,
                    input,
                });
                return result;
            }

            throw new Error(
                `Procedure ${routerName}.${method} is not callable. Expected a function or object with handler method.`
            );
        }

        const result = await procedureFn({
            context: rpcContext,
            input,
        });

        return result;
    } catch (error) {
        if (error instanceof ORPCError) {
            logger.error("ORPC error", {
                procedure: `${routerName}.${method}`,
                code: error.code,
                message: error.message,
            });

            const userMessage =
                error.code === "UNAUTHORIZED"
                    ? "You don't have permission to perform this action."
                    : error.code === "NOT_FOUND"
                        ? "The requested resource was not found."
                        : error.code === "BAD_REQUEST"
                            ? `Invalid request: ${error.message}`
                            : error.code === "FORBIDDEN"
                                ? "You don't have permission to access this resource."
                                : error.message ||
                                "An error occurred while processing your request.";

            throw new Error(userMessage);
        }

        if (error instanceof Error) {
            logger.error("RPC call error", {
                procedure: `${routerName}.${method}`,
                error: error.message,
                stack: error.stack,
                input,
            });
            throw error;
        }

        logger.error("Unknown error in RPC call", {
            procedure: `${routerName}.${method}`,
            error,
            input,
        });
        throw new Error("An unexpected error occurred. Please try again.");
    }
}

export function createFunnelTools(context: AppContext) {
    const listFunnelsTool = tool({
        description:
            "List all funnels for a website. Returns funnels with their steps, filters, and metadata.",
        inputSchema: z.object({
            websiteId: z.string().describe("The website ID to get funnels for"),
        }),
        execute: async ({ websiteId }) => {
            try {
                const result = await callRPCProcedure(
                    "funnels",
                    "list",
                    { websiteId },
                    context
                );
                return {
                    funnels: result,
                    count: Array.isArray(result) ? result.length : 0,
                };
            } catch (error) {
                logger.error("Failed to list funnels", { websiteId, error });
                throw error instanceof Error
                    ? error
                    : new Error("Failed to retrieve funnels. Please try again.");
            }
        },
    });

    const getFunnelByIdTool = tool({
        description:
            "Get a specific funnel by ID. Returns detailed information including steps, filters, and configuration.",
        inputSchema: z.object({
            id: z.string().describe("The funnel ID"),
            websiteId: z.string().describe("The website ID"),
        }),
        execute: async ({ id, websiteId }) => {
            try {
                return await callRPCProcedure(
                    "funnels",
                    "getById",
                    { id, websiteId },
                    context
                );
            } catch (error) {
                logger.error("Failed to get funnel by ID", { id, websiteId, error });
                throw error instanceof Error
                    ? error
                    : new Error("Failed to retrieve funnel. Please try again.");
            }
        },
    });

    const createFunnelTool = tool({
        description:
            "Create a new funnel. Requires at least 2 steps and can have optional filters and configuration.",
        inputSchema: z.object({
            websiteId: z.string().describe("The website ID"),
            name: z.string().min(1).max(100).describe("Funnel name"),
            description: z.string().optional().describe("Funnel description"),
            steps: z
                .array(stepSchema)
                .min(2)
                .max(10)
                .describe("Array of funnel steps (minimum 2, maximum 10)"),
            filters: z
                .array(filterSchema)
                .optional()
                .describe("Optional filters to apply to the funnel"),
            ignoreHistoricData: z
                .boolean()
                .optional()
                .describe("Whether to ignore data before funnel creation"),
        }),
        execute: async ({
            websiteId,
            name,
            description,
            steps,
            filters,
            ignoreHistoricData,
        }) => {
            try {
                if (!steps || steps.length < 2) {
                    throw new Error("A funnel must have at least 2 steps.");
                }
                if (steps.length > 10) {
                    throw new Error("A funnel cannot have more than 10 steps.");
                }

                return await callRPCProcedure(
                    "funnels",
                    "create",
                    { websiteId, name, description, steps, filters, ignoreHistoricData },
                    context
                );
            } catch (error) {
                logger.error("Failed to create funnel", {
                    websiteId,
                    name,
                    stepsCount: steps?.length,
                    error,
                });
                throw error instanceof Error
                    ? error
                    : new Error("Failed to create funnel. Please try again.");
            }
        },
    });

    const updateFunnelTool = tool({
        description:
            "Update an existing funnel. Can update name, description, steps, filters, and active status.",
        inputSchema: z.object({
            id: z.string().describe("The funnel ID to update"),
            name: z
                .string()
                .min(1)
                .max(100)
                .optional()
                .describe("Updated funnel name"),
            description: z.string().optional().describe("Updated funnel description"),
            steps: z
                .array(stepSchema)
                .min(2)
                .max(10)
                .optional()
                .describe("Updated array of funnel steps"),
            filters: z
                .array(filterSchema)
                .optional()
                .describe("Updated filters to apply to the funnel"),
            ignoreHistoricData: z
                .boolean()
                .optional()
                .describe("Whether to ignore data before funnel creation"),
            isActive: z.boolean().optional().describe("Whether the funnel is active"),
        }),
        execute: async ({
            id,
            name,
            description,
            steps,
            filters,
            ignoreHistoricData,
            isActive,
        }) => {
            try {
                if (steps && steps.length < 2) {
                    throw new Error("A funnel must have at least 2 steps.");
                }
                if (steps && steps.length > 10) {
                    throw new Error("A funnel cannot have more than 10 steps.");
                }

                return await callRPCProcedure(
                    "funnels",
                    "update",
                    {
                        id,
                        name,
                        description,
                        steps,
                        filters,
                        ignoreHistoricData,
                        isActive,
                    },
                    context
                );
            } catch (error) {
                logger.error("Failed to update funnel", { id, error });
                throw error instanceof Error
                    ? error
                    : new Error("Failed to update funnel. Please try again.");
            }
        },
    });

    const deleteFunnelTool = tool({
        description:
            "Delete a funnel by ID. This is a soft delete that marks the funnel as inactive.",
        inputSchema: z.object({
            id: z.string().describe("The funnel ID to delete"),
        }),
        execute: async ({ id }) => {
            try {
                return await callRPCProcedure("funnels", "delete", { id }, context);
            } catch (error) {
                logger.error("Failed to delete funnel", { id, error });
                throw error instanceof Error
                    ? error
                    : new Error("Failed to delete funnel. Please try again.");
            }
        },
    });

    const getFunnelAnalyticsTool = tool({
        description:
            "Get analytics data for a funnel. Returns conversion rates, drop-off points, and step-by-step metrics.",
        inputSchema: z.object({
            funnelId: z.string().describe("The funnel ID"),
            websiteId: z.string().describe("The website ID"),
            startDate: z
                .string()
                .optional()
                .describe("Start date in YYYY-MM-DD format (defaults to 30 days ago)"),
            endDate: z
                .string()
                .optional()
                .describe("End date in YYYY-MM-DD format (defaults to today)"),
        }),
        execute: async ({ funnelId, websiteId, startDate, endDate }) => {
            try {
                if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
                    throw new Error(
                        "Start date must be in YYYY-MM-DD format (e.g., 2024-01-15)."
                    );
                }
                if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
                    throw new Error(
                        "End date must be in YYYY-MM-DD format (e.g., 2024-01-15)."
                    );
                }

                return await callRPCProcedure(
                    "funnels",
                    "getAnalytics",
                    { funnelId, websiteId, startDate, endDate },
                    context
                );
            } catch (error) {
                logger.error("Failed to get funnel analytics", {
                    funnelId,
                    websiteId,
                    startDate,
                    endDate,
                    error,
                });
                throw error instanceof Error
                    ? error
                    : new Error("Failed to retrieve funnel analytics. Please try again.");
            }
        },
    });

    const getFunnelAnalyticsByReferrerTool = tool({
        description:
            "Get funnel analytics broken down by referrer/traffic source. Shows which sources drive the best conversions.",
        inputSchema: z.object({
            funnelId: z.string().describe("The funnel ID"),
            websiteId: z.string().describe("The website ID"),
            startDate: z
                .string()
                .optional()
                .describe("Start date in YYYY-MM-DD format (defaults to 30 days ago)"),
            endDate: z
                .string()
                .optional()
                .describe("End date in YYYY-MM-DD format (defaults to today)"),
        }),
        execute: async ({ funnelId, websiteId, startDate, endDate }) => {
            try {
                if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
                    throw new Error(
                        "Start date must be in YYYY-MM-DD format (e.g., 2024-01-15)."
                    );
                }
                if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
                    throw new Error(
                        "End date must be in YYYY-MM-DD format (e.g., 2024-01-15)."
                    );
                }

                return await callRPCProcedure(
                    "funnels",
                    "getAnalyticsByReferrer",
                    { funnelId, websiteId, startDate, endDate },
                    context
                );
            } catch (error) {
                logger.error("Failed to get funnel analytics by referrer", {
                    funnelId,
                    websiteId,
                    startDate,
                    endDate,
                    error,
                });
                throw error instanceof Error
                    ? error
                    : new Error(
                        "Failed to retrieve funnel analytics by referrer. Please try again."
                    );
            }
        },
    });

    return {
        // Read operations - cached for better performance
        list_funnels: listFunnelsTool,
        get_funnel_by_id: getFunnelByIdTool,

        // Write operations - not cached
        create_funnel: createFunnelTool,
        update_funnel: updateFunnelTool,
        delete_funnel: deleteFunnelTool,

        // Analytics - cached for longer periods (expensive queries)
        get_funnel_analytics: getFunnelAnalyticsTool,
        get_funnel_analytics_by_referrer: getFunnelAnalyticsByReferrerTool,
    } as const;
}
