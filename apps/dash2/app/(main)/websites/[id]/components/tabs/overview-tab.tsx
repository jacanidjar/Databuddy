"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Globe, 
  Users, 
  MousePointer, 
  AlertTriangle,
  BarChart,
  Timer,
  LayoutDashboard
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";

import { StatCard } from "@/components/analytics/stat-card";
import { MetricsChart } from "@/components/charts/metrics-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { DataTable } from "@/components/analytics/data-table";
import { useWebsiteAnalytics } from "@/hooks/use-analytics";
import { 
  formatDateByGranularity, 
  handleDataRefresh, 
  createMetricToggles,
  formatDistributionData,
  groupBrowserData,
  formatDomainLink,
  getColorVariant,
  calculatePercentChange
} from "../utils/analytics-helpers";
import { MetricToggles, ExternalLinkButton, BORDER_RADIUS } from "../utils/ui-components";
import type { FullTabProps, MetricPoint } from "../utils/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import type { ColumnDef, CellContext } from "@tanstack/react-table";
import { ReferrerSourceCell, type ReferrerSourceCellData } from "@/components/atomic/ReferrerSourceCell";
import { PageLinkCell, type PageLinkCellData } from "@/components/atomic/PageLinkCell";

// Define trend calculation return type
interface TrendCalculation {
  visitors?: number;
  sessions?: number;
  pageviews?: number;
  bounce_rate?: number;
  session_duration?: number;
  pages_per_session?: number;
}

// Define type for referrer row data from analytics API
interface ReferrerItem {
  referrer: string;
  visitors: number;
  pageviews: number;
  type?: string;
  name?: string;      // This is the primary display name, maps to 'value' if accessorKey is 'name'
  domain?: string;    // Used for favicon
}

// Re-define type for top pages data
interface TopPageData {
  path: string;
  pageviews: number;
  visitors: number;
  [key: string]: any; 
}

const MIN_PREVIOUS_SESSIONS_FOR_TREND = 5;
const MIN_PREVIOUS_VISITORS_FOR_TREND = 5;
const MIN_PREVIOUS_PAGEVIEWS_FOR_TREND = 10;

// Add UnauthorizedAccessError component
function UnauthorizedAccessError() {
  const router = useRouter();
  
  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800/50 w-full max-w-lg mx-auto my-8">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Access Denied</CardTitle>
            <CardDescription className="mt-1">
              You do not have permission to view this website's analytics.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-5">
          If you believe this is an error, please contact the website owner or your administrator.
        </p>
        <Button 
          onClick={() => router.push("/websites")}
          className="w-full sm:w-auto"
          variant="destructive"
        >
          Return to My Websites
        </Button>
      </CardContent>
    </Card>
  );
}

export function WebsiteOverviewTab({
  websiteId,
  dateRange,
  websiteData,
  isRefreshing,
  setIsRefreshing,
}: FullTabProps) {
  // Local state for adjusted granularity
  const [adjustedDateRange, setAdjustedDateRange] = useState(dateRange);
  
  // Fetch analytics data
  const { analytics, loading, error, refetch } = useWebsiteAnalytics(websiteId, adjustedDateRange);

  // Chart metric visibility
  const [visibleMetrics, setVisibleMetrics] = useState<Record<string, boolean>>({
    pageviews: true,
    visitors: true,
    sessions: false,
  });
  
  // Toggle metric visibility
  const toggleMetric = useCallback((metric: string) => {
    setVisibleMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  }, []);

  // Handle refresh
  useEffect(() => {
    let isMounted = true;
    
    if (isRefreshing) {
      const doRefresh = async () => {
        try {
          await refetch();
        } catch (error) {
          console.error("Failed to refresh data:", error);
        } finally {
          if (isMounted) {
            setIsRefreshing(false);
          }
        }
      };
      
      doRefresh();
    }
    
    return () => {
      isMounted = false;
    };
  }, [isRefreshing, refetch, setIsRefreshing]);

  // Set granularity based on date range
  useEffect(() => {
    // Update the adjusted date range with the granularity from props
    // This granularity is already set based on the date range in the parent component
    const newAdjustedRange = {
      ...dateRange,
      granularity: dateRange.granularity || 'daily'
    };
    
    setAdjustedDateRange(newAdjustedRange);
  }, [dateRange]);

  // Define the structure for device type entries from the API
  interface DeviceTypeEntry {
    device_type: string;
    device_brand: string;
    device_model: string;
    visitors: number;
    pageviews: number;
  }

  // Combine loading states into one - component is loading if:
  // 1. The API is loading
  // 2. We are refreshing data
  const isLoading = loading.summary || isRefreshing;

  // Show unauthorized access error
  if (error instanceof Error && error.message === 'UNAUTHORIZED_ACCESS') {
    return <UnauthorizedAccessError />;
  }

  // Format data for UI
  const deviceData = useMemo(() => { 
    if (!analytics.device_types?.length) return [];

    const processedDeviceData = (analytics.device_types as DeviceTypeEntry[]).map((item) => {
      let name = item.device_type || 'Unknown Type';
      const brand = item.device_brand || 'Unknown';
      const model = item.device_model || 'Unknown';

      if (brand !== 'Unknown' && brand.toLowerCase() !== 'generic') {
        name += ` - ${brand}`;
        if (model !== 'Unknown' && model.toLowerCase() !== brand.toLowerCase()) {
          name += ` ${model}`;
        }
      } else if (model !== 'Unknown') {
        // If brand is Unknown/generic but model is known
        name += ` - ${model}`;
      }
      return {
        ...item, // Keep original fields like visitors, pageviews
        descriptiveName: name 
      };
    });
    
    // Assuming formatDistributionData groups by the provided key ('descriptiveName')
    // and sums a metric like 'visitors' or 'count' from the items.
    return formatDistributionData(processedDeviceData, 'descriptiveName');
  }, [analytics.device_types]);

  const browserData = useMemo(() => 
    groupBrowserData(analytics.browser_versions), 
    [analytics.browser_versions]
  );

  const topPagesColumns = useMemo((): ColumnDef<TopPageData, any>[] => [
    {
      accessorKey: 'path',
      header: 'Page',
      cell: (info: CellContext<TopPageData, string>) => (
        <PageLinkCell 
          path={info.getValue()} 
          websiteDomain={websiteData?.domain} 
        />
      )
    },
    {
      accessorKey: 'pageviews',
      header: 'Views',
    },
    {
      accessorKey: 'visitors',
      header: 'Visitors',
    },
  ], [websiteData?.domain]);

  const referrerColumns = useMemo((): ColumnDef<ReferrerItem, any>[] => [
    {
      accessorKey: 'name',
      header: 'Source',
      cell: (info: CellContext<ReferrerItem, string | undefined>) => {
        const cellData: ReferrerSourceCellData = info.row.original;
        return <ReferrerSourceCell {...cellData} />;
      }
    },
    {
      accessorKey: 'visitors',
      header: 'Visitors',
    },
    {
      accessorKey: 'pageviews',
      header: 'Views',
    },
  ], []);

  // Format chart data
  const chartData = useMemo(() => {
    if (!analytics.events_by_date?.length) return [];
    
    return analytics.events_by_date.map((event: any) => {
      // Start with the date
      const filtered: any = { 
        date: formatDateByGranularity(event.date, adjustedDateRange.granularity) 
      };
      
      // Map the metrics from the API data
      if (visibleMetrics.pageviews) {
        filtered.pageviews = event.pageviews;
      }
      
      if (visibleMetrics.visitors) {
        // Use visitors field from events_by_date
        filtered.visitors = event.visitors || event.unique_visitors || 0;
      }
      
      if (visibleMetrics.sessions) {
        filtered.sessions = event.sessions;
      }
      
      return filtered;
    });
  }, [analytics.events_by_date, visibleMetrics, adjustedDateRange.granularity]);

  // Date range info for warning message
  const dateFrom = useMemo(() => new Date(dateRange.start_date), [dateRange.start_date]);
  const dateTo = useMemo(() => new Date(dateRange.end_date), [dateRange.end_date]);
  const dateDiff = useMemo(() => differenceInDays(dateTo, dateFrom), [dateTo, dateFrom]);

  // Metric colors
  const metricColors = {
    pageviews: 'blue-500',
    visitors: 'green-500',
    sessions: 'purple-500'
  };

  // Calculate trends
  const calculateTrends = useMemo<TrendCalculation>(() => {
    if (!analytics.events_by_date?.length || analytics.events_by_date.length < 2) {
      return {}; 
    }

    const events = [...analytics.events_by_date].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const midpoint = Math.floor(events.length / 2);
    const previousPeriodData = events.slice(0, midpoint);
    const currentPeriodData = events.slice(midpoint);

    if (previousPeriodData.length === 0 || currentPeriodData.length === 0) {
      return {};
    }

    const sumCountMetric = (period: MetricPoint[], field: keyof Pick<MetricPoint, 'pageviews' | 'visitors' | 'sessions'>) =>
      period.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);

    const currentSumVisitors = sumCountMetric(currentPeriodData, 'visitors');
    const currentSumSessions = sumCountMetric(currentPeriodData, 'sessions');
    const currentSumPageviews = sumCountMetric(currentPeriodData, 'pageviews');
    const currentPagesPerSession = currentSumSessions > 0 ? currentSumPageviews / currentSumSessions : 0;

    const previousSumVisitors = sumCountMetric(previousPeriodData, 'visitors');
    const previousSumSessions = sumCountMetric(previousPeriodData, 'sessions');
    const previousSumPageviews = sumCountMetric(previousPeriodData, 'pageviews');
    const previousPagesPerSession = previousSumSessions > 0 ? previousSumPageviews / previousSumSessions : 0;

    const averageRateMetric = (period: MetricPoint[], field: keyof Pick<MetricPoint, 'bounce_rate' | 'avg_session_duration'>) => {
      const validEntries = period.map(item => Number(item[field])).filter(value => !Number.isNaN(value) && value > 0);
      if (validEntries.length === 0) return 0;
      return validEntries.reduce((acc, value) => acc + value, 0) / validEntries.length;
    };

    const currentBounceRateAvg = averageRateMetric(currentPeriodData, 'bounce_rate');
    const previousBounceRateAvg = averageRateMetric(previousPeriodData, 'bounce_rate');
    const currentSessionDurationAvg = averageRateMetric(currentPeriodData, 'avg_session_duration');
    const previousSessionDurationAvg = averageRateMetric(previousPeriodData, 'avg_session_duration');

    const calculateTrendPercentage = (current: number, previous: number, minimumBase = 0) => {
      if (previous < minimumBase && !(previous === 0 && current === 0) ) {
        return undefined; // Base is too small for a meaningful trend, unless both are 0
      }
      if (previous === 0) {
        return current === 0 ? 0 : undefined; // 0% change if both 0, else undefined for growth from 0 base
      }
      const change = calculatePercentChange(current, previous);
      return Math.max(-100, Math.min(1000, Math.round(change)));
    };

    // Determine if trends for session-dependent metrics are meaningful
    const canShowSessionBasedTrend = previousSumSessions >= MIN_PREVIOUS_SESSIONS_FOR_TREND;

    return {
      visitors: calculateTrendPercentage(currentSumVisitors, previousSumVisitors, MIN_PREVIOUS_VISITORS_FOR_TREND),
      sessions: calculateTrendPercentage(currentSumSessions, previousSumSessions, MIN_PREVIOUS_SESSIONS_FOR_TREND),
      pageviews: calculateTrendPercentage(currentSumPageviews, previousSumPageviews, MIN_PREVIOUS_PAGEVIEWS_FOR_TREND),
      pages_per_session: canShowSessionBasedTrend 
        ? calculateTrendPercentage(currentPagesPerSession, previousPagesPerSession) 
        : undefined,
      bounce_rate: canShowSessionBasedTrend 
        ? calculateTrendPercentage(currentBounceRateAvg, previousBounceRateAvg) 
        : undefined,
      session_duration: canShowSessionBasedTrend 
        ? calculateTrendPercentage(currentSessionDurationAvg, previousSessionDurationAvg) 
        : undefined,
    };
  }, [analytics.events_by_date]);

  return (
    <div className="space-y-4">
      {/* Key metrics */}
      <div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard 
            title="UNIQUE VISITORS"
            value={analytics.summary?.unique_visitors || 0}
            icon={Users}
            description={`${analytics.today?.visitors || 0} today`}
            isLoading={isLoading}
            variant="default"
            trend={calculateTrends.visitors}
            trendLabel={calculateTrends.visitors !== undefined ? "vs previous period" : undefined}
            className="h-full"
          />
          <StatCard 
            title="SESSIONS"
            value={analytics.summary?.sessions || 0}
            icon={BarChart}
            description={`${analytics.today?.sessions || 0} today`}
            isLoading={isLoading}
            variant="default"
            trend={calculateTrends.sessions}
            trendLabel={calculateTrends.sessions !== undefined ? "vs previous period" : undefined}
            className="h-full"
          />
          <StatCard 
            title="PAGE VIEWS"
            value={analytics.summary?.pageviews || 0}
            icon={Globe}
            description={`${analytics.today?.pageviews || 0} today`}
            isLoading={isLoading}
            variant="default"
            trend={calculateTrends.pageviews}
            trendLabel={calculateTrends.pageviews !== undefined ? "vs previous period" : undefined}
            className="h-full"
          />
          <StatCard 
            title="PAGES/SESSION"
            value={analytics.summary ? 
              (analytics.summary.sessions > 0 ? 
                (analytics.summary.pageviews / analytics.summary.sessions).toFixed(1) : 
                '0'
              ) : '0'
            }
            icon={LayoutDashboard}
            isLoading={isLoading}
            variant="default"
            trend={calculateTrends.pages_per_session}
            trendLabel={calculateTrends.pages_per_session !== undefined ? "vs previous period" : undefined}
            className="h-full"
          />
          <StatCard 
            title="BOUNCE RATE"
            value={analytics.summary?.bounce_rate_pct || '0%'}
            icon={MousePointer}
            isLoading={isLoading}
            trend={calculateTrends.bounce_rate}
            trendLabel={calculateTrends.bounce_rate !== undefined ? "vs previous period" : undefined}
            variant={getColorVariant(analytics.summary?.bounce_rate || 0, 70, 50)}
            invertTrend={true}
            className="h-full"
          />
          <StatCard 
            title="AVG. SESSION"
            value={analytics.summary?.avg_session_duration_formatted || '0s'}
            icon={Timer}
            isLoading={isLoading}
            variant="default"
            trend={calculateTrends.session_duration}
            trendLabel={calculateTrends.session_duration !== undefined ? "vs previous period" : undefined}
            className="h-full"
          />
        </div>
      </div>

      {/* Visitor Trends */}
      <div className="rounded-xl border shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Visitor Trends</h2>
            <p className="text-sm text-muted-foreground">
              Website performance metrics over time
              {adjustedDateRange.granularity === 'hourly' ? ' (hourly data)' : ' (daily data)'}
            </p>
            {adjustedDateRange.granularity === 'hourly' && dateDiff > 7 && (
              <div className="mt-1 flex items-center text-amber-600 gap-1 text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span>Showing hourly data for more than 7 days may affect performance</span>
              </div>
            )}
          </div>
          
          <MetricToggles 
            metrics={visibleMetrics} 
            onToggle={toggleMetric} 
            colors={metricColors}
          />
        </div>
        <div className="">
          <MetricsChart 
            data={chartData} 
            isLoading={isLoading} 
            height={350}
            // title="Traffic Overview"
            // description="Website performance metrics over time"
          />
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
            <DistributionChart 
              data={deviceData} 
              isLoading={isLoading}
              title="Device Types"
              description="Visitors by device type"
              height={250}
            />
          
            <DataTable 
              data={analytics.top_referrers}
              columns={referrerColumns}
              title="Top Referrers"
              description="Sources of your traffic"
              isLoading={isLoading}
              initialPageSize={5}
              minHeight={230}
            />
        </div>
        
        {/* Right column */}
        <div className="space-y-4">
            <DistributionChart 
              data={browserData} 
              isLoading={isLoading}
              title="Browsers"
              description="Visitors by browser"
              height={250}
            />
          
            <DataTable 
              data={analytics.top_pages}
              columns={topPagesColumns}
              title="Top Pages"
              description="Most viewed content"
              isLoading={isLoading}
              initialPageSize={5}
              minHeight={230}
            />
        </div>
      </div>
    </div>
  );
} 