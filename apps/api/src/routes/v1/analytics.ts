/**
 * Analytics Dashboard Data API
 * 
 * Provides endpoints for retrieving aggregated analytics data for website dashboards.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { authMiddleware } from '../../middleware/auth';
import { timezoneMiddleware, useTimezone, timezoneQuerySchema } from '../../middleware/timezone';
import { getDefaultDateRange } from '../../utils/analytics-helpers';
import { adjustDateRangeForTimezone } from '../../utils/timezone';
import { executeAnalyticsQueries, hasTrackingData } from '../../utils/analytics-queries';
import { createNoTrackingResponse } from '../../utils/response-formatter';
import { processAnalyticsData } from '../../utils/analytics-processor';
import { logger } from '../../lib/logger';
import { websiteAuthHook } from '../../middleware/website';

const analyticsQuerySchema = z.object({
  website_id: z.string().min(1),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  interval: z.enum(['day', 'week', 'month', 'auto']).default('day'),
  granularity: z.enum(['daily', 'hourly']).default('daily'),
  limit: z.coerce.number().int().min(1).max(1000).default(30),
}).merge(timezoneQuerySchema);

type AnalyticsContext = {
  Variables: {
    website: any;
    user: any;
  };
};

// Create router with typed context
export const analyticsRouter = new Hono<AnalyticsContext>();

// Apply middleware to all routes
analyticsRouter.use('*', authMiddleware);
analyticsRouter.use('*', websiteAuthHook);
analyticsRouter.use('*', timezoneMiddleware);

/**
 * Get summary statistics
 * GET /analytics/summary
 */
analyticsRouter.get('/summary', zValidator('query', analyticsQuerySchema), async (c: any) => {
  const params = c.req.valid('query');
  const website = c.get('website');

  if (!website?.id) {
    return c.json({ error: 'Website not found' }, 404);
  }

  try {
    const timezoneInfo = useTimezone(c);
    const { startDate, endDate } = getDefaultDateRange(params.end_date, params.start_date);
    const { startDate: adjustedStartDate, endDate: adjustedEndDate } = adjustDateRangeForTimezone(
      startDate, endDate, timezoneInfo.timezone
    );
    
    const queryResults = await executeAnalyticsQueries({
      website_id: params.website_id,
      adjustedStartDate,
      adjustedEndDate,
      granularity: params.granularity as 'hourly' | 'daily',
      domain: website.domain
    });

    if (!hasTrackingData(queryResults[0], queryResults[1], queryResults[5])) {
      return c.json(createNoTrackingResponse(params, timezoneInfo, startDate, endDate));
    }
    
    const result = processAnalyticsData({
      queryResults,
      website,
      timezoneInfo,
      startDate,
      endDate,
      adjustedStartDate,
      adjustedEndDate,
      granularity: params.granularity as 'hourly' | 'daily',
      params
    });

    return c.json(result);
  } catch (error) {
    logger.error('Error retrieving analytics data', { error, website_id: params.website_id });
    return c.json({ success: false, error: "Error retrieving analytics data" }, 500);
  }
});

import miniChartRouter from './mini-chart';
import sessionsRouter from './sessions';
import profilesRouter from './profiles';
import locationsRouter from './locations';
import errorsRouter from './errors';
import queryRouter from './query';

analyticsRouter.route('/mini-chart', miniChartRouter);
analyticsRouter.route('/sessions', sessionsRouter);
analyticsRouter.route('/profiles', profilesRouter);
analyticsRouter.route('/locations', locationsRouter);
analyticsRouter.route('/errors', errorsRouter);
analyticsRouter.route('/query', queryRouter);

export default analyticsRouter;