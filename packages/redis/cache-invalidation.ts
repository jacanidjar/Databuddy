import { getRedisCache } from "./redis";

/**
 * Stringifies arguments in the same way as cacheable function
 * to generate consistent cache keys.
 */
function stringify(obj: unknown): string {
	if (obj === null) {
		return "null";
	}
	if (obj === undefined) {
		return "undefined";
	}
	if (typeof obj === "boolean") {
		return obj ? "true" : "false";
	}
	if (typeof obj === "number" || typeof obj === "string") {
		return String(obj);
	}
	if (typeof obj === "function") {
		return obj.toString();
	}
	if (Array.isArray(obj)) {
		return `[${obj.map(stringify).join(",")}]`;
	}
	if (typeof obj === "object") {
		return Object.entries(obj)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([k, v]) => `${k}:${stringify(v)}`)
			.join(":");
	}
	return String(obj);
}

/**
 * Generates a cache key for a cacheable function with the given prefix and arguments.
 * This matches the format used by the cacheable wrapper.
 */
export function getCacheableKey(prefix: string, ...args: unknown[]): string {
	return `cacheable:${prefix}:${stringify(args)}`;
}

/**
 * Invalidates a specific cacheable cache entry by prefix and exact arguments.
 */
export async function invalidateCacheableKey(
	prefix: string,
	...args: unknown[]
): Promise<void> {
	const redis = getRedisCache();
	const key = getCacheableKey(prefix, ...args);
	await redis.del(key);
}

/**
 * Invalidates all cacheable cache entries matching a pattern.
 * Uses Redis SCAN to safely iterate through matching keys.
 *
 * @param pattern - Redis pattern (use * for wildcards, e.g., "cacheable:flag:*")
 * @returns Number of keys deleted
 */
export async function invalidateCacheablePattern(
	pattern: string
): Promise<number> {
	const redis = getRedisCache();
	let deletedCount = 0;

	// Use SCAN with MATCH to find keys
	let cursor = "0";
	do {
		// SCAN returns [cursor, keys[]] in ioredis
		const [nextCursor, keys] = (await redis.scan(
			cursor,
			"MATCH",
			pattern,
			"COUNT",
			100
		)) as [string, string[]];
		cursor = nextCursor;

		if (keys.length > 0) {
			await redis.del(...keys);
			deletedCount += keys.length;
		}
	} while (cursor !== "0");

	return deletedCount;
}

/**
 * Invalidates all variations of a cacheable cache entry.
 * Useful when you want to invalidate a cache entry but don't know all possible argument values.
 *
 * @param prefix - The cache prefix (e.g., "flag", "flags-client")
 * @param knownArgs - Known arguments to include in the pattern
 * @returns Number of keys deleted
 *
 * @example
 * // Invalidate all flag caches for a specific key and clientId, regardless of environment
 * await invalidateCacheableWithArgs("flag", ["my-flag-key", "client-123"]);
 */
export async function invalidateCacheableWithArgs(
	prefix: string,
	knownArgs: unknown[]
): Promise<number> {
	const redis = getRedisCache();
	let deletedCount = 0;

	// Generate patterns for exact match and with trailing args
	const patterns: string[] = [];

	// Exact match: cacheable:prefix:[arg1,arg2]
	patterns.push(`cacheable:${prefix}:${stringify(knownArgs)}`);

	// With undefined trailing arg: cacheable:prefix:[arg1,arg2,undefined]
	patterns.push(`cacheable:${prefix}:${stringify([...knownArgs, undefined])}`);

	// With any trailing args: cacheable:prefix:[arg1,arg2,*
	patterns.push(`cacheable:${prefix}:${stringify(knownArgs).slice(0, -1)}*`);

	// Delete exact matches directly
	const exactKeys = patterns.slice(0, 2);
	for (const key of exactKeys) {
		const result = await redis.del(key);
		deletedCount += result;
	}

	// Use SCAN for wildcard pattern
	const wildcardPattern = patterns[2];
	let cursor = "0";
	do {
		const [nextCursor, keys] = (await redis.scan(
			cursor,
			"MATCH",
			wildcardPattern,
			"COUNT",
			100
		)) as [string, string[]];
		cursor = nextCursor;

		if (keys.length > 0) {
			await redis.del(...keys);
			deletedCount += keys.length;
		}
	} while (cursor !== "0");

	return deletedCount;
}

/**
 * Invalidates all cacheable cache entries with a specific prefix.
 *
 * @param prefix - The cache prefix (e.g., "flag", "flags-client")
 * @returns Number of keys deleted
 */
export function invalidateCacheablePrefix(prefix: string): Promise<number> {
	return invalidateCacheablePattern(`cacheable:${prefix}:*`);
}
