import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import type { City, Country } from '@maxmind/geoip2-node';
import { AddressNotFoundError, Reader } from '@maxmind/geoip2-node';

// import { logger } from '../lib/logger';
const logger = console;

interface GeoIPReader extends Reader {
	city(ip: string): City;
	country(ip: string): Country;
}

const IPV4_URL = process.env.IPV4_URL;
const IPV6_URL = process.env.IPV6_URL;

const CDN_URLS = {
	ipv4: IPV4_URL,
	ipv6: IPV6_URL,
} as const;

let ipv4Reader: GeoIPReader | null = null;
let ipv6Reader: GeoIPReader | null = null;
let isLoading = false;

// Initialize databases on module load
loadDatabases().catch((error) => {
	logger.error('Failed to initialize GeoIP databases on startup:', { error });
});

async function loadDatabases() {
	if (isLoading || (ipv4Reader && ipv6Reader)) {
		logger.info('GeoIP databases already loaded or loading');
		return;
	}

	logger.info('Starting to load GeoIP databases...');
	isLoading = true;

	try {
		logger.info('Fetching IPv4 and IPv6 databases from CDN...');
		const [ipv4Response, ipv6Response] = await Promise.all([
			fetch(CDN_URLS.ipv4 || ''),
			fetch(CDN_URLS.ipv6 || ''),
		]);

		if (!ipv4Response.ok) {
			throw new Error(
				`IPv4 database fetch failed: ${ipv4Response.status} ${ipv4Response.statusText}`
			);
		}
		if (!ipv6Response.ok) {
			throw new Error(
				`IPv6 database fetch failed: ${ipv6Response.status} ${ipv6Response.statusText}`
			);
		}

		logger.info('Converting database responses to buffers...');
		const [ipv4Buffer, ipv6Buffer] = await Promise.all([
			ipv4Response.arrayBuffer(),
			ipv6Response.arrayBuffer(),
		]);

		logger.info(
			`Database sizes - IPv4: ${ipv4Buffer.byteLength} bytes, IPv6: ${ipv6Buffer.byteLength} bytes`
		);

		logger.info('Opening database readers...');
		ipv4Reader = Reader.openBuffer(Buffer.from(ipv4Buffer)) as GeoIPReader;
		ipv6Reader = Reader.openBuffer(Buffer.from(ipv6Buffer)) as GeoIPReader;

		logger.info('GeoIP databases loaded successfully');
	} catch (error) {
		logger.error('Failed to load GeoIP databases:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
	} finally {
		isLoading = false;
	}
}

const ignore = ['127.0.0.1', '::1'];

export function getIpType(ip: string): 'ipv4' | 'ipv6' | null {
	if (!ip) {
		return null;
	}

	const ipVersion = isIP(ip);
	if (ipVersion === 4) {
		return 'ipv4';
	}

	if (ipVersion === 6) {
		return 'ipv6';
	}

	return null;
}

export async function getGeoLocation(ip: string) {
	if (!ip || ignore.includes(ip)) {
		logger.debug('IP ignored or empty', { ip, ignored: ignore.includes(ip) });
		return { country: undefined, region: undefined, city: undefined };
	}

	const ipType = getIpType(ip);
	if (!ipType) {
		logger.warn('Invalid IP format', { ip });
		return { country: undefined, region: undefined, city: undefined };
	}

	logger.debug('Processing IP lookup', { ip, type: ipType });

	await loadDatabases();

	const reader = ipType === 'ipv4' ? ipv4Reader : ipv6Reader;
	if (!reader) {
		logger.error('Database reader not available', {
			ip,
			type: ipType,
			hasIpv4Reader: !!ipv4Reader,
			hasIpv6Reader: !!ipv6Reader,
		});
		return { country: undefined, region: undefined, city: undefined };
	}

	try {
		// Try city method first (for full city databases)
		try {
			const response = reader.city(ip);
			const region = response.subdivisions?.[0]?.names?.en;
			const city = response.city?.names?.en;
			const country = response.country?.names?.en;

			logger.debug('IP lookup successful (city)', {
				ip,
				type: ipType,
				country,
				region,
				city,
			});

			return {
				country,
				region,
				city,
			};
		} catch (cityError) {
			// If city method fails, try country method (for country-only databases)
			if (
				cityError instanceof Error &&
				cityError.message.includes('cannot be used with')
			) {
				logger.debug('Falling back to country lookup', { ip, type: ipType });

				const response = reader.country(ip);
				const country = response.country?.names?.en;

				logger.debug('IP lookup successful (country)', {
					ip,
					type: ipType,
					country,
				});

				return {
					country,
					region: undefined,
					city: undefined,
				};
			}
			throw cityError;
		}
	} catch (error) {
		if (error instanceof AddressNotFoundError) {
			logger.debug('IP not found in database', { ip, type: ipType });
			return { country: undefined, region: undefined, city: undefined };
		}
		logger.error('Error looking up IP:', {
			ip,
			type: ipType,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return { country: undefined, region: undefined, city: undefined };
	}
}

export function getClientIp(req: Request): string | undefined {
	const cfIp = req.headers.get('cf-connecting-ip');
	if (cfIp) {
		return cfIp;
	}

	const forwardedFor = req.headers.get('x-forwarded-for');
	if (forwardedFor) {
		const firstIp = forwardedFor.split(',')[0]?.trim();
		if (firstIp) {
			return firstIp;
		}
	}

	const realIp = req.headers.get('x-real-ip');
	if (realIp) {
		return realIp;
	}

	return;
}

export function parseIp(req: Request) {
	const ip = getClientIp(req);
	return getGeoLocation(ip || '');
}

export function anonymizeIp(ip: string): string {
	if (!ip) {
		return '';
	}

	const salt = process.env.IP_HASH_SALT || 'databuddy-ip-salt';
	const hash = createHash('sha256');
	hash.update(`${ip}${salt}`);
	return hash.digest('hex').substring(0, 12);
}

export async function getGeo(ip: string) {
	const geo = await getGeoLocation(ip);
	return {
		anonymizedIP: anonymizeIp(ip),
		country: geo.country,
		region: geo.region,
		city: geo.city,
	};
}

export function extractIpFromRequest(request: Request): string {
	const cfIp = request.headers.get('cf-connecting-ip');
	if (cfIp) {
		return cfIp.trim();
	}

	const forwardedFor = request.headers.get('x-forwarded-for');
	const firstIp = forwardedFor?.split(',')[0]?.trim();
	if (firstIp) {
		return firstIp;
	}

	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp.trim();
	}

	return '';
}
