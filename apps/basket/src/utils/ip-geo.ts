import type { City } from "@maxmind/geoip2-node";
import { Reader, AddressNotFoundError } from "@maxmind/geoip2-node";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from 'node:crypto';

interface GeoIPReader extends Reader {
  city(ip: string): City;
}

const dbPath = path.join(process.cwd(), "maxmind", "ipinfo_lite.mmdb");
let reader: GeoIPReader | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;
let loadError: Error | null = null;

async function loadDatabase() {
  if (loadError) {
    throw loadError;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  if (reader) {
    return;
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      console.log("Loading GeoIP database...");

      // Check if file exists first
      try {
        await readFile(dbPath);
      } catch (error) {
        throw new Error(`GeoIP database file not found at ${dbPath}`);
      }

      const dbBuffer = await readFile(dbPath);
      console.log(`Database file size: ${dbBuffer.length} bytes`);

      // Add a small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));

      reader = Reader.openBuffer(dbBuffer) as GeoIPReader;
      console.log("GeoIP database loaded successfully");

      // Test the database with a known IP to verify it's working
      try {
        const testResponse = reader.city("8.8.8.8");
        console.log("Database test successful - 8.8.8.8 found:", testResponse.country?.names?.en);
      } catch (testError) {
        console.error("Database test failed:", testError);
      }
    } catch (error) {
      console.error("Failed to load GeoIP database:", error);
      loadError = error as Error;
      reader = null;
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
}

// Don't initialize on module load - wait for first use
const ignore = ['127.0.0.1', '::1'];

// Helper function to validate IP address format
function isValidIp(ip: string): boolean {
  if (!ip) return false;

  // Check for IPv4 format
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(ip)) return true;

  // Check for IPv6 format (basic check)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv6Regex.test(ip)) return true;

  return false;
}

export async function getGeoLocation(ip: string) {
  if (!ip || ignore.includes(ip) || !isValidIp(ip)) {
    return { country: undefined, region: undefined };
  }

  // Lazy load database on first use
  if (!reader && !isLoading && !loadError) {
    try {
      await loadDatabase();
    } catch (error) {
      console.error("Failed to load database for IP lookup:", error);
      return { country: undefined, region: undefined };
    }
  }

  if (!reader) {
    return { country: undefined, region: undefined };
  }

  try {
    console.log(`Looking up IP: ${ip}`);
    const response = reader.city(ip);
    console.log(`IP ${ip} found in database:`, {
      country: response.country?.names?.en,
      region: response.subdivisions?.[0]?.names?.en,
    });
    return {
      country: response.country?.names?.en,
      region: response.subdivisions?.[0]?.names?.en,
    };
  } catch (error) {
    // Handle AddressNotFoundError specifically (IP not in database)
    if (error instanceof AddressNotFoundError) {
      console.log(`IP ${ip} not found in GeoIP database`);
      return { country: undefined, region: undefined };
    }

    // Handle other errors
    console.error("Error looking up IP:", ip, error);
    return { country: undefined, region: undefined };
  }
}

export function getClientIp(req: Request): string | undefined {
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;

  return undefined;
}

export async function parseIp(req: Request) {
  const ip = getClientIp(req);
  return getGeoLocation(ip || '');
}

export function anonymizeIp(ip: string): string {
  if (!ip) return '';

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
  };
}

export function extractIpFromRequest(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const forwardedFor = request.headers.get('x-forwarded-for');
  const firstIp = forwardedFor?.split(',')[0]?.trim();
  if (firstIp) return firstIp;

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '';
}

