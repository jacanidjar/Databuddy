import {
    alarms,
    alarmTriggerHistory,
    and,
    db,
    desc,
    eq,
    isNull,
    or,
} from "@databuddy/db";
import {
    sendDiscordWebhook,
    sendEmail,
    sendSlackWebhook,
    sendWebhook,
} from "@databuddy/notifications";
import { logger } from "@databuddy/shared/logger";
import { randomUUIDv7 } from "bun";
import { z } from "zod";
import { protectedProcedure } from "../orpc";
import { authorizeWebsiteAccess } from "../utils/auth";

// Trigger condition schema for uptime alarms
const triggerConditionsSchema = z.object({
    consecutiveFailures: z.number().min(1).max(10).default(3),
    cooldownMinutes: z.number().min(1).max(1440).default(5),
});

// Webhook headers schema
const webhookHeadersSchema = z.record(z.string());

export const alarmsRouter = {
    list: protectedProcedure
        .input(
            z
                .object({
                    websiteId: z.string().optional(),
                    organizationId: z.string().optional(),
                    triggerType: z
                        .enum(["uptime", "traffic_spike", "error_rate", "goal", "custom"])
                        .optional(),
                })
                .default({})
        )
        .handler(async ({ context, input }) => {
            const conditions = [];

            // Filter by website if specified
            if (input.websiteId) {
                await authorizeWebsiteAccess(context, input.websiteId, "read");
                conditions.push(eq(alarms.websiteId, input.websiteId));
            }

            // Filter by organization if specified
            if (input.organizationId) {
                conditions.push(eq(alarms.organizationId, input.organizationId));
            }

            // User's own alarms
            conditions.push(eq(alarms.userId, context.user.id));

            // Filter by trigger type if specified
            if (input.triggerType) {
                conditions.push(eq(alarms.triggerType, input.triggerType));
            }

            return db.query.alarms.findMany({
                where: and(...conditions),
                orderBy: [desc(alarms.createdAt)],
                with: {
                    website: true,
                },
            });
        }),

    get: protectedProcedure
        .input(z.object({ id: z.string() }))
        .handler(async ({ context, input, errors }) => {
            const alarm = await db.query.alarms.findFirst({
                where: eq(alarms.id, input.id),
                with: {
                    website: true,
                    triggerHistory: {
                        orderBy: [desc(alarmTriggerHistory.triggeredAt)],
                        limit: 10,
                    },
                },
            });

            if (!alarm) {
                throw errors.NOT_FOUND({
                    message: "Alarm not found",
                    data: { resourceType: "alarm", resourceId: input.id },
                });
            }

            // Check authorization
            if (alarm.userId !== context.user.id) {
                throw errors.FORBIDDEN({
                    message: "You do not have access to this alarm",
                });
            }

            return alarm;
        }),

    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).max(100),
                description: z.string().optional(),
                websiteId: z.string().optional(),
                organizationId: z.string().optional(),
                triggerType: z.enum([
                    "uptime",
                    "traffic_spike",
                    "error_rate",
                    "goal",
                    "custom",
                ]),
                notificationChannels: z
                    .array(z.enum(["slack", "discord", "email", "webhook"]))
                    .min(1),
                slackWebhookUrl: z.string().url().optional(),
                discordWebhookUrl: z.string().url().optional(),
                emailAddresses: z.array(z.string().email()).optional(),
                webhookUrl: z.string().url().optional(),
                webhookHeaders: webhookHeadersSchema.optional(),
                triggerConditions: triggerConditionsSchema.optional(),
                enabled: z.boolean().default(true),
            })
        )
        .handler(async ({ context, input, errors }) => {
            // Validate website access if websiteId provided
            if (input.websiteId) {
                await authorizeWebsiteAccess(context, input.websiteId, "update");
            }

            // Validate that required channel URLs are provided
            if (
                input.notificationChannels.includes("slack") &&
                !input.slackWebhookUrl
            ) {
                throw errors.BAD_REQUEST({
                    message: "Slack webhook URL is required when Slack channel is enabled",
                });
            }
            if (
                input.notificationChannels.includes("discord") &&
                !input.discordWebhookUrl
            ) {
                throw errors.BAD_REQUEST({
                    message:
                        "Discord webhook URL is required when Discord channel is enabled",
                });
            }
            if (
                input.notificationChannels.includes("email") &&
                (!input.emailAddresses || input.emailAddresses.length === 0)
            ) {
                throw errors.BAD_REQUEST({
                    message: "Email addresses are required when Email channel is enabled",
                });
            }
            if (
                input.notificationChannels.includes("webhook") &&
                !input.webhookUrl
            ) {
                throw errors.BAD_REQUEST({
                    message: "Webhook URL is required when Webhook channel is enabled",
                });
            }

            const [newAlarm] = await db
                .insert(alarms)
                .values({
                    id: randomUUIDv7(),
                    userId: context.user.id,
                    organizationId: input.organizationId,
                    websiteId: input.websiteId,
                    name: input.name,
                    description: input.description,
                    enabled: input.enabled,
                    notificationChannels: input.notificationChannels,
                    slackWebhookUrl: input.slackWebhookUrl,
                    discordWebhookUrl: input.discordWebhookUrl,
                    emailAddresses: input.emailAddresses,
                    webhookUrl: input.webhookUrl,
                    webhookHeaders: input.webhookHeaders,
                    triggerType: input.triggerType,
                    triggerConditions: input.triggerConditions ?? {
                        consecutiveFailures: 3,
                        cooldownMinutes: 5,
                    },
                })
                .returning();

            logger.info({ alarmId: newAlarm.id, name: input.name }, "Alarm created");

            return newAlarm;
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).max(100).optional(),
                description: z.string().optional(),
                enabled: z.boolean().optional(),
                notificationChannels: z
                    .array(z.enum(["slack", "discord", "email", "webhook"]))
                    .optional(),
                slackWebhookUrl: z.string().url().optional(),
                discordWebhookUrl: z.string().url().optional(),
                emailAddresses: z.array(z.string().email()).optional(),
                webhookUrl: z.string().url().optional(),
                webhookHeaders: webhookHeadersSchema.optional(),
                triggerConditions: triggerConditionsSchema.optional(),
            })
        )
        .handler(async ({ context, input, errors }) => {
            const existingAlarm = await db.query.alarms.findFirst({
                where: eq(alarms.id, input.id),
            });

            if (!existingAlarm) {
                throw errors.NOT_FOUND({
                    message: "Alarm not found",
                    data: { resourceType: "alarm", resourceId: input.id },
                });
            }

            // Check authorization
            if (existingAlarm.userId !== context.user.id) {
                throw errors.FORBIDDEN({
                    message: "You do not have access to this alarm",
                });
            }

            const { id, ...updates } = input;
            const [updatedAlarm] = await db
                .update(alarms)
                .set({ ...updates, updatedAt: new Date() })
                .where(eq(alarms.id, id))
                .returning();

            logger.info({ alarmId: id }, "Alarm updated");

            return updatedAlarm;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .handler(async ({ context, input, errors }) => {
            const existingAlarm = await db.query.alarms.findFirst({
                where: eq(alarms.id, input.id),
            });

            if (!existingAlarm) {
                throw errors.NOT_FOUND({
                    message: "Alarm not found",
                    data: { resourceType: "alarm", resourceId: input.id },
                });
            }

            // Check authorization
            if (existingAlarm.userId !== context.user.id) {
                throw errors.FORBIDDEN({
                    message: "You do not have access to this alarm",
                });
            }

            await db.delete(alarms).where(eq(alarms.id, input.id));

            logger.info({ alarmId: input.id }, "Alarm deleted");

            return { success: true };
        }),

    test: protectedProcedure
        .input(z.object({ id: z.string() }))
        .handler(async ({ context, input, errors }) => {
            const alarm = await db.query.alarms.findFirst({
                where: eq(alarms.id, input.id),
            });

            if (!alarm) {
                throw errors.NOT_FOUND({
                    message: "Alarm not found",
                    data: { resourceType: "alarm", resourceId: input.id },
                });
            }

            // Check authorization
            if (alarm.userId !== context.user.id) {
                throw errors.FORBIDDEN({
                    message: "You do not have access to this alarm",
                });
            }

            const results: Record<string, boolean> = {};
            const testPayload = {
                title: "🔔 Test Notification",
                message: `This is a test notification from alarm: ${alarm.name}`,
                priority: "normal" as const,
                metadata: {
                    alarmId: alarm.id,
                    alarmName: alarm.name,
                    testTime: new Date().toISOString(),
                },
            };

            // Send to each configured channel
            for (const channel of alarm.notificationChannels) {
                try {
                    if (channel === "slack" && alarm.slackWebhookUrl) {
                        await sendSlackWebhook(alarm.slackWebhookUrl, testPayload);
                        results.slack = true;
                    } else if (channel === "discord" && alarm.discordWebhookUrl) {
                        await sendDiscordWebhook(alarm.discordWebhookUrl, testPayload);
                        results.discord = true;
                    } else if (
                        channel === "email" &&
                        alarm.emailAddresses &&
                        alarm.emailAddresses.length > 0
                    ) {
                        await sendEmail({
                            to: alarm.emailAddresses,
                            subject: testPayload.title,
                            text: testPayload.message,
                        });
                        results.email = true;
                    } else if (channel === "webhook" && alarm.webhookUrl) {
                        await sendWebhook(alarm.webhookUrl, testPayload, {
                            headers: (alarm.webhookHeaders as Record<string, string>) ?? {},
                        });
                        results.webhook = true;
                    }
                } catch (error) {
                    logger.error(
                        { channel, alarmId: alarm.id, error },
                        "Failed to send test notification"
                    );
                    results[channel] = false;
                }
            }

            logger.info({ alarmId: alarm.id, results }, "Test notification sent");

            return { success: true, results };
        }),

    // Get alarms assigned to a specific website (for uptime integration)
    listByWebsite: protectedProcedure
        .input(
            z.object({
                websiteId: z.string(),
                triggerType: z
                    .enum(["uptime", "traffic_spike", "error_rate", "goal", "custom"])
                    .optional(),
                enabledOnly: z.boolean().default(true),
            })
        )
        .handler(async ({ context, input }) => {
            await authorizeWebsiteAccess(context, input.websiteId, "read");

            const conditions = [eq(alarms.websiteId, input.websiteId)];

            if (input.triggerType) {
                conditions.push(eq(alarms.triggerType, input.triggerType));
            }

            if (input.enabledOnly) {
                conditions.push(eq(alarms.enabled, true));
            }

            return db.query.alarms.findMany({
                where: and(...conditions),
                orderBy: [desc(alarms.createdAt)],
            });
        }),

    // Get recent trigger history for an alarm
    getTriggerHistory: protectedProcedure
        .input(
            z.object({
                alarmId: z.string(),
                limit: z.number().min(1).max(100).default(20),
            })
        )
        .handler(async ({ context, input, errors }) => {
            const alarm = await db.query.alarms.findFirst({
                where: eq(alarms.id, input.alarmId),
            });

            if (!alarm) {
                throw errors.NOT_FOUND({
                    message: "Alarm not found",
                    data: { resourceType: "alarm", resourceId: input.alarmId },
                });
            }

            // Check authorization
            if (alarm.userId !== context.user.id) {
                throw errors.FORBIDDEN({
                    message: "You do not have access to this alarm",
                });
            }

            return db.query.alarmTriggerHistory.findMany({
                where: eq(alarmTriggerHistory.alarmId, input.alarmId),
                orderBy: [desc(alarmTriggerHistory.triggeredAt)],
                limit: input.limit,
            });
        }),
};
