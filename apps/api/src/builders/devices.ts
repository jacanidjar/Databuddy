/**
 * Analytics Devices Builders
 *
 * Builders for device, browser, and resolution metrics
 */

import { 
  createSqlBuilder, 
  buildWhereClauses, 
  buildCommonSelect, 
  buildCommonGroupBy, 
  buildCommonOrderBy 
} from './utils';

// Data types
export interface ScreenResolution {
  resolution: string;
  count: number;
  visitors: number;
}

export interface BrowserData {
  browser: string;
  version: string;
  os: string;
  os_version: string;
  count: number;
  visitors: number;
}

export interface DeviceType {
  device_type: string;
  visitors: number;
  pageviews: number;
}

/**
 * Creates a builder for fetching screen resolution data
 */
export function createScreenResolutionsBuilder(websiteId: string, startDate: string, endDate: string, limit: number = 10) {
  const builder = createSqlBuilder();
  builder.setTable('events');
  
  builder.sb.select = buildCommonSelect({
    resolution: 'screen_resolution',
    count: 'COUNT(CASE WHEN event_name = \'screen_view\' THEN 1 END) as count',
    visitors: 'COUNT(DISTINCT anonymous_id) as visitors'
  });
  
  builder.sb.where = buildWhereClauses(websiteId, startDate, endDate, {
    resolution_filter: "screen_resolution != ''",
    event_filter: "event_name = 'screen_view'"
  });
  
  builder.sb.groupBy = buildCommonGroupBy({ resolution: 'screen_resolution' });
  builder.sb.orderBy = buildCommonOrderBy({ visitors: 'visitors DESC' });
  builder.sb.limit = limit;
  
  return builder;
}

/**
 * Creates a builder for fetching browser version data
 */
export function createBrowserVersionsBuilder(websiteId: string, startDate: string, endDate: string, limit: number = 10) {
  const builder = createSqlBuilder();
  builder.setTable('events');
  
  builder.sb.select = {
    browser_name: 'browser_name',
    browser_version: 'browser_version',
    os_name: 'os_name',
    os_version: 'os_version',
    count: 'COUNT(*) as count',
    visitors: 'COUNT(DISTINCT anonymous_id) as visitors'
  };
  
  builder.sb.where = {
    client_filter: `client_id = '${websiteId}'`,
    date_filter: `time >= parseDateTimeBestEffort('${startDate}') AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')`,
    event_filter: "event_name = 'screen_view'",
    browser_filter: "(browser_name IS NOT NULL AND browser_name != 'Unknown') OR (os_name IS NOT NULL AND os_name != 'Unknown')"
  };
  
  builder.sb.groupBy = {
    browser_name: 'browser_name',
    browser_version: 'browser_version',
    os_name: 'os_name',
    os_version: 'os_version'
  };
  
  builder.sb.orderBy = {
    visitors: 'visitors DESC',
    browser_name: 'browser_name ASC',
    browser_version: 'browser_version ASC'
  };
  
  builder.sb.limit = limit;
  
  return builder;
}

/**
 * Creates a builder for fetching device type data
 */
export function createDeviceTypesBuilder(websiteId: string, startDate: string, endDate: string, limit: number = 5) {
  const builder = createSqlBuilder();
  builder.setTable('events');
  
  builder.sb.select = {
    device_type: 'COALESCE(device_type, \'desktop\') as device_type',
    device_brand: 'COALESCE(device_brand, \'Unknown\') as device_brand',
    device_model: 'COALESCE(device_model, \'Unknown\') as device_model',
    visitors: 'COUNT(DISTINCT anonymous_id) as visitors',
    pageviews: 'COUNT(*) as pageviews'
  };
  
  builder.sb.where = {
    client_filter: `client_id = '${websiteId}'`,
    date_filter: `time >= parseDateTimeBestEffort('${startDate}') AND time <= parseDateTimeBestEffort('${endDate} 23:59:59')`,
    event_filter: "event_name = 'screen_view'"
  };
  
  builder.sb.groupBy = {
    device_type: 'device_type',
    device_brand: 'device_brand',
    device_model: 'device_model'
  };
  
  builder.sb.orderBy = {
    visitors: 'visitors DESC',
    device_type: 'device_type ASC',
    device_brand: 'device_brand ASC'
  };
  
  builder.sb.limit = limit;
  
  return builder;
}

/**
 * Creates a builder for fetching connection types data
 */
export function createConnectionTypesBuilder(websiteId: string, startDate: string, endDate: string, limit = 10) {
  const builder = createSqlBuilder();
  
  builder.sb.select = {
    connection_type: 'COALESCE(connection_type, \'Unknown\') as connection_type',
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
    connection_type: 'connection_type'
  };
  
  builder.sb.orderBy = {
    visitors: 'visitors DESC'
  };
  
  builder.sb.limit = limit;
  
  return builder;
}

/**
 * Helper function to format browser data
 */
export function formatBrowserData(browserData: Array<{ browser_name: string; browser_version: string; os_name: string; os_version: string; count: number; visitors: number }>) {
  return browserData.map(item => ({
    browser: item.browser_name || 'Unknown',
    version: item.browser_version || 'Unknown',
    os: item.os_name || 'Unknown',
    os_version: item.os_version || 'Unknown',
    count: item.count,
    visitors: item.visitors
  }));
}

/**
 * Helper function to format device data
 */
export function formatDeviceData(deviceData: Array<{ device_type: string; device_brand: string; device_model: string; visitors: number; pageviews: number }>) {
  return deviceData.map(item => ({
    device_type: item.device_type || 'desktop',
    device_brand: item.device_brand || 'Unknown',
    device_model: item.device_model || 'Unknown',
    visitors: item.visitors,
    pageviews: item.pageviews
  }));
} 