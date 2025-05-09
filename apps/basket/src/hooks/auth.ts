/**
 * Website Authentication Hook for Analytics
 * 
 * This hook provides authentication for website tracking by validating 
 * client IDs and origins against registered websites.
 */

import type { MiddlewareHandler } from 'hono';
import { db, eq, websites } from '@databuddy/db';
import { cacheable } from '@databuddy/redis';
import type { AppVariables } from '../types';
import { logger } from '../lib/logger';

// Cache the website lookup
export const getWebsiteById = cacheable(
  async (id: string): Promise<any> => {
    logger.debug('Fetching website from database', { id }); // Stays, context not passed here
    return db.query.websites.findFirst({
      where: eq(websites.id, id)
    });
  },
  {
    expireInSec: 300, 
    prefix: 'website_by_id',
    staleWhileRevalidate: true,
    staleTime: 60
  }
);

// Simplified isValidOrigin - relies on www. and protocol stripping, checks exact and subdomain
export function isValidOrigin(originHeader: string, dbDomain: string): boolean {
  if (!originHeader) return true; 

  try {
    let normalizedDbDomain = dbDomain;
    // Strip protocol if present
    if (normalizedDbDomain.startsWith('http://') || normalizedDbDomain.startsWith('https://')) {
      normalizedDbDomain = new URL(normalizedDbDomain).hostname;
    } else {
      // If no protocol, it might be domain:port, so split and take the domain part
      normalizedDbDomain = normalizedDbDomain.split(':')[0];
    }
    normalizedDbDomain = normalizedDbDomain.replace(/^www\./, '');

    const originUrl = new URL(originHeader);
    let normalizedOriginHostname = originUrl.hostname; // .hostname already strips port
    normalizedOriginHostname = normalizedOriginHostname.replace(/^www\./, '');

    // Use a generic logger here or pass execCtx if refactoring isValidOrigin to be called by other Hono handlers
    logger.debug('[isValidOrigin Check]', {
      requestOrigin: originHeader,
      normalizedRequestHostname: normalizedOriginHostname,
      databaseDomain: dbDomain,
      normalizedDatabaseDomain: normalizedDbDomain
    });

    if (normalizedOriginHostname === normalizedDbDomain) return true;
    // Subdomain check should be against a pure hostname
    if (normalizedOriginHostname.endsWith(`.${normalizedDbDomain}`)) return true;
    
    return false;
  } catch (error) {
    logger.error('[isValidOrigin Error]', { originHeader, dbDomain, error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

export const websiteAuthHook = (): MiddlewareHandler<{
  Variables: AppVariables;
}> => {
  return async (c, next) => {
    if (c.req.method === 'OPTIONS') {
      await next();
      return;
    }

    const requestOrigin = c.req.header('origin') || '';
    const clientId = c.req.header('databuddy-client-id') || c.req.query('client_id') || '';

    if (!clientId) {
      logger.warn('[AuthHook] Missing client ID', { url: c.req.url, origin: requestOrigin });
      return c.json({ error: 'Missing or invalid client ID' }, 401);
    }

    try {
      const website = await getWebsiteById(clientId);

      if (!website) {
        logger.warn('[AuthHook] Unknown website ID', { clientId, origin: requestOrigin });
        return c.json({ error: 'Invalid client ID' }, 401);
      }

      if (website.status !== 'ACTIVE') {
        logger.warn('[AuthHook] Inactive website', { clientId, status: website.status, origin: requestOrigin });
        return c.json({ error: 'Website is not active' }, 403);
      }

      if (requestOrigin && !isValidOrigin(requestOrigin, website.domain)) {
        logger.warn('[AuthHook] Origin mismatch', {
          clientId,
          requestOrigin,
          expectedDbDomain: website.domain
        });
        return c.json({ error: 'Origin not authorized for this client ID' }, 403);
      }

      c.set('website', website as any);
      await next();
    } catch (error) {
      logger.error('[AuthHook] Error validating website', { 
        clientId, 
        origin: requestOrigin, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return c.json({ error: 'Authentication error' }, 500);
    }
  };
}; 