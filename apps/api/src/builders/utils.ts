/**
 * Analytics SQL Builder Utilities
 *
 * Shared utilities and helpers for building analytics SQL queries.
 */

import { createSqlBuilder } from "../clickhouse/client";
import { parseReferrer } from "../utils/referrer";
import { anonymizeIp } from "../utils/ip-geo";

// Common helper functions for SQL queries
export function buildWhereClauses(
	websiteId: string,
	startDate: string,
	endDate: string,
	additionalFilters: Record<string, string> = {},
) {
	const baseFilters = {
		client_filter: `client_id = '${websiteId}'`,
		date_filter: `time >= parseDateTimeBestEffort('${startDate}') AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')`,
	};

	return { ...baseFilters, ...additionalFilters };
}

export function buildCommonSelect(metrics: Record<string, string>) {
	return metrics;
}

export function buildCommonGroupBy(fields: Record<string, string>) {
	return fields;
}

export function buildCommonOrderBy(fields: Record<string, string>) {
	return fields;
}

// Common utility functions for analytics data processing
export function parseReferrers(
	referrers: Array<{ referrer: string; visitors: number; pageviews: number }>,
	filterInternal = false,
	isInternalReferrerFn?: (referrer: string, websiteDomain?: string) => boolean,
	websiteDomain?: string,
) {
	// First map all referrers with parsed data
	const parsedReferrers = referrers.map((ref) => {
		// Pass websiteDomain to parseReferrer
		const parsed = parseReferrer(ref.referrer, websiteDomain);
		return {
			...ref,
			type: parsed.type,
			name: parsed.name,
			domain: parsed.domain,
		};
	});

	// Then filter out internal referrers if requested
	if (filterInternal && isInternalReferrerFn) {
		return parsedReferrers.filter((ref) => {
			// Keep direct traffic and external referrers
			// Also pass websiteDomain to isInternalReferrerFn
			return (
				ref.type === "direct" ||
				!isInternalReferrerFn(ref.referrer, websiteDomain)
			);
		});
	}

	return parsedReferrers;
}

// Helper function to anonymize IP addresses in bulk
export function anonymizeIpAddresses(ipAddresses: string[]) {
	return ipAddresses.map((ip) => anonymizeIp(ip));
}

// Function to calculate weighted bounce rate
export function calculateWeightedBounceRate(
	oldSessions: number,
	oldBounceRate: number,
	newSessions: number,
	newBounceRate: number,
) {
	const totalSessions = oldSessions + newSessions;
	if (totalSessions === 0) return 0;

	return (
		(oldSessions * oldBounceRate + newSessions * newBounceRate) / totalSessions
	);
}

// Re-export SQL builder for convenience
export { createSqlBuilder };
