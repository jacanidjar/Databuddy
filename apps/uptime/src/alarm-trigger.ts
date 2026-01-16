/**
 * Alarm Trigger Service for Uptime Monitoring
 *
 * This module handles triggering alarms when uptime status changes:
 * - Site goes down (consecutive failures threshold met)
 * - Site comes back up (recovery)
 *
 * Uses @databuddy/notifications to send to configured channels.
 */

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    alarms,
    alarmTriggerHistory,
    uptimeMonitorState,
    and,
    db,
    desc,
    eq,
} from "@databuddy/db";
import {
    sendDiscordWebhook,
    sendSlackWebhook,
    sendWebhook,
} from "@databuddy/notifications";
import { randomUUIDv7 } from "bun";
import { captureError } from "./lib/tracing";
import { MonitorStatus, type UptimeData } from "./types";

dayjs.extend(relativeTime);

// Trigger conditions interface
interface TriggerConditions {
    consecutiveFailures: number;
    cooldownMinutes: number;
}

// Alarm with typed trigger conditions
interface AlarmConfig {
    id: string;
    name: string;
    enabled: boolean;
    notificationChannels: string[];
    slackWebhookUrl: string | null;
    discordWebhookUrl: string | null;
    emailAddresses: string[] | null;
    webhookUrl: string | null;
    webhookHeaders: Record<string, string> | null;
    triggerConditions: TriggerConditions | null;
}

// Notification results tracking
interface NotificationResults {
    slack?: boolean;
    discord?: boolean;
    email?: boolean;
    webhook?: boolean;
}

/**
 * Get alarms configured for a website with uptime trigger type
 */
async function getWebsiteAlarms(websiteId: string): Promise<AlarmConfig[]> {
    const results = await db.query.alarms.findMany({
        where: and(
            eq(alarms.websiteId, websiteId),
            eq(alarms.triggerType, "uptime"),
            eq(alarms.enabled, true)
        ),
    });

    return results.map((alarm) => ({
        id: alarm.id,
        name: alarm.name,
        enabled: alarm.enabled,
        notificationChannels: alarm.notificationChannels,
        slackWebhookUrl: alarm.slackWebhookUrl,
        discordWebhookUrl: alarm.discordWebhookUrl,
        emailAddresses: alarm.emailAddresses,
        webhookUrl: alarm.webhookUrl,
        webhookHeaders: alarm.webhookHeaders as Record<string, string> | null,
        triggerConditions: alarm.triggerConditions as TriggerConditions | null,
    }));
}

/**
 * Get the last trigger for an alarm to check cooldown
 */
async function getLastTrigger(
    alarmId: string,
    triggerEvent: string
): Promise<Date | null> {
    const lastTrigger = await db.query.alarmTriggerHistory.findFirst({
        where: and(
            eq(alarmTriggerHistory.alarmId, alarmId),
            eq(alarmTriggerHistory.triggerEvent, triggerEvent)
        ),
        orderBy: [desc(alarmTriggerHistory.triggeredAt)],
    });

    return lastTrigger?.triggeredAt ?? null;
}

/**
 * Record an alarm trigger in history
 */
async function recordTrigger(
    alarmId: string,
    websiteId: string,
    triggerEvent: string,
    notificationsSent: NotificationResults,
    metadata: Record<string, unknown>
): Promise<void> {
    await db.insert(alarmTriggerHistory).values({
        id: randomUUIDv7(),
        alarmId,
        websiteId,
        triggerEvent,
        notificationsSent,
        metadata,
    });
}

/**
 * Check if cooldown period has passed
 */
function isCooldownActive(
    lastTrigger: Date | null,
    cooldownMinutes: number
): boolean {
    if (!lastTrigger) return false;

    const cooldownEnd = dayjs(lastTrigger).add(cooldownMinutes, "minute");
    return dayjs().isBefore(cooldownEnd);
}

/**
 * Send down notification to all configured channels
 */
async function sendDownNotification(
    alarm: AlarmConfig,
    uptimeData: UptimeData,
    consecutiveFailures: number
): Promise<NotificationResults> {
    const results: NotificationResults = {};

    const payload = {
        title: `🔴 Site Down: ${new URL(uptimeData.url).hostname}`,
        message: "Your website is not responding.",
        priority: "urgent" as const,
        metadata: {
            url: uptimeData.url,
            status: uptimeData.http_code,
            error: uptimeData.error || "Connection failed",
            downSince: dayjs(uptimeData.timestamp).fromNow(),
            consecutiveFailures,
            responseTime: `${uptimeData.total_ms}ms`,
            probeRegion: uptimeData.probe_region,
            dashboardLink: `https://app.databuddy.com/uptime/${uptimeData.site_id}`,
        },
    };

    for (const channel of alarm.notificationChannels) {
        try {
            if (channel === "slack" && alarm.slackWebhookUrl) {
                await sendSlackWebhook(alarm.slackWebhookUrl, payload);
                results.slack = true;
            } else if (channel === "discord" && alarm.discordWebhookUrl) {
                await sendDiscordWebhook(alarm.discordWebhookUrl, payload);
                results.discord = true;
            } else if (channel === "webhook" && alarm.webhookUrl) {
                await sendWebhook(alarm.webhookUrl, payload, {
                    headers: alarm.webhookHeaders ?? {},
                });
                results.webhook = true;
            }
            // Note: Email requires integration with @databuddy/email package
        } catch (error) {
            captureError(error, {
                type: "alarm_notification_failed",
                channel,
                alarmId: alarm.id,
            });
            results[channel as keyof NotificationResults] = false;
        }
    }

    return results;
}

/**
 * Send recovery notification to all configured channels
 */
async function sendRecoveryNotification(
    alarm: AlarmConfig,
    uptimeData: UptimeData,
    downSince: Date
): Promise<NotificationResults> {
    const results: NotificationResults = {};

    const downtimeDuration = dayjs().diff(dayjs(downSince), "minute");
    const durationText =
        downtimeDuration < 60
            ? `${downtimeDuration} minutes`
            : `${Math.floor(downtimeDuration / 60)} hours ${downtimeDuration % 60} minutes`;

    const payload = {
        title: `🟢 Site Recovered: ${new URL(uptimeData.url).hostname}`,
        message: "Your website is back online.",
        priority: "normal" as const,
        metadata: {
            url: uptimeData.url,
            downtimeDuration: durationText,
            recoveredAt: dayjs().toISOString(),
            responseTime: `${uptimeData.total_ms}ms`,
            httpStatus: uptimeData.http_code,
            dashboardLink: `https://app.databuddy.com/uptime/${uptimeData.site_id}`,
        },
    };

    for (const channel of alarm.notificationChannels) {
        try {
            if (channel === "slack" && alarm.slackWebhookUrl) {
                await sendSlackWebhook(alarm.slackWebhookUrl, payload);
                results.slack = true;
            } else if (channel === "discord" && alarm.discordWebhookUrl) {
                await sendDiscordWebhook(alarm.discordWebhookUrl, payload);
                results.discord = true;
            } else if (channel === "webhook" && alarm.webhookUrl) {
                await sendWebhook(alarm.webhookUrl, payload, {
                    headers: alarm.webhookHeaders ?? {},
                });
                results.webhook = true;
            }
        } catch (error) {
            captureError(error, {
                type: "alarm_notification_failed",
                channel,
                alarmId: alarm.id,
            });
            results[channel as keyof NotificationResults] = false;
        }
    }

    return results;
}

/**
 * Main function to check and trigger alarms for a website
 *
 * @param websiteId - The website ID to check alarms for
 * @param uptimeData - The current uptime check result
 * @param consecutiveFailures - Number of consecutive failures (for threshold)
 * @param previousStatus - The previous status (UP/DOWN) to detect transitions
 */
export async function checkAndTriggerAlarms(
    websiteId: string,
    uptimeData: UptimeData,
    consecutiveFailures: number,
    previousStatus: number | null
): Promise<void> {
    try {
        // Get all enabled uptime alarms for this website
        const websiteAlarms = await getWebsiteAlarms(websiteId);

        if (websiteAlarms.length === 0) {
            return; // No alarms configured
        }

        const currentStatus = uptimeData.status;
        const isDown = currentStatus === MonitorStatus.DOWN;
        const wasDown = previousStatus === MonitorStatus.DOWN;
        const isUp = currentStatus === MonitorStatus.UP;
        const wasUp = previousStatus === MonitorStatus.UP;

        // Process each alarm
        for (const alarm of websiteAlarms) {
            const conditions = alarm.triggerConditions ?? {
                consecutiveFailures: 3,
                cooldownMinutes: 5,
            };

            // Check for DOWN event (was up, now down, threshold met)
            if (isDown && (wasUp || previousStatus === null)) {
                // Check if consecutive failures threshold is met
                if (consecutiveFailures >= conditions.consecutiveFailures) {
                    // Check cooldown to prevent spam
                    const lastDownTrigger = await getLastTrigger(alarm.id, "down");
                    if (isCooldownActive(lastDownTrigger, conditions.cooldownMinutes)) {
                        continue; // Skip, cooldown active
                    }

                    // Send notification
                    const results = await sendDownNotification(
                        alarm,
                        uptimeData,
                        consecutiveFailures
                    );

                    // Record trigger
                    await recordTrigger(alarm.id, websiteId, "down", results, {
                        httpCode: uptimeData.http_code,
                        responseTime: uptimeData.total_ms,
                        consecutiveFailures,
                        error: uptimeData.error,
                    });
                }
            }

            // Check for UP event (was down, now up - recovery)
            if (isUp && wasDown) {
                // Get the last down trigger to calculate downtime
                const lastDownTrigger = await getLastTrigger(alarm.id, "down");
                const downSince = lastDownTrigger ?? new Date();

                // Send recovery notification
                const results = await sendRecoveryNotification(
                    alarm,
                    uptimeData,
                    downSince
                );

                // Record trigger
                await recordTrigger(alarm.id, websiteId, "up", results, {
                    httpCode: uptimeData.http_code,
                    responseTime: uptimeData.total_ms,
                    downSince: downSince.toISOString(),
                });
            }
        }
    } catch (error) {
        // Don't crash uptime service on alarm failures
        captureError(error, {
            type: "alarm_trigger_error",
            websiteId,
        });
    }
}

/**
 * Get the current consecutive failure count for a website
 * This could be stored in Redis or calculated from recent uptime checks
 */
export async function getConsecutiveFailures(
    websiteId: string
): Promise<number> {
    const state = await db.query.uptimeMonitorState.findFirst({
        where: eq(uptimeMonitorState.id, websiteId),
    });
    return state?.consecutiveFailures ?? 0;
}

/**
 * Get the previous status for a website
 * Used to detect status transitions (up->down, down->up)
 */
export async function getPreviousStatus(
    websiteId: string
): Promise<number | null> {
    const state = await db.query.uptimeMonitorState.findFirst({
        where: eq(uptimeMonitorState.id, websiteId),
    });
    return state?.status ?? null;
}
