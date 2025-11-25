import type { CustomerFeature } from "autumn-js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export interface FeatureUsage {
    id: string;
    name: string;
    used: number;
    limit: number;
    balance: number;
    unlimited: boolean;
    interval: string | null;
    hasExtraCredits: boolean;
    totalAvailable: number;
    includedUsage: number;
    resetAt: number | null;
    resetDateFormatted: string | null;
    resetRelative: string | null;
}

export function calculateFeatureUsage(feature: CustomerFeature): FeatureUsage {
    const includedUsage = feature.included_usage ?? 0;
    const balance = feature.balance ?? 0;
    const reportedUsage = feature.usage ?? 0;

    const isUnlimited =
        feature.unlimited ||
        !Number.isFinite(balance) ||
        balance === Number.POSITIVE_INFINITY ||
        balance === Number.NEGATIVE_INFINITY;

    const hasExtraCredits = !isUnlimited && balance > includedUsage;
    const totalAvailable = isUnlimited ? Number.POSITIVE_INFINITY : balance;

    let actualUsed: number;
    if (isUnlimited) {
        actualUsed = 0;
    } else if (reportedUsage > 0) {
        actualUsed = reportedUsage;
    } else if (reportedUsage < 0) {
        actualUsed = Math.max(
            0,
            includedUsage - balance + Math.abs(reportedUsage)
        );
    } else {
        actualUsed = Math.max(0, includedUsage - balance);
    }

    const displayLimit = hasExtraCredits ? balance : includedUsage;
    const resetAt = feature.next_reset_at ?? null;

    return {
        id: feature.id,
        name: feature.name,
        used: actualUsed,
        limit: isUnlimited ? Number.POSITIVE_INFINITY : displayLimit,
        balance,
        unlimited: isUnlimited,
        interval: feature.interval ?? null,
        hasExtraCredits,
        totalAvailable,
        includedUsage,
        resetAt,
        resetDateFormatted: resetAt ? dayjs(resetAt).format("MMM D, YYYY") : null,
        resetRelative: resetAt ? dayjs(resetAt).fromNow() : null,
    };
}

export function calculateAllFeatureUsage(
    features: Record<string, CustomerFeature> | undefined
): FeatureUsage[] {
    if (!features) return [];
    return Object.values(features).map(calculateFeatureUsage);
}

export function formatCompactNumber(num: number): string {
    if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}T`;
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 10_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toLocaleString();
}

const INTERVAL_LABELS: Record<string, string> = {
    day: "daily",
    month: "monthly",
    year: "yearly",
    lifetime: "never",
};

export function getResetText(feature: FeatureUsage): string {
    if (feature.interval === "lifetime") return "Never expires";
    if (!feature.resetAt) return "No reset scheduled";

    const intervalLabel = feature.interval ? INTERVAL_LABELS[feature.interval] : null;
    const relativeText = feature.resetRelative;

    if (intervalLabel && relativeText) {
        return `Resets ${intervalLabel} · ${relativeText}`;
    }
    if (relativeText) {
        return `Resets ${relativeText}`;
    }
    if (feature.resetDateFormatted) {
        return `Resets ${feature.resetDateFormatted}`;
    }
    return "No reset scheduled";
}

