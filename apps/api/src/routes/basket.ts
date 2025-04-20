/**
 * Databuddy Analytics Collection Endpoint (Basket)
 * Collects analytics events from the databuddy.js client and stores them in ClickHouse.
 */

import { Hono } from 'hono';
import { createLogger } from '../lib/logger';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { websiteAuthHook } from '../hooks/auth';
import { processEvent } from '../controllers/analytics.controller';
import type { AppVariables, TrackingEvent } from '../types';
import { UAParser } from 'ua-parser-js';
import { parseIp, anonymizeIp } from '../utils/ip-geo';
import { parseReferrer } from '../utils/referrer';
import bots from '../lists/bots';

// Initialize logger
const logger = createLogger('analytics-basket');

// Helper function to check if user agent matches any bot patterns
function isBot(userAgent: string): boolean {
  if (!userAgent) return false;
  
  // Convert to lowercase for case-insensitive matching
  const ua = userAgent.toLowerCase();
  
  // Check against bot patterns
  return bots.some(bot => {
    try {
      const regex = new RegExp(bot.regex, 'i');
      return regex.test(ua);
    } catch (e) {
      // Log regex error but don't block the request
      logger.error('Bot regex error', { pattern: bot.regex, error: e });
      return false;
    }
  });
}

// Create a new basket router
const basketRouter = new Hono<{ Variables: AppVariables & { enriched?: any } }>();

// Apply website authentication hook first to get website info
basketRouter.use(websiteAuthHook());

// Add CORS middleware with dynamic origin based on website domain
basketRouter.use('*', async (c, next) => {
  const website = c.get('website');
  
  const corsMiddleware = cors({
    origin: (origin) => {
      if (!origin) return origin;
      
      try {
        // Always allow localhost for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return origin;
        }
        
        // Get the website's domain
        let domain = website?.domain || '';
        if (domain.startsWith('http://') || domain.startsWith('https://')) {
          domain = new URL(domain).hostname;
        }
        
        // Get the origin hostname
        const originHostname = new URL(origin).hostname;
        
        // Allow if origin matches website domain or is a subdomain
        if (domain && (originHostname === domain || originHostname.endsWith(`.${domain}`))) {
          return origin;
        }
        
        // Log warning but still allow the request
        logger.warn('Origin mismatch but allowing', { origin, domain, clientId: website?.id });
        return origin;
      } catch (error) {
        logger.error('Error validating origin', { origin, error });
        return origin;
      }
    },
    allowHeaders: [
      'Content-Type',
      'databuddy-client-id',
      'databuddy-sdk-name',
      'databuddy-sdk-version',
      'Origin',
      'Accept',
      'Accept-Language',
      'Accept-Encoding',
      'User-Agent',
      'Referer'
    ],
    allowMethods: ['POST', 'OPTIONS', 'GET'],
    exposeHeaders: ['Content-Type'],
    credentials: false,
    maxAge: 600,
  });
  
  return corsMiddleware(c, next);
});

// Define the event validation schema
const eventSchema = z.object({
  type: z.enum(['track', 'alias', 'increment', 'decrement']),
  payload: z.object({
    name: z.string().optional(),
    anonymousId: z.string().optional(),
    profileId: z.string().optional(),
    properties: z.record(z.any()).optional(),
    property: z.string().optional(),
    value: z.number().optional(),
  }),
}) satisfies z.ZodType<TrackingEvent>;

// Define batch events validation schema
const batchEventsSchema = z.array(eventSchema);

// Middleware to enrich events with metadata
basketRouter.use('*', async (c, next) => {
  const userAgent = c.req.header('user-agent') || '';
  const referrer = c.req.header('referer') || '';
  const url = new URL(c.req.url);
  const language = c.req.header('accept-language')?.split(',')[0] || '';

  // Parse user agent info using ua-parser-js
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  const isBotEvent = isBot(userAgent);
  
  if (isBotEvent) {
    logger.info('Skipping bot request', { userAgent, isBotEvent });
    return c.json({ status: 'skipped', message: 'Bot request' }, 200);
  }

  // Get geo location from headers
  const headers = new Headers();
  for (const [key, value] of Object.entries(c.req.header())) {
    if (value) headers.append(key, value);
  }
  
  const request = new Request(c.req.url, {
    headers,
    method: c.req.method
  });
  
  const geo = await parseIp(request);
  const referrerInfo = parseReferrer(referrer);
  const urlParams = new URLSearchParams(url.search);

  // Add enriched data to context matching ClickHouse schema
  c.set('enriched', {
    url: url.toString(),
    path: url.pathname,
    title: '',
    user_agent: userAgent,
    // Store parsed user agent data
    browser_name: result.browser.name || 'Unknown',
    browser_version: result.browser.version || 'Unknown',
    os_name: result.os.name || 'Unknown',
    os_version: result.os.version || 'Unknown',
    device_type: result.device.type || 'desktop',
    device_brand: result.device.vendor || 'Unknown',
    device_model: result.device.model || 'Unknown',
    screen_resolution: '',
    viewport_size: '',
    language,
    timezone: geo.timezone || '',
    timezone_offset: null,
    connection_type: '',
    connection_speed: '',
    rtt: null,
    ip: anonymizeIp(geo.ip || ''),
    country: geo.country || '',
    region: geo.region || '',
    city: geo.city || '',
    referrer: referrerInfo.url,
    utm_source: urlParams.get('utm_source') || '',
    utm_medium: urlParams.get('utm_medium') || '',
    utm_campaign: urlParams.get('utm_campaign') || '',
    utm_term: urlParams.get('utm_term') || '',
    utm_content: urlParams.get('utm_content') || '',
    load_time: null,
    dom_ready_time: null,
    ttfb: null,
    redirect_time: null,
    domain_lookup_time: null,
    connection_time: null,
    request_time: null,
    render_time: null,
    fcp: null,
    lcp: null,
    cls: null,
    page_size: null,
    time_on_page: null,
    page_count: null,
    scroll_depth: null,
    interaction_count: null,
    exit_intent: 0
  });

  await next();
});

// Handle single analytics event with validation
basketRouter.post('/', async (c) => {
  const validationResult = eventSchema.safeParse(await c.req.json());
  
  if (!validationResult.success) {
    return c.json({ 
      status: 'error', 
      message: 'Invalid event data',
      errors: validationResult.error.issues
    }, 400);
  }
  
  const enriched = c.get('enriched');
  const properties = validationResult.data.payload.properties || {};
  
  // Map properties to clickhouse schema
  const mappedEvent = {
    ...validationResult.data,
    payload: {
      ...validationResult.data.payload,
      screen_resolution: properties.screen_resolution || '',
      viewport_size: properties.viewport_size || '',
      language: properties.language || enriched.language || '',
      timezone: properties.timezone || enriched.timezone || '',
      timezone_offset: properties.timezone_offset || null,
      connection_type: properties.connection_type || '',
      connection_speed: properties.connection_speed || '',
      rtt: properties.rtt || null,
      load_time: properties.load_time || null,
      dom_ready_time: properties.dom_ready_time || null,
      ttfb: properties.ttfb || null,
      redirect_time: properties.redirect_time || null,
      domain_lookup_time: properties.domain_lookup_time || null,
      connection_time: properties.connection_time || null,
      request_time: properties.request_time || null,
      render_time: properties.render_time || null,
      fcp: properties.fcp || null,
      lcp: properties.lcp || null,
      cls: properties.cls || null,
      page_size: properties.page_size || null,
      time_on_page: properties.time_on_page || null,
      page_count: properties.page_count || null,
      scroll_depth: properties.scroll_depth || null,
      interaction_count: properties.interaction_count || null,
      exit_intent: properties.exit_intent || 0,
      title: properties.__title || '',
      path: properties.__path || enriched.path,
      session_id: properties.sessionId,
      session_start_time: properties.sessionStartTime,
      referrer: properties.__referrer || enriched.referrer,
      referrer_type: properties.__referrer_type,
      referrer_name: properties.__referrer_name,
      sdk_name: properties.__sdk_name || properties.__enriched?.sdk_name,
      sdk_version: properties.__sdk_version || properties.__enriched?.sdk_version,
      __raw_properties: properties,
      __enriched: enriched
    }
  } as TrackingEvent;
  
  c.set('event', mappedEvent);
  return processEvent(c);
});

// Handle batch analytics events with validation
basketRouter.post('/batch', async (c) => {
  const validationResult = batchEventsSchema.safeParse(await c.req.json());
  
  if (!validationResult.success) {
    return c.json({ 
      status: 'error', 
      message: 'Invalid batch events data',
      errors: validationResult.error.issues
    }, 400);
  }
  
  const enriched = c.get('enriched');
  const events = validationResult.data;
  const results = [];
  
  // Process each event in the batch
  for (const event of events) {
    const properties = event.payload.properties || {};
    
    // Map properties to clickhouse schema
    const mappedEvent = {
      ...event,
      payload: {
        ...event.payload,
        screen_resolution: properties.screen_resolution || '',
        viewport_size: properties.viewport_size || '',
        language: properties.language || enriched.language || '',
        timezone: properties.timezone || enriched.timezone || '',
        timezone_offset: properties.timezone_offset || null,
        connection_type: properties.connection_type || '',
        connection_speed: properties.connection_speed || '',
        rtt: properties.rtt || null,
        load_time: properties.load_time || null,
        dom_ready_time: properties.dom_ready_time || null,
        ttfb: properties.ttfb || null,
        redirect_time: properties.redirect_time || null,
        domain_lookup_time: properties.domain_lookup_time || null,
        connection_time: properties.connection_time || null,
        request_time: properties.request_time || null,
        render_time: properties.render_time || null,
        fcp: properties.fcp || null,
        lcp: properties.lcp || null,
        cls: properties.cls || null,
        page_size: properties.page_size || null,
        time_on_page: properties.time_on_page || null,
        page_count: properties.page_count || null,
        scroll_depth: properties.scroll_depth || null,
        interaction_count: properties.interaction_count || null,
        exit_intent: properties.exit_intent || 0,
        title: properties.__title || '',
        path: properties.__path || enriched.path,
        session_id: properties.sessionId,
        session_start_time: properties.sessionStartTime,
        referrer: properties.__referrer || enriched.referrer,
        referrer_type: properties.__referrer_type,
        referrer_name: properties.__referrer_name,
        sdk_name: properties.__sdk_name || properties.__enriched?.sdk_name,
        sdk_version: properties.__sdk_version || properties.__enriched?.sdk_version,
        __raw_properties: properties,
        __enriched: enriched
      }
    } as TrackingEvent;
    
    // Process each event
    c.set('event', mappedEvent);
    try {
      const result = await processEvent(c);
      const resultData = await result.json();
      results.push({
        status: resultData.status,
        eventName: event.payload.name,
        anonymousId: event.payload.anonymousId?.substring(0, 8)
      });
    } catch (error) {
      results.push({
        status: 'error',
        eventName: event.payload.name,
        anonymousId: event.payload.anonymousId?.substring(0, 8),
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  return c.json({
    status: 'success',
    message: `Processed ${events.length} events`,
    processed: results
  }, 200);
});

export default basketRouter;
