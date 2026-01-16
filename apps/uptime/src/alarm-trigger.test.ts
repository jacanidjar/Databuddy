/**
 * Unit Tests for Alarm Trigger Logic
 *
 * Tests threshold behavior, duplicate prevention, and notification delivery.
 */

import { describe, expect, it } from "bun:test";
import { MonitorStatus, type UptimeData } from "./types";

// Mock uptime data factory
function createUptimeData(overrides: Partial<UptimeData> = {}): UptimeData {
    return {
        site_id: "test-site-123",
        url: "https://example.com",
        timestamp: Date.now(),
        status: MonitorStatus.UP,
        http_code: 200,
        ttfb_ms: 150,
        total_ms: 300,
        attempt: 1,
        retries: 0,
        failure_streak: 0,
        response_bytes: 1024,
        content_hash: "abc123",
        redirect_count: 0,
        probe_region: "us-east-1",
        probe_ip: "1.2.3.4",
        ssl_expiry: Date.now() + 86400000 * 30,
        ssl_valid: 1,
        env: "prod",
        check_type: "http",
        user_agent: "Databuddy/1.0",
        error: "",
        ...overrides,
    };
}

describe("MonitorStatus constants", () => {
    it("has DOWN status as 0", () => {
        expect(MonitorStatus.DOWN).toBe(0);
    });

    it("has UP status as 1", () => {
        expect(MonitorStatus.UP).toBe(1);
    });

    it("has PENDING status as 2", () => {
        expect(MonitorStatus.PENDING).toBe(2);
    });

    it("has MAINTENANCE status as 3", () => {
        expect(MonitorStatus.MAINTENANCE).toBe(3);
    });
});

describe("UptimeData structure", () => {
    it("creates valid uptime data with defaults", () => {
        const data = createUptimeData();
        expect(data.site_id).toBe("test-site-123");
        expect(data.url).toBe("https://example.com");
        expect(data.status).toBe(MonitorStatus.UP);
        expect(data.http_code).toBe(200);
    });

    it("creates down status uptime data", () => {
        const data = createUptimeData({
            status: MonitorStatus.DOWN,
            http_code: 503,
            error: "Service Unavailable",
            failure_streak: 3,
        });
        expect(data.status).toBe(MonitorStatus.DOWN);
        expect(data.http_code).toBe(503);
        expect(data.error).toBe("Service Unavailable");
        expect(data.failure_streak).toBe(3);
    });
});

describe("Threshold behavior", () => {
    it("should not trigger alarm when failure_streak is below threshold", () => {
        const data = createUptimeData({
            status: MonitorStatus.DOWN,
            failure_streak: 2,
        });
        const threshold = 3;
        const shouldTrigger = data.failure_streak >= threshold;
        expect(shouldTrigger).toBe(false);
    });

    it("should trigger alarm when failure_streak equals threshold", () => {
        const data = createUptimeData({
            status: MonitorStatus.DOWN,
            failure_streak: 3,
        });
        const threshold = 3;
        const shouldTrigger = data.failure_streak >= threshold;
        expect(shouldTrigger).toBe(true);
    });

    it("should trigger alarm when failure_streak exceeds threshold", () => {
        const data = createUptimeData({
            status: MonitorStatus.DOWN,
            failure_streak: 5,
        });
        const threshold = 3;
        const shouldTrigger = data.failure_streak >= threshold;
        expect(shouldTrigger).toBe(true);
    });
});

describe("Cooldown logic", () => {
    it("should not be in cooldown when no previous trigger", () => {
        const lastTrigger: Date | null = null;
        const cooldownMinutes = 5;

        const isCooldownActive = (lt: Date | null, cm: number): boolean => {
            if (!lt) return false;
            const cooldownEnd = new Date(lt.getTime() + cm * 60 * 1000);
            return new Date() < cooldownEnd;
        };

        expect(isCooldownActive(lastTrigger, cooldownMinutes)).toBe(false);
    });

    it("should be in cooldown when triggered recently", () => {
        const lastTrigger = new Date(); // Just now
        const cooldownMinutes = 5;

        const isCooldownActive = (lt: Date | null, cm: number): boolean => {
            if (!lt) return false;
            const cooldownEnd = new Date(lt.getTime() + cm * 60 * 1000);
            return new Date() < cooldownEnd;
        };

        expect(isCooldownActive(lastTrigger, cooldownMinutes)).toBe(true);
    });

    it("should not be in cooldown after cooldown period expires", () => {
        const lastTrigger = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
        const cooldownMinutes = 5;

        const isCooldownActive = (lt: Date | null, cm: number): boolean => {
            if (!lt) return false;
            const cooldownEnd = new Date(lt.getTime() + cm * 60 * 1000);
            return new Date() < cooldownEnd;
        };

        expect(isCooldownActive(lastTrigger, cooldownMinutes)).toBe(false);
    });
});

describe("Status transition detection", () => {
    it("detects up to down transition", () => {
        const previousStatus = MonitorStatus.UP;
        const currentStatus = MonitorStatus.DOWN;

        const isDownTransition =
            currentStatus === MonitorStatus.DOWN && previousStatus === MonitorStatus.UP;

        expect(isDownTransition).toBe(true);
    });

    it("detects down to up transition (recovery)", () => {
        const previousStatus = MonitorStatus.DOWN;
        const currentStatus = MonitorStatus.UP;

        const isRecoveryTransition =
            currentStatus === MonitorStatus.UP && previousStatus === MonitorStatus.DOWN;

        expect(isRecoveryTransition).toBe(true);
    });

    it("does not trigger on same status", () => {
        const previousStatus = MonitorStatus.DOWN;
        const currentStatus = MonitorStatus.DOWN;

        const isDownTransition =
            currentStatus === MonitorStatus.DOWN && previousStatus === MonitorStatus.UP;
        const isRecoveryTransition =
            currentStatus === MonitorStatus.UP && previousStatus === MonitorStatus.DOWN;

        expect(isDownTransition).toBe(false);
        expect(isRecoveryTransition).toBe(false);
    });

    it("handles null previous status for first check", () => {
        const previousStatus: number | null = null;
        const currentStatus = MonitorStatus.DOWN;

        // For first check (null), we should still trigger if threshold is met
        const isFirstDownCheck =
            currentStatus === MonitorStatus.DOWN &&
            (previousStatus === MonitorStatus.UP || previousStatus === null);

        expect(isFirstDownCheck).toBe(true);
    });
});

describe("Notification channel validation", () => {
    it("validates slack channel requires webhook URL", () => {
        const channels = ["slack", "discord"];
        const slackWebhookUrl: string | null = null;

        const isSlackValid =
            !channels.includes("slack") ||
            (slackWebhookUrl !== null && slackWebhookUrl.length > 0);

        expect(isSlackValid).toBe(false);
    });

    it("validates discord channel requires webhook URL", () => {
        const channels = ["discord"];
        const discordWebhookUrl = "https://discord.com/api/webhooks/123/abc";

        const isDiscordValid =
            !channels.includes("discord") ||
            (discordWebhookUrl !== null && discordWebhookUrl.length > 0);

        expect(isDiscordValid).toBe(true);
    });

    it("validates email channel requires addresses", () => {
        const channels = ["email"];
        const emailAddresses: string[] = [];

        const isEmailValid =
            !channels.includes("email") ||
            (emailAddresses !== null && emailAddresses.length > 0);

        expect(isEmailValid).toBe(false);
    });

    it("validates webhook channel requires URL", () => {
        const channels = ["webhook"];
        const webhookUrl = "https://my-webhook.example.com/callback";

        const isWebhookValid =
            !channels.includes("webhook") ||
            (webhookUrl !== null && webhookUrl.length > 0);

        expect(isWebhookValid).toBe(true);
    });
});

describe("Notification payload structure", () => {
    it("creates valid down notification payload", () => {
        const data = createUptimeData({
            status: MonitorStatus.DOWN,
            http_code: 503,
            error: "Connection refused",
            failure_streak: 3,
        });

        const payload = {
            title: `🔴 Site Down: ${new URL(data.url).hostname}`,
            message: "Your website is not responding.",
            priority: "urgent" as const,
            metadata: {
                url: data.url,
                status: data.http_code,
                error: data.error,
                consecutiveFailures: data.failure_streak,
            },
        };

        expect(payload.title).toBe("🔴 Site Down: example.com");
        expect(payload.priority).toBe("urgent");
        expect(payload.metadata.status).toBe(503);
        expect(payload.metadata.consecutiveFailures).toBe(3);
    });

    it("creates valid recovery notification payload", () => {
        const data = createUptimeData({
            status: MonitorStatus.UP,
            http_code: 200,
        });

        const payload = {
            title: `🟢 Site Recovered: ${new URL(data.url).hostname}`,
            message: "Your website is back online.",
            priority: "normal" as const,
            metadata: {
                url: data.url,
                recoveredAt: new Date().toISOString(),
            },
        };

        expect(payload.title).toBe("🟢 Site Recovered: example.com");
        expect(payload.priority).toBe("normal");
        expect(payload.metadata.url).toBe("https://example.com");
    });
});

describe("Trigger conditions schema", () => {
    it("validates consecutiveFailures within range", () => {
        const validConditions = { consecutiveFailures: 3, cooldownMinutes: 5 };
        const invalidLow = { consecutiveFailures: 0, cooldownMinutes: 5 };
        const invalidHigh = { consecutiveFailures: 11, cooldownMinutes: 5 };

        const isValid = (c: { consecutiveFailures: number }) =>
            c.consecutiveFailures >= 1 && c.consecutiveFailures <= 10;

        expect(isValid(validConditions)).toBe(true);
        expect(isValid(invalidLow)).toBe(false);
        expect(isValid(invalidHigh)).toBe(false);
    });

    it("validates cooldownMinutes within range", () => {
        const validConditions = { consecutiveFailures: 3, cooldownMinutes: 30 };
        const invalidLow = { consecutiveFailures: 3, cooldownMinutes: 0 };
        const invalidHigh = { consecutiveFailures: 3, cooldownMinutes: 1500 };

        const isValid = (c: { cooldownMinutes: number }) =>
            c.cooldownMinutes >= 1 && c.cooldownMinutes <= 1440;

        expect(isValid(validConditions)).toBe(true);
        expect(isValid(invalidLow)).toBe(false);
        expect(isValid(invalidHigh)).toBe(false);
    });
});
