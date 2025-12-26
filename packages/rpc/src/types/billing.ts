import type {
	AiCapabilityId,
	FeatureLimit,
	GatedFeatureId,
	PlanId,
} from "@databuddy/shared/types/features";
import {
	getMinimumPlanForAiCapability,
	getNextPlanForFeature,
	getPlanCapabilities,
	getPlanFeatureLimit,
	getRemainingUsage,
	isFeatureAvailable,
	isPlanAiCapabilityEnabled,
	isPlanFeatureEnabled,
	isWithinLimit,
	PLAN_HIERARCHY,
	PLAN_IDS,
} from "@databuddy/shared/types/features";
import { ORPCError } from "@orpc/server";

/**
 * Billing context included in the RPC context
 * This is automatically populated when a user is authenticated
 */
export interface BillingContext {
	/** The customer ID for billing (user ID or org owner ID) */
	customerId: string;
	/** Whether the billing is based on an organization */
	isOrganization: boolean;
	/** Whether the current user can upgrade the plan */
	canUserUpgrade: boolean;
	/** The current plan ID (e.g., 'free', 'hobby', 'pro', 'scale') */
	planId: string;
}

/**
 * Helper to check if a user has a specific plan or higher
 *
 * @example
 * ```ts
 * if (hasPlan(context.billing?.planId, PLAN_IDS.PRO)) {
 *   // User has pro or higher
 * }
 * ```
 */
export function hasPlan(
	currentPlan: string | undefined,
	requiredPlan: PlanId
): boolean {
	if (!currentPlan) {
		return requiredPlan === PLAN_IDS.FREE;
	}

	const currentIndex = PLAN_HIERARCHY.indexOf(currentPlan as PlanId);
	const requiredIndex = PLAN_HIERARCHY.indexOf(requiredPlan);

	if (currentIndex === -1) {
		return false;
	}

	return currentIndex >= requiredIndex;
}

/**
 * Helper to check if a user is on the free plan
 *
 * @example
 * ```ts
 * if (isFreePlan(context.billing?.planId)) {
 *   throw new ORPCError("FORBIDDEN", { message: "Upgrade required" });
 * }
 * ```
 */
export function isFreePlan(planId: string | undefined): boolean {
	return !planId || planId.toLowerCase() === PLAN_IDS.FREE;
}

/**
 * Check if a feature is enabled for the user's plan
 *
 * @example
 * ```ts
 * if (!canAccessFeature(context.billing?.planId, GATED_FEATURES.AI_AGENT)) {
 *   throw new ORPCError("FORBIDDEN", { message: "AI Agent requires Pro plan" });
 * }
 * ```
 */
export function canAccessFeature(
	planId: string | undefined,
	feature: GatedFeatureId
): boolean {
	return isPlanFeatureEnabled(planId ?? null, feature);
}

/**
 * Check if an AI capability is enabled for the user's plan
 *
 * @example
 * ```ts
 * if (!canAccessAiCapability(context.billing?.planId, AI_CAPABILITIES.AUTO_INSIGHTS)) {
 *   throw new ORPCError("FORBIDDEN", { message: "Auto Insights requires Pro plan" });
 * }
 * ```
 */
export function canAccessAiCapability(
	planId: string | undefined,
	capability: AiCapabilityId
): boolean {
	return isPlanAiCapabilityEnabled(planId ?? null, capability);
}

/**
 * Get the feature limit for the user's plan
 *
 * @example
 * ```ts
 * const limit = getFeatureLimit(context.billing?.planId, GATED_FEATURES.FUNNELS);
 * if (limit === false) {
 *   throw new ORPCError("FORBIDDEN", { message: "Funnels not available on your plan" });
 * }
 * ```
 */
export function getFeatureLimit(
	planId: string | undefined,
	feature: GatedFeatureId
): FeatureLimit {
	return getPlanFeatureLimit(planId ?? null, feature);
}

/**
 * Check if current usage is within the plan's limit for a feature
 *
 * @example
 * ```ts
 * const funnelCount = await getFunnelCount(websiteId);
 * if (!isUsageWithinLimit(context.billing?.planId, GATED_FEATURES.FUNNELS, funnelCount)) {
 *   const nextPlan = getNextPlanForFeature(context.billing?.planId, GATED_FEATURES.FUNNELS);
 *   throw new ORPCError("FORBIDDEN", {
 *     message: `Funnel limit reached. Upgrade to ${nextPlan} for more.`
 *   });
 * }
 * ```
 */
export function isUsageWithinLimit(
	planId: string | undefined,
	feature: GatedFeatureId,
	currentUsage: number
): boolean {
	return isWithinLimit(planId ?? null, feature, currentUsage);
}

/**
 * Get how much usage is remaining for a feature
 *
 * @example
 * ```ts
 * const remaining = getUsageRemaining(context.billing?.planId, GATED_FEATURES.GOALS, currentGoalCount);
 * if (remaining === 0) {
 *   throw new ORPCError("FORBIDDEN", { message: "Goal limit reached" });
 * }
 * ```
 */
export function getUsageRemaining(
	planId: string | undefined,
	feature: GatedFeatureId,
	currentUsage: number
): number | "unlimited" {
	return getRemainingUsage(planId ?? null, feature, currentUsage);
}

/**
 * Throws an error if the feature is not available on the user's plan
 *
 * @example
 * ```ts
 * requireFeature(context.billing?.planId, GATED_FEATURES.AI_AGENT);
 * // Throws if user doesn't have access
 * ```
 */
export function requireFeature(
	planId: string | undefined,
	feature: GatedFeatureId
): void {
	if (!isFeatureAvailable(planId ?? null, feature)) {
		const nextPlan = getNextPlanForFeature(planId ?? null, feature);
		throw new ORPCError("FORBIDDEN", {
			message: nextPlan
				? `This feature requires ${nextPlan} plan or higher`
				: "This feature is not available on your plan",
		});
	}
}

/**
 * Throws an error if current usage exceeds the plan's limit
 *
 * @example
 * ```ts
 * const funnelCount = await db.query.funnels.findMany({ where: eq(funnels.websiteId, websiteId) }).length;
 * requireUsageWithinLimit(context.billing?.planId, GATED_FEATURES.FUNNELS, funnelCount);
 * ```
 */
export function requireUsageWithinLimit(
	planId: string | undefined,
	feature: GatedFeatureId,
	currentUsage: number
): void {
	if (!isWithinLimit(planId ?? null, feature, currentUsage)) {
		const limit = getPlanFeatureLimit(planId ?? null, feature);
		const nextPlan = getNextPlanForFeature(planId ?? null, feature);

		if (limit === false) {
			throw new ORPCError("FORBIDDEN", {
				message: nextPlan
					? `This feature requires ${nextPlan} plan or higher`
					: "This feature is not available on your plan",
			});
		}

		throw new ORPCError("FORBIDDEN", {
			message: nextPlan
				? `Limit of ${limit} reached. Upgrade to ${nextPlan} for more.`
				: `Limit of ${limit} reached`,
		});
	}
}

/**
 * Get all capabilities for the user's plan
 *
 * @example
 * ```ts
 * const capabilities = getUserCapabilities(context.billing?.planId);
 * console.log(capabilities.features, capabilities.limits, capabilities.ai);
 * ```
 */
export function getUserCapabilities(planId: string | undefined) {
	return getPlanCapabilities(planId ?? null);
}

/**
 * Throws an error if the AI capability is not available
 *
 * @example
 * ```ts
 * requireAiCapability(context.billing?.planId, AI_CAPABILITIES.AUTO_INSIGHTS);
 * ```
 */
export function requireAiCapability(
	planId: string | undefined,
	capability: AiCapabilityId
): void {
	if (!isPlanAiCapabilityEnabled(planId ?? null, capability)) {
		const minPlan = getMinimumPlanForAiCapability(capability);
		throw new ORPCError("FORBIDDEN", {
			message: minPlan
				? `This AI capability is not available on your plan; upgrade to ${minPlan} to access it`
				: "This AI capability is not available on your plan",
		});
	}
}
