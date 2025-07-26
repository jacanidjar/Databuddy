/**
 * Universal Validation and Sanitization Utilities
 *
 * Provides reusable validation and sanitization functions for analytics data.
 */

export {
	batchAnalyticsEventSchema,
	batchAnalyticsEventsSchema,
	filterSafeHeaders,
	SAFE_HEADERS,
	sanitizeString,
	validateExitIntent,
	validateInteractionCount,
	validateLanguage,
	validateNumeric,
	validatePageCount,
	validatePayloadSize,
	validatePerformanceMetric,
	validateProperties,
	validateScreenResolution,
	validateScrollDepth,
	validateSessionId,
	validateTimezone,
	validateTimezoneOffset,
	validateUrl,
	validateUtmParameter,
	validateViewportSize,
} from '@databuddy/validation';
