/**
 * Analytics Geo Builders
 *
 * Builders for geographic analytics metrics
 */

import { 
  createSqlBuilder, 
  buildWhereClauses, 
  buildCommonSelect, 
  buildCommonGroupBy, 
  buildCommonOrderBy 
} from './utils';

// Data types
export interface Country {
  country: string;
  visitors: number;
  pageviews: number;
}

/**
 * Creates a builder for fetching country data
 */
export function createCountriesBuilder(websiteId: string, startDate: string, endDate: string, limit = 5) {
  const builder = createSqlBuilder();
  builder.setTable('events');
  
  builder.sb.select = buildCommonSelect({
    country: 'COALESCE(country, \'Unknown\') as country',
    visitors: 'COUNT(DISTINCT anonymous_id) as visitors',
    pageviews: 'COUNT(*) as pageviews'
  });
  
  builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
    event_filter: "event_name = 'screen_view'"
  });
  
  builder.sb.groupBy = buildCommonGroupBy({ country: 'country' });
  builder.sb.orderBy = buildCommonOrderBy({ visitors: 'visitors DESC' });
  builder.sb.limit = limit;
  
  return builder;
}

/**
 * Creates a builder for fetching city data
 */
export function createCitiesBuilder(websiteId: string, startDate: string, endDate: string, limit = 10) {
  const builder = createSqlBuilder();
  builder.setTable('events');
  
  builder.sb.select = buildCommonSelect({
    country: 'COALESCE(country, \'Unknown\') as country',
    city: 'COALESCE(city, \'Unknown\') as city',
    visitors: 'COUNT(DISTINCT anonymous_id) as visitors',
    pageviews: 'COUNT(*) as pageviews'
  });
  
  builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
    event_filter: "event_name = 'screen_view'"
  });
  
  builder.sb.groupBy = buildCommonGroupBy({ 
    country: 'country',
    city: 'city'
  });
  
  builder.sb.orderBy = buildCommonOrderBy({ visitors: 'visitors DESC' });
  builder.sb.limit = limit;
  
  return builder;
}

/**
 * Creates a builder for fetching region/state data
 */
export function createRegionsBuilder(websiteId: string, startDate: string, endDate: string, limit = 10) {
  const builder = createSqlBuilder();
  builder.setTable('events');
  
  builder.sb.select = buildCommonSelect({
    country: 'COALESCE(country, \'Unknown\') as country',
    region: 'COALESCE(region, \'Unknown\') as region',
    visitors: 'COUNT(DISTINCT anonymous_id) as visitors',
    pageviews: 'COUNT(*) as pageviews'
  });
  
  builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
    event_filter: "event_name = 'screen_view'"
  });
  
  builder.sb.groupBy = buildCommonGroupBy({ 
    country: 'country',
    region: 'region'
  });
  
  builder.sb.orderBy = buildCommonOrderBy({ visitors: 'visitors DESC' });
  builder.sb.limit = limit;
  
  return builder;
}

/**
 * Creates a builder for fetching timezone data
 */
export function createTimezonesBuilder(websiteId: string, startDate: string, endDate: string, limit = 10) {
  const builder = createSqlBuilder();
  
  builder.sb.select = {
    timezone: 'COALESCE(timezone, \'Unknown\') as timezone',
    visitors: 'COUNT(DISTINCT anonymous_id) as visitors',
    pageviews: 'COUNT(*) as pageviews'
  };
  
  builder.sb.from = 'analytics.events';
  
  builder.sb.where = {
    client_filter: `client_id = '${websiteId}'`,
    date_filter: `time >= parseDateTimeBestEffort('${startDate}') AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')`,
    event_filter: "event_name = 'screen_view'"
  };
  
  builder.sb.groupBy = {
    timezone: 'timezone'
  };
  
  builder.sb.orderBy = {
    visitors: 'visitors DESC'
  };
  
  builder.sb.limit = limit;
  
  return builder;
}

/**
 * Creates a builder for fetching language data
 */
export function createLanguagesBuilder(websiteId: string, startDate: string, endDate: string, limit = 10) {
  const builder = createSqlBuilder();
  
  builder.sb.select = {
    language: 'COALESCE(language, \'Unknown\') as language',
    visitors: 'COUNT(DISTINCT anonymous_id) as visitors',
    pageviews: 'COUNT(*) as pageviews'
  };
  
  builder.sb.from = 'analytics.events';
  
  builder.sb.where = {
    client_filter: `client_id = '${websiteId}'`,
    date_filter: `time >= parseDateTimeBestEffort('${startDate}') AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')`,
    event_filter: "event_name = 'screen_view'"
  };
  
  builder.sb.groupBy = {
    language: 'language'
  };
  
  builder.sb.orderBy = {
    visitors: 'visitors DESC'
  };
  
  builder.sb.limit = limit;
  
  return builder;
} 