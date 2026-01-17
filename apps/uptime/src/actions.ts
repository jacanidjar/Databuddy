import { createHash } from "node:crypto";
import { connect } from "node:tls";
import { db, eq, uptimeSchedules, uptimeMonitorState } from "@databuddy/db";
import { type JsonParsingConfig, parseJsonResponse } from "./json-parser";
import { captureError, record } from "./lib/tracing";
import type { ActionResult, UptimeData } from "./types";
import { MonitorStatus } from "./types";

const CONFIG = {
	userAgent:
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
	timeout: 30_000,
	maxRedirects: 10,
	maxRetries: 3,
	region:
		process.env.PROBE_REGION || process.env.RAILWAY_REPLICA_REGION || "default",
	env: process.env.NODE_ENV || "prod",
} as const;

const BROWSER_HEADERS = {
	"User-Agent": CONFIG.userAgent,
	Accept:
		"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
	"Accept-Language": "en-US,en;q=0.9",
	"Accept-Encoding": "gzip, deflate, br",
	"Cache-Control": "no-cache",
	DNT: "1",
	"Sec-Fetch-Dest": "document",
	"Sec-Fetch-Mode": "navigate",
	"Sec-Fetch-Site": "none",
	"Sec-Fetch-User": "?1",
	"Upgrade-Insecure-Requests": "1",
} as const;

interface FetchSuccess {
	ok: true;
	statusCode: number;
	ttfb: number;
	total: number;
	redirects: number;
	bytes: number;
	content: string;
	contentType: string | null;
	parsedJson?: unknown;
}

interface FetchFailure {
	ok: false;
	statusCode: number;
	ttfb: number;
	total: number;
	error: string;
}

export function lookupSchedule(id: string): Promise<
	ActionResult<{
		id: string;
		url: string;
		websiteId: string | null;
		jsonParsingConfig: unknown;
	}>
> {
	return record("uptime.lookup_schedule", async () => {
		try {
			const schedule = await db.query.uptimeSchedules.findFirst({
				where: eq(uptimeSchedules.id, id),
			});

			if (!schedule) {
				return { success: false, error: `Schedule ${id} not found` };
			}

			if (!schedule.url) {
				return {
					success: false,
					error: `Schedule ${id} has invalid data (missing url)`,
				};
			}

			return {
				success: true,
				data: {
					id: schedule.id,
					url: schedule.url,
					websiteId: schedule.websiteId,
					jsonParsingConfig: schedule.jsonParsingConfig,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Database error",
			};
		}
	});
}

function normalizeUrl(url: string): string {
	if (url.startsWith("http://") || url.startsWith("https://")) {
		return url;
	}
	return `https://${url}`;
}

function pingWebsite(
	originalUrl: string
): Promise<FetchSuccess | FetchFailure> {
	return record("uptime.ping_website", async () => {
		const url = normalizeUrl(originalUrl);
		const abort = new AbortController();
		const timeout = setTimeout(() => abort.abort(), CONFIG.timeout);
		const start = performance.now();

		try {
			let redirects = 0;
			let current = url;
			let useHead = true;
			let headSucceeded = false;

			while (redirects < CONFIG.maxRedirects) {
				const method = useHead ? "HEAD" : "GET";
				const res = await fetch(current, {
					method,
					signal: abort.signal,
					redirect: "manual",
					headers: BROWSER_HEADERS,
				});

				const ttfb = performance.now() - start;

				if (res.status >= 300 && res.status < 400) {
					const location = res.headers.get("location");
					if (!location) {
						break;
					}

					redirects += 1;
					current = new URL(location, current).toString();
					continue;
				}

				if (useHead && res.status === 405) {
					useHead = false;
					continue;
				}

				if (useHead && res.ok) {
					headSucceeded = true;
					useHead = false;
					continue;
				}

				const contentType = res.headers.get("content-type");
				const isJson = contentType?.includes("application/json");

				let content: string;
				let parsedJson: unknown | undefined;

				if (isJson) {
					parsedJson = await res.json();
					content = JSON.stringify(parsedJson);
				} else {
					content = await res.text();
				}

				const total = performance.now() - start;

				clearTimeout(timeout);

				if (!res.ok) {
					return {
						ok: false,
						statusCode: res.status,
						ttfb: Math.round(ttfb),
						total: Math.round(total),
						error: `HTTP ${res.status}: ${res.statusText}`,
					};
				}

				const contentLength = res.headers.get("content-length");
				const bytes =
					method === "HEAD" && contentLength && !headSucceeded
						? Number.parseInt(contentLength, 10)
						: new Blob([content]).size;

				return {
					ok: true,
					statusCode: res.status,
					ttfb: Math.round(ttfb),
					total: Math.round(total),
					redirects,
					bytes,
					content,
					contentType,
					parsedJson,
				};
			}

			throw new Error(`Too many redirects (max ${CONFIG.maxRedirects})`);
		} catch (error) {
			clearTimeout(timeout);
			const total = performance.now() - start;

			let message = "Unknown error";
			if (error instanceof Error) {
				message =
					error.name === "AbortError"
						? `Timeout after ${CONFIG.timeout}ms`
						: error.message;
			}

			return {
				ok: false,
				statusCode: 0,
				ttfb: 0,
				total: Math.round(total),
				error: message,
			};
		}
	});
}

function checkCertificate(url: string): Promise<{
	valid: boolean;
	expiry: number;
}> {
	return record(
		"uptime.check_certificate",
		() =>
			new Promise((resolve) => {
				try {
					const parsed = new URL(url);

					if (parsed.protocol !== "https:") {
						resolve({ valid: false, expiry: 0 });
						return;
					}

					const port = parsed.port ? Number.parseInt(parsed.port, 10) : 443;
					const socket = connect(
						{
							host: parsed.hostname,
							port,
							servername: parsed.hostname,
							timeout: 5000,
						},
						() => {
							const cert = socket.getPeerCertificate();
							socket.destroy();

							if (!cert?.valid_to) {
								resolve({ valid: false, expiry: 0 });
								return;
							}

							const expiry = new Date(cert.valid_to);
							resolve({
								valid: expiry > new Date(),
								expiry: expiry.getTime(),
							});
						}
					);

					socket.on("error", () => {
						socket.destroy();
						resolve({ valid: false, expiry: 0 });
					});

					socket.on("timeout", () => {
						socket.destroy();
						resolve({ valid: false, expiry: 0 });
					});
				} catch {
					resolve({ valid: false, expiry: 0 });
				}
			})
	);
}

function getProbeMetadata(): Promise<{ ip: string; region: string }> {
	return record("uptime.get_probe_metadata", async () => {
		try {
			const res = await fetch("https://api.ipify.org?format=json", {
				signal: AbortSignal.timeout(5000),
			});

			if (res.ok) {
				const data = (await res.json()) as { ip: string };
				return { ip: data.ip || "unknown", region: CONFIG.region };
			}
		} catch {
			// Failed to get probe IP
		}

		return { ip: "unknown", region: CONFIG.region };
	});
}

function calculateStatus(isUp: boolean): {
	status: number;
	retries: number;
	streak: number;
} {
	const { UP, DOWN } = MonitorStatus;
	return { status: isUp ? UP : DOWN, retries: 0, streak: 0 };
}

export function checkUptime(
	siteId: string,
	url: string,
	attempt = 1,
	jsonParsingConfig?: JsonParsingConfig | null
): Promise<ActionResult<UptimeData>> {
	return record("uptime.check_uptime", async () => {
		try {
			const normalizedUrl = normalizeUrl(url);
			const timestamp = Date.now();

			const [pingResult, probe] = await Promise.all([
				pingWebsite(normalizedUrl),
				getProbeMetadata(),
			]);

			// Fetch previous state
			const previousState = await db.query.uptimeMonitorState.findFirst({
				where: eq(uptimeMonitorState.id, siteId),
			});

			const isUp = pingResult.ok;
			const status = isUp ? MonitorStatus.UP : MonitorStatus.DOWN;

			// Calculate streak and previous status
			const previousStatus = previousState?.status ?? null;
			let streak = previousState?.consecutiveFailures ?? 0;
			let lastChangeAt = previousState?.lastChangeAt ?? new Date(timestamp);

			if (status === MonitorStatus.DOWN) {
				if (previousStatus === MonitorStatus.DOWN) {
					streak += 1;
				} else {
					streak = 1; // Reset streak on first failure or transition to down
				}
			} else {
				streak = 0; // Reset streak on success
			}

			if (status !== previousStatus) {
				lastChangeAt = new Date(timestamp);
			}

			// Persist new state
			await db
				.insert(uptimeMonitorState)
				.values({
					id: siteId,
					status,
					consecutiveFailures: streak,
					lastCheckedAt: new Date(timestamp),
					lastChangeAt,
					updatedAt: new Date(),
				})
				.onConflictDoUpdate({
					target: uptimeMonitorState.id,
					set: {
						status,
						consecutiveFailures: streak,
						lastCheckedAt: new Date(timestamp),
						lastChangeAt,
						updatedAt: new Date(),
					},
				});

			const retries = 0; // Keeping existing logic for now, though checkUptime has retries logic inside pingWebsite loop?
			// Actually pingWebsite handles internal retries (redirects), but maxRetries arg in checkUptime is unused in pingWebsite loop except for redirects?
			// The pingWebsite function has a loop for REDIRECTS, not retries on failure (except simple fetch error logic?). 
			// We'll stick to 'streak' logic for alarms.

			if (!pingResult.ok) {
				const cert = await checkCertificate(normalizedUrl);

				return {
					success: true,
					data: {
						site_id: siteId,
						url: normalizedUrl,
						timestamp,
						status,
						http_code: pingResult.statusCode,
						ttfb_ms: pingResult.ttfb,
						total_ms: pingResult.total,
						attempt,
						retries,
						failure_streak: streak,
						response_bytes: 0,
						content_hash: "",
						redirect_count: 0,
						probe_region: probe.region,
						probe_ip: probe.ip,
						ssl_expiry: cert.expiry,
						ssl_valid: cert.valid ? 1 : 0,
						env: CONFIG.env,
						check_type: "http",
						user_agent: CONFIG.userAgent,
						error: pingResult.error,
						previous_status: previousStatus,
					},
				};
			}

			const [cert, contentHash] = await Promise.all([
				checkCertificate(normalizedUrl),
				Promise.resolve(
					createHash("sha256").update(pingResult.content).digest("hex")
				),
			]);

			const jsonData = jsonParsingConfig
				? parseJsonResponse(
					pingResult.parsedJson ?? pingResult.content,
					pingResult.contentType,
					jsonParsingConfig
				)
				: null;

			return {
				success: true,
				data: {
					site_id: siteId,
					url: normalizedUrl,
					timestamp,
					status,
					http_code: pingResult.statusCode,
					ttfb_ms: pingResult.ttfb,
					total_ms: pingResult.total,
					attempt,
					retries,
					failure_streak: streak,
					response_bytes: pingResult.bytes,
					content_hash: contentHash,
					redirect_count: pingResult.redirects,
					probe_region: probe.region,
					probe_ip: probe.ip,
					ssl_expiry: cert.expiry,
					ssl_valid: cert.valid ? 1 : 0,
					env: CONFIG.env,
					check_type: "http",
					user_agent: CONFIG.userAgent,
					error: "",
					json_data: jsonData ? JSON.stringify(jsonData) : undefined,
					previous_status: previousStatus,
				},
			};
		} catch (error) {
			captureError(error);

			return {
				success: false,
				error: error instanceof Error ? error.message : "Uptime check failed",
			};
		}
	});
}
