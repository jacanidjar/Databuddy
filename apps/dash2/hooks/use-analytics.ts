import { useCallback, useMemo } from 'react';
import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';

// Types
export interface AnalyticsSummary {
  pageviews: number;
  visitors: number;
  sessions: number;
  unique_visitors: number;
  bounce_rate: number;
  bounce_rate_pct: string;
  avg_session_duration: number;
  avg_session_duration_formatted: string;
}

export interface TodayStats {
  pageviews: number;
  visitors: number;
  sessions: number;
  bounce_rate: number;
  bounce_rate_pct: string;
}

export interface DateRange {
  start_date: string;
  end_date: string;
  granularity?: 'hourly' | 'daily';
}

export interface PageData {
  path: string;
  pageviews: number;
  visitors: number;
  avg_time_on_page: number;
  avg_time_on_page_formatted: string;
}

export interface ReferrerData {
  referrer: string;
  visitors: number;
  pageviews: number;
  type?: string;
  name?: string;
  domain?: string;
}

export interface TrendData {
  date: string;
  week: string;
  month: string;
  pageviews: number;
  visitors: number;
  sessions: number;
  bounce_rate: number;
  bounce_rate_pct?: string;
  avg_session_duration: number;
  avg_session_duration_formatted?: string;
}

export interface DeviceData {
  browsers: Array<{
    browser: string;
    version?: string;
    visitors: number;
    pageviews: number;
    count?: number;
  }>;
  os: Array<{
    os: string;
    visitors: number;
    pageviews: number;
  }>;
  device_types: Array<{
    device_type: string;
    visitors: number;
    pageviews: number;
  }>;
  screen_resolutions?: Array<{
    screen_resolution: string;
    count: number;
    visitors: number;
  }>;
}

export interface LocationData {
  countries: Array<{
    country: string;
    visitors: number;
    pageviews: number;
  }>;
  cities: Array<{
    country: string;
    region: string;
    city: string;
    visitors: number;
    pageviews: number;
  }>;
}

export interface PerformanceData {
  avg_load_time: number;
  avg_ttfb: number;
  avg_dom_ready_time: number;
  avg_render_time: number;
  avg_fcp: number;
  avg_lcp: number;
  avg_cls: number;
  avg_load_time_formatted: string;
  avg_ttfb_formatted: string;
  avg_dom_ready_time_formatted: string;
  avg_render_time_formatted: string;
  avg_fcp_formatted: string;
  avg_lcp_formatted: string;
  avg_cls_formatted: string;
}

export interface SessionData {
  session_id: string;
  session_name: string;
  first_visit: string;
  last_visit: string;
  duration: number;
  duration_formatted: string;
  page_views: number;
  visitor_id: string;
  device: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  referrer: string;
  is_returning_visitor: boolean;
  visitor_session_count: number;
  referrer_parsed?: {
    type: string;
    name: string;
    domain: string;
  };
}

export interface SessionEventData {
  event_id: string;
  time: string;
  event_name: string;
  path: string;
  url: string;
  referrer: string;
  title: string;
  time_on_page: number;
  screen_resolution: string;
  user_agent?: string;
  device_type: string;
  browser: string;
  os: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}

export interface SessionWithEvents extends SessionData {
  events: SessionEventData[];
}

export type TimeInterval = 'day' | 'week' | 'month';

export interface ProfileData {
  visitor_id: string;
  first_visit: string;
  last_visit: string;
  total_sessions: number;
  total_pageviews: number;
  total_duration: number;
  total_duration_formatted: string;
  device: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  sessions: SessionData[];
}

export interface ErrorDetail {
  error_id: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  url: string;
  path: string;
  time: string;
  visitor_id: string;
  browser: string;
  os: string;
  device_type: string;
  count: number;
  unique_users: number;
}

export interface ErrorTypeSummary {
  error_type: string;
  error_message: string;
  count: number;
  unique_users: number;
  last_occurrence: string;
}

export interface ErrorsData {
  success: boolean;
  date_range: DateRange;
  error_types: ErrorTypeSummary[];
  recent_errors: ErrorDetail[];
  errors_over_time: Array<{
    date: string;
    [key: string]: number | string;
  }>;
  total_errors: number;
  total_pages: number;
  current_page: number;
}

// API Response interfaces
interface ApiResponse {
  success: boolean;
  error?: string;
}

interface SummaryResponse extends ApiResponse {
  summary: AnalyticsSummary;
  today: TodayStats;
  date_range: DateRange;
  performance: PerformanceData;
  browser_versions: Array<{
    browser: string;
    version: string;
    count: number;
    visitors: number;
  }>;
  device_types: Array<{
    device_type: string;
    visitors: number;
    pageviews: number;
  }>;
  countries: Array<{
    country: string;
    visitors: number;
    pageviews: number;
  }>;
  connection_types: Array<{
    connection_type: string;
    visitors: number;
    pageviews: number;
  }>;
  languages: Array<{
    language: string;
    visitors: number;
    pageviews: number;
  }>;
  timezones: Array<{
    timezone: string;
    visitors: number;
    pageviews: number;
  }>;
  top_pages: Array<PageData>;
  top_referrers: Array<ReferrerData>;
  screen_resolutions: Array<{
    screen_resolution: string;
    count: number;
    visitors: number;
  }>;
  events_by_date: Array<TrendData>;
}

interface SimpleSummaryResponse extends ApiResponse {
  summary: AnalyticsSummary;
  today: TodayStats;
  date_range: DateRange;
}

interface TrendsResponse extends ApiResponse {
  data: TrendData[];
  date_range: DateRange;
  interval: TimeInterval;
}

interface PagesResponse extends ApiResponse {
  data: PageData[];
  date_range: DateRange;
}

interface ReferrersResponse extends ApiResponse {
  data: ReferrerData[];
  date_range: DateRange;
}

interface DevicesResponse extends ApiResponse {
  browsers: Array<{
    browser: string;
    version?: string;
    visitors: number;
    pageviews: number;
  }>;
  os: Array<{
    os: string;
    visitors: number;
    pageviews: number;
  }>;
  device_types: Array<{
    device_type: string;
    visitors: number;
    pageviews: number;
  }>;
  date_range: DateRange;
}

interface LocationsResponse extends ApiResponse {
  countries: Array<{
    country: string;
    visitors: number;
    pageviews: number;
  }>;
  cities: Array<{
    country: string;
    region: string;
    city: string;
    visitors: number;
    pageviews: number;
  }>;
  date_range: DateRange;
}

interface SessionsResponse extends ApiResponse {
  sessions: SessionData[];
  date_range: DateRange;
  unique_visitors: number;
}

interface SessionDetailsResponse extends ApiResponse {
  session: SessionWithEvents;
}

interface ProfilesResponse extends ApiResponse {
  profiles: ProfileData[];
  date_range: DateRange;
  total_visitors: number;
  returning_visitors: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Base params builder
function buildParams(
  websiteId: string, 
  dateRange?: DateRange, 
  additionalParams?: Record<string, string | number>
): URLSearchParams {
  const params = new URLSearchParams({
    website_id: websiteId,
    ...additionalParams
  });
  
  if (dateRange?.start_date) {
    params.append('start_date', dateRange.start_date);
  }
  
  if (dateRange?.end_date) {
    params.append('end_date', dateRange.end_date);
  }

  if (dateRange?.granularity) {
    params.append('granularity', dateRange.granularity);
  }
  
  // Add cache busting
  params.append('_t', Date.now().toString());
  
  return params;
}

// Base fetcher function
async function fetchAnalyticsData<T extends ApiResponse>(
  endpoint: string,
  websiteId: string,
  dateRange?: DateRange,
  additionalParams?: Record<string, string | number>,
  signal?: AbortSignal
): Promise<T> {
  const params = buildParams(websiteId, dateRange, additionalParams);
  const url = `${API_BASE_URL}${endpoint}?${params}`;
  
  const response = await fetch(url, {
    credentials: 'include',
    signal
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${endpoint}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || `Failed to fetch data from ${endpoint}`);
  }
  
  return data;
}

// Common query options
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: (failureCount: number, error: Error) => {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return false;
    }
    return failureCount < 2;
  }
};

/**
 * Unified analytics hook for all data
 */
export function useWebsiteAnalytics(websiteId: string, dateRange: DateRange) {
  const fetchData = useCallback(async ({ signal }: { signal?: AbortSignal }) => {
    return fetchAnalyticsData<SummaryResponse>('/analytics/summary', websiteId, dateRange, undefined, signal);
  }, [websiteId, dateRange]);

  const summaryQuery = useQuery({
    queryKey: ['analytics', 'summary', websiteId, dateRange],
    queryFn: fetchData,
    ...defaultQueryOptions
  });
  
  return {
    analytics: {
      summary: summaryQuery.data?.summary,
      today: summaryQuery.data?.today,
      performance: summaryQuery.data?.performance,
      browser_versions: summaryQuery.data?.browser_versions,
      device_types: summaryQuery.data?.device_types,
      countries: summaryQuery.data?.countries,
      connection_types: summaryQuery.data?.connection_types,
      languages: summaryQuery.data?.languages,
      timezones: summaryQuery.data?.timezones,
      top_pages: summaryQuery.data?.top_pages,
      top_referrers: summaryQuery.data?.top_referrers,
      screen_resolutions: summaryQuery.data?.screen_resolutions,
      events_by_date: summaryQuery.data?.events_by_date,
    },
    loading: {
      summary: summaryQuery.isLoading,
      any: summaryQuery.isLoading
    },
    error: {
      summary: summaryQuery.isError,
      any: summaryQuery.isError
    },
    queries: { summary: summaryQuery },
    refetch: () => summaryQuery.refetch()
  };
}

/**
 * Hook to fetch summary analytics data
 */
export function useAnalyticsSummary(websiteId: string, dateRange?: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'summary', websiteId, dateRange],
    queryFn: () => fetchAnalyticsData<SimpleSummaryResponse>('/analytics/summary', websiteId, dateRange),
    ...defaultQueryOptions
  });
}

/**
 * Hook to fetch visitor trends over time
 */
export function useAnalyticsTrends(
  websiteId: string, 
  interval: TimeInterval = 'day',
  dateRange?: DateRange,
  limit = 30
) {
  return useQuery({
    queryKey: ['analytics', 'trends', websiteId, interval, dateRange, limit],
    queryFn: () => fetchAnalyticsData<TrendsResponse>(
      '/analytics/trends', 
      websiteId, 
      dateRange, 
      { interval, limit }
    ),
    ...defaultQueryOptions
  });
}

/**
 * Hook to fetch top pages data
 */
export function useAnalyticsPages(
  websiteId: string,
  dateRange?: DateRange,
  limit = 10
) {
  return useQuery({
    queryKey: ['analytics', 'pages', websiteId, dateRange, limit],
    queryFn: () => fetchAnalyticsData<PagesResponse>(
      '/analytics/pages', 
      websiteId, 
      dateRange, 
      { limit }
    ),
    ...defaultQueryOptions
  });
}

/**
 * Hook to fetch referrer data
 */
export function useAnalyticsReferrers(
  websiteId: string,
  dateRange?: DateRange,
  limit = 10
) {
  return useQuery({
    queryKey: ['analytics', 'referrers', websiteId, dateRange, limit],
    queryFn: () => fetchAnalyticsData<ReferrersResponse>(
      '/analytics/referrers', 
      websiteId, 
      dateRange, 
      { limit }
    ),
    ...defaultQueryOptions
  });
}

/**
 * Hook to fetch device information
 */
export function useAnalyticsDevices(
  websiteId: string,
  dateRange?: DateRange,
  limit = 10
) {
  return useQuery({
    queryKey: ['analytics', 'devices', websiteId, dateRange, limit],
    queryFn: () => fetchAnalyticsData<DevicesResponse>(
      '/analytics/devices', 
      websiteId, 
      dateRange, 
      { limit }
    ),
    ...defaultQueryOptions
  });
}

/**
 * Hook to fetch location data
 */
export function useAnalyticsLocations(
  websiteId: string,
  dateRange?: DateRange,
  limit = 10
) {
  return useQuery({
    queryKey: ['analytics', 'locations', websiteId, dateRange, limit],
    queryFn: () => fetchAnalyticsData<LocationsResponse>(
      '/analytics/locations', 
      websiteId, 
      dateRange, 
      { limit }
    ),
    ...defaultQueryOptions
  });
}

/**
 * Hook to fetch sessions list
 */
export function useAnalyticsSessions(
  websiteId: string,
  dateRange?: DateRange,
  limit = 20
) {
  return useQuery({
    queryKey: ['analytics', 'sessions', websiteId, dateRange, limit],
    queryFn: ({ signal }) => fetchAnalyticsData<SessionsResponse>(
      '/analytics/sessions', 
      websiteId, 
      dateRange, 
      { limit },
      signal
    ),
    ...defaultQueryOptions
  });
}

/**
 * Hook to fetch details for a specific session
 */
export function useAnalyticsSessionDetails(
  websiteId: string,
  sessionId: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['analytics', 'session', websiteId, sessionId],
    queryFn: ({ signal }) => fetchAnalyticsData<SessionDetailsResponse>(
      `/analytics/session/${sessionId}`, 
      websiteId, 
      undefined, 
      undefined,
      signal
    ),
    ...defaultQueryOptions,
    enabled: enabled && !!sessionId
  });
}

/**
 * Hook to fetch visitor profiles
 */
export function useAnalyticsProfiles(
  websiteId: string,
  dateRange?: DateRange,
  limit = 50
) {
  return useQuery({
    queryKey: ['analytics', 'profiles', websiteId, dateRange, limit],
    queryFn: ({ signal }) => fetchAnalyticsData<ProfilesResponse>(
      '/analytics/profiles', 
      websiteId, 
      dateRange, 
      { limit },
      signal
    ),
    ...defaultQueryOptions
  });
}

/**
 * Hook to fetch website error analytics
 */
export function useWebsiteErrors(
  websiteId: string,
  dateRange?: DateRange,
  limit = 50,
  page = 1
) {
  return useQuery({
    queryKey: ['analytics', 'errors', websiteId, dateRange, limit, page],
    queryFn: ({ signal }) => fetchAnalyticsData<ErrorsData>(
      '/analytics/errors', 
      websiteId, 
      dateRange, 
      { limit, page },
      signal
    ),
    ...defaultQueryOptions
  });
} 