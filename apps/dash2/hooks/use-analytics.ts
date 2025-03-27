import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface AnalyticsSummary {
  pageviews: number;
  visitors: number;
  sessions: number;
  unique_visitors: number;
  bounce_rate: number;
  avg_session_duration: number;
}

export interface TodayStats {
  pageviews: number;
  visitors: number;
  sessions: number;
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface PageData {
  path: string;
  pageviews: number;
  visitors: number;
  avg_time_on_page: number;
}

export interface ReferrerData {
  referrer: string;
  visitors: number;
  pageviews: number;
}

export interface TrendData {
  date: string;
  week: string;
  month: string;
  pageviews: number;
  visitors: number;
  sessions: number;
  bounce_rate: number;
  avg_session_duration: number;
}

export interface DeviceData {
  browsers: Array<{
    browser: string;
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

export type TimeInterval = 'day' | 'week' | 'month';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Unified analytics hook that fetches all the data
 * @param websiteId The ID of the website to fetch analytics for
 * @param dateRange The date range to fetch analytics for
 * @param options Additional options
 */
export function useWebsiteAnalytics(
  websiteId: string,
  dateRange: DateRange,
  options?: {
    trendsInterval?: TimeInterval;
    trendsLimit?: number;
    pagesLimit?: number;
    referrersLimit?: number;
    deviceLimit?: number;
    locationLimit?: number;
  }
) {
  // Set defaults for options
  const {
    trendsInterval = 'day',
    trendsLimit = 30,
    pagesLimit = 10,
    referrersLimit = 10,
    deviceLimit = 10,
    locationLimit = 10
  } = options || {};

  // Memoize the date range to ensure stable query keys
  const memoizedDateRange = useMemo(() => dateRange, [dateRange.start_date, dateRange.end_date]);
  
  // Helper to build query params
  const buildParams = useCallback((additionalParams?: Record<string, string | number>) => {
    const params = new URLSearchParams({
      website_id: websiteId,
      start_date: memoizedDateRange.start_date,
      end_date: memoizedDateRange.end_date,
      ...additionalParams
    });
    
    return params.toString();
  }, [websiteId, memoizedDateRange]);
  
  // Helper to fetch data with error handling
  const fetchData = useCallback(async (endpoint: string, params?: Record<string, string | number>) => {
    const url = `${API_BASE_URL}${endpoint}?${buildParams(params)}`;
    
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${endpoint}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || `Failed to fetch data from ${endpoint}`);
    }
    
    return data;
  }, [buildParams]);

  // Summary query
  const summaryQuery = useQuery({
    queryKey: ['analytics', 'summary', websiteId, memoizedDateRange],
    queryFn: async () => {
      const data = await fetchData('/analytics/summary');
      return {
        summary: data.summary as AnalyticsSummary,
        today: data.today as TodayStats,
        date_range: data.date_range as DateRange,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Trends query
//   const trendsQuery = useQuery({
//     queryKey: ['analytics', 'trends', websiteId, trendsInterval, memoizedDateRange, trendsLimit],
//     queryFn: async () => {
//       const data = await fetchData('/analytics/trends', {
//         interval: trendsInterval,
//         limit: trendsLimit.toString()
//       });
//       return {
//         data: data.data as TrendData[],
//         date_range: data.date_range as DateRange,
//         interval: data.interval as TimeInterval,
//       };
//     },
//     staleTime: 5 * 60 * 1000,
//   });
  
  // Pages query
//   const pagesQuery = useQuery({
//     queryKey: ['analytics', 'pages', websiteId, memoizedDateRange, pagesLimit],
//     queryFn: async () => {
//       const data = await fetchData('/analytics/pages', {
//         limit: pagesLimit.toString()
//       });
//       return {
//         data: data.data as PageData[],
//         date_range: data.date_range as DateRange,
//       };
//     },
//     staleTime: 5 * 60 * 1000,
//   });
  
  // Referrers query
//   const referrersQuery = useQuery({
//     queryKey: ['analytics', 'referrers', websiteId, memoizedDateRange, referrersLimit],
//     queryFn: async () => {
//       const data = await fetchData('/analytics/referrers', {
//         limit: referrersLimit.toString()
//       });
//       return {
//         data: data.data as ReferrerData[],
//         date_range: data.date_range as DateRange,
//       };
//     },
//     staleTime: 5 * 60 * 1000,
//   });
  
  // Devices query
//   const devicesQuery = useQuery({
//     queryKey: ['analytics', 'devices', websiteId, memoizedDateRange, deviceLimit],
//     queryFn: async () => {
//       const data = await fetchData('/analytics/devices', {
//         limit: deviceLimit.toString()
//       });
//       return {
//         browsers: data.browsers || [],
//         os: data.os || [],
//         device_types: data.device_types || [],
//         date_range: data.date_range as DateRange,
//       };
//     },
//     staleTime: 5 * 60 * 1000,
//   });
  
  // Locations query
//   const locationsQuery = useQuery({
//     queryKey: ['analytics', 'locations', websiteId, memoizedDateRange, locationLimit],
//     queryFn: async () => {
//       const data = await fetchData('/analytics/locations', {
//         limit: locationLimit.toString()
//       });
//       return {
//         countries: data.countries || [],
//         cities: data.cities || [],
//         date_range: data.date_range as DateRange,
//       };
//     },
//     staleTime: 5 * 60 * 1000,
//   });
  
  // Combined loading and error states
  const isLoading = summaryQuery.isLoading 
  const isError = summaryQuery.isError 
  
  // Return all the data and loading states
  return {
    // Data
    analytics: {
      summary: summaryQuery.data?.summary,
      today: summaryQuery.data?.today,
    },
    // Individual loading states
    loading: {
      summary: summaryQuery.isLoading,
      any: isLoading
    },
    // Individual error states
    error: {
      summary: summaryQuery.isError,
      any: isError
    },
    // Original queries (if needed for refetching or other operations)
    queries: {
      summary: summaryQuery
    },
    // Refetch all queries
    refetch: () => {
      summaryQuery.refetch();
    }
  };
}

/**
 * Hook to fetch summary analytics data
 */
export function useAnalyticsSummary(websiteId: string, dateRange?: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'summary', websiteId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        website_id: websiteId,
      });
      
      if (dateRange?.start_date) {
        params.append('start_date', dateRange.start_date);
      }
      
      if (dateRange?.end_date) {
        params.append('end_date', dateRange.end_date);
      }
      
      const response = await fetch(`${API_BASE_URL}/analytics/summary?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics summary');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analytics summary');
      }
      
      return {
        summary: data.summary as AnalyticsSummary,
        today: data.today as TodayStats,
        date_range: data.date_range as DateRange,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch visitor trends over time
 */
export function useAnalyticsTrends(
  websiteId: string, 
  interval: TimeInterval = 'day',
  dateRange?: DateRange,
  limit: number = 30
) {
  return useQuery({
    queryKey: ['analytics', 'trends', websiteId, interval, dateRange, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        website_id: websiteId,
        interval,
        limit: limit.toString(),
      });
      
      if (dateRange?.start_date) {
        params.append('start_date', dateRange.start_date);
      }
      
      if (dateRange?.end_date) {
        params.append('end_date', dateRange.end_date);
      }
      
      const response = await fetch(`${API_BASE_URL}/analytics/trends?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics trends');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analytics trends');
      }
      
      return {
        data: data.data as TrendData[],
        date_range: data.date_range as DateRange,
        interval: data.interval as TimeInterval,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch top pages data
 */
export function useAnalyticsPages(
  websiteId: string,
  dateRange?: DateRange,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['analytics', 'pages', websiteId, dateRange, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        website_id: websiteId,
        limit: limit.toString(),
      });
      
      if (dateRange?.start_date) {
        params.append('start_date', dateRange.start_date);
      }
      
      if (dateRange?.end_date) {
        params.append('end_date', dateRange.end_date);
      }
      
      const response = await fetch(`${API_BASE_URL}/analytics/pages?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch page analytics');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch page analytics');
      }
      
      return {
        data: data.data as PageData[],
        date_range: data.date_range as DateRange,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch referrer data
 */
export function useAnalyticsReferrers(
  websiteId: string,
  dateRange?: DateRange,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['analytics', 'referrers', websiteId, dateRange, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        website_id: websiteId,
        limit: limit.toString(),
      });
      
      if (dateRange?.start_date) {
        params.append('start_date', dateRange.start_date);
      }
      
      if (dateRange?.end_date) {
        params.append('end_date', dateRange.end_date);
      }
      
      const response = await fetch(`${API_BASE_URL}/analytics/referrers?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch referrer analytics');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch referrer analytics');
      }
      
      return {
        data: data.data as ReferrerData[],
        date_range: data.date_range as DateRange,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch device information
 */
export function useAnalyticsDevices(
  websiteId: string,
  dateRange?: DateRange,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['analytics', 'devices', websiteId, dateRange, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        website_id: websiteId,
        limit: limit.toString(),
      });
      
      if (dateRange?.start_date) {
        params.append('start_date', dateRange.start_date);
      }
      
      if (dateRange?.end_date) {
        params.append('end_date', dateRange.end_date);
      }
      
      const response = await fetch(`${API_BASE_URL}/analytics/devices?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch device analytics');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch device analytics');
      }
      
      return {
        browsers: data.browsers || [],
        os: data.os || [],
        device_types: data.device_types || [],
        date_range: data.date_range as DateRange,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch location data
 */
export function useAnalyticsLocations(
  websiteId: string,
  dateRange?: DateRange,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['analytics', 'locations', websiteId, dateRange, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        website_id: websiteId,
        limit: limit.toString(),
      });
      
      if (dateRange?.start_date) {
        params.append('start_date', dateRange.start_date);
      }
      
      if (dateRange?.end_date) {
        params.append('end_date', dateRange.end_date);
      }
      
      const response = await fetch(`${API_BASE_URL}/analytics/locations?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch location analytics');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch location analytics');
      }
      
      return {
        countries: data.countries || [],
        cities: data.cities || [],
        date_range: data.date_range as DateRange,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 