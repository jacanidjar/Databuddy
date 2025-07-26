/* eslint-disable no-console */
/** biome-ignore-all lint/suspicious/noConsole: we witerawwy need to as a fallback */
import { Logtail } from '@logtail/edge';

let logger: Logtail | null = null;

if (typeof window === 'undefined') {
	const token = process.env.LOGTAIL_SOURCE_TOKEN;
	if (token) {
		const endpoint = process.env.LOGTAIL_ENDPOINT;
		if (endpoint) {
			logger = new Logtail(token, {
				endpoint,
				batchSize: 10,
				batchInterval: 1000,
			});
		}
	}
}

export { logger };

const noopLogger = {
	info: (message: string, context?: Record<string, unknown>) => {
		try {
			console.log('[INFO]', message, context);
		} catch {
			// Ignore console errors
		}
		return Promise.resolve();
	},
	error: (message: string, context?: Record<string, unknown>) => {
		try {
			console.error('[ERROR]', message, context);
		} catch {
			// Ignore console errors
		}
		return Promise.resolve();
	},
	warn: (message: string, context?: Record<string, unknown>) => {
		try {
			console.warn('[WARN]', message, context);
		} catch {
			// Ignore console errors
		}
		return Promise.resolve();
	},
	debug: (message: string, context?: Record<string, unknown>) => {
		try {
			console.debug('[DEBUG]', message, context);
		} catch {
			// Ignore console errors
		}
		return Promise.resolve();
	},
};

export const safeLogger =
	typeof window === 'undefined' ? logger || noopLogger : noopLogger;
