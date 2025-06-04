"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Globe, 
  Users, 
  MousePointer, 
  AlertTriangle,
  BarChart,
  Timer,
  LayoutDashboard,
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

import { StatCard } from "@/components/analytics/stat-card";
import { MetricsChart } from "@/components/charts/metrics-chart";
import { DataTable } from "@/components/analytics/data-table";
import { useWebsiteAnalytics, type PageData } from "@/hooks/use-analytics";
import { 
  formatDateByGranularity, 
  formatDistributionData,
  groupBrowserData,
  getColorVariant,
  calculatePercentChange,
  isTrackingNotSetup
} from "../utils/analytics-helpers";
import { MetricToggles } from "../utils/ui-components";
import type { FullTabProps, MetricPoint } from "../utils/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import type { ColumnDef, CellContext } from "@tanstack/react-table";
import { ReferrerSourceCell, type ReferrerSourceCellData } from "@/components/atomic/ReferrerSourceCell";
import { PageLinkCell } from "@/components/atomic/PageLinkCell";
import { 
  processDeviceData, 
  processBrowserData, 
  inferOperatingSystems,
  TechnologyIcon,
  PercentageBadge,
  type TechnologyTableEntry,
  type DeviceTypeEntry,
} from "../utils/technology-helpers";

// Types
interface TrendCalculation {
  visitors?: number;
  sessions?: number;
  pageviews?: number;
  bounce_rate?: number;
  session_duration?: number;
  pages_per_session?: number;
}

interface ReferrerItem {
  referrer: string;
  visitors: number;
  pageviews: number;
  type?: string;
  name?: string;
  domain?: string;
}

interface ChartDataPoint {
  date: string;
  pageviews?: number;
  visitors?: number;
  sessions?: number;
  [key: string]: unknown;
}

// Constants
const MIN_PREVIOUS_SESSIONS_FOR_TREND = 5;
const MIN_PREVIOUS_VISITORS_FOR_TREND = 5;
const MIN_PREVIOUS_PAGEVIEWS_FOR_TREND = 10;


// Helper function to create column definitions
function col<T>(accessorKey: keyof T, header: string, cell?: (info: CellContext<T, unknown>) => React.ReactNode, meta?: object): ColumnDef<T, unknown> {
  return {
    accessorKey: accessorKey as string,
    header,
    ...(cell && { cell }),
    ...(meta && { meta }),
  };
}

// UnauthorizedAccessError component
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
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  
  const { analytics, loading, error, refetch } = useWebsiteAnalytics(websiteId, dateRange);

  const [visibleMetrics, setVisibleMetrics] = useState<Record<string, boolean>>({
    pageviews: true,
    visitors: true,
    sessions: false,
  });
  
  const toggleMetric = useCallback((metric: string) => {
    setVisibleMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  }, []);

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

  const isLoading = loading.summary || isRefreshing;

  if (error instanceof Error && error.message === 'UNAUTHORIZED_ACCESS') {
    return <UnauthorizedAccessError />;
  }

  // Process data
  const deviceData = useMemo(() => 
    formatDistributionData(analytics.device_types?.map((item: DeviceTypeEntry) => {
      let name = item.device_type || 'Unknown Type';
      const brand = item.device_brand || 'Unknown';
      const model = item.device_model || 'Unknown';

      if (brand !== 'Unknown' && brand.toLowerCase() !== 'generic') {
        name += ` - ${brand}`;
        if (model !== 'Unknown' && model.toLowerCase() !== brand.toLowerCase()) {
          name += ` ${model}`;
        }
      } else if (model !== 'Unknown') {
        name += ` - ${model}`;
      }
      return {
        ...item,
        descriptiveName: name 
      };
    }) || [], 'descriptiveName'), 
    [analytics.device_types]
  );

  const browserData = useMemo(() => 
    groupBrowserData(analytics.browser_versions), 
    [analytics.browser_versions]
  );

  const topPagesColumns = useMemo((): ColumnDef<PageData, unknown>[] => [
    {
      accessorKey: 'path',
      header: 'Page',
      cell: (info: CellContext<PageData, unknown>) => (
        <PageLinkCell 
          path={info.getValue() as string} 
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
    {
      accessorKey: 'percentage',
      header: 'Share',
      cell: (info: CellContext<PageData, unknown>) => {
        const percentage = info.getValue() as number;
        return <PercentageBadge percentage={percentage} />;
      },
    },
  ], [websiteData?.domain]);

  const referrerColumns = useMemo((): ColumnDef<ReferrerItem, unknown>[] => [
    {
      accessorKey: 'name',
      header: 'Source',
      cell: (info: CellContext<ReferrerItem, unknown>) => {
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
    {
      accessorKey: 'percentage',
      header: 'Share',
      cell: (info: CellContext<ReferrerItem, unknown>) => {
        const percentage = info.getValue() as number;
        return <PercentageBadge percentage={percentage} />;
      },
    },
  ], []);

  const chartData = useMemo(() => {
    if (!analytics.events_by_date?.length) return [];
    
    return analytics.events_by_date.map((event: MetricPoint): ChartDataPoint => {
      const filtered: ChartDataPoint = { 
        date: formatDateByGranularity(event.date, dateRange.granularity) 
      };
      
      if (visibleMetrics.pageviews) {
        filtered.pageviews = event.pageviews;
      }
      
      if (visibleMetrics.visitors) {
        filtered.visitors = event.visitors || event.unique_visitors || 0;
      }
      
      if (visibleMetrics.sessions) {
        filtered.sessions = event.sessions;
      }
      
      return filtered;
    });
  }, [analytics.events_by_date, visibleMetrics, dateRange.granularity]);

  // Process top pages with percentage calculations
  const processedTopPages = useMemo(() => {
    if (!analytics.top_pages?.length) return [];
    
    const totalPageviews = analytics.top_pages.reduce((sum, page) => sum + (page.pageviews || 0), 0);
    
    return analytics.top_pages.map(page => ({
      ...page,
      percentage: totalPageviews > 0 ? Math.round((page.pageviews / totalPageviews) * 100) : 0
    }));
  }, [analytics.top_pages]);

  // Process top referrers with percentage calculations
  const processedTopReferrers = useMemo(() => {
    if (!analytics.top_referrers?.length) return [];
    
    const totalVisitors = analytics.top_referrers.reduce((sum, referrer) => sum + (referrer.visitors || 0), 0);
    
    return analytics.top_referrers.map(referrer => ({
      ...referrer,
      percentage: totalVisitors > 0 ? Math.round((referrer.visitors / totalVisitors) * 100) : 0
    }));
  }, [analytics.top_referrers]);

  const dateFrom = useMemo(() => new Date(dateRange.start_date), [dateRange.start_date]);
  const dateTo = useMemo(() => new Date(dateRange.end_date), [dateRange.end_date]);
  const dateDiff = useMemo(() => differenceInDays(dateTo, dateFrom), [dateTo, dateFrom]);

  const metricColors = {
    pageviews: 'blue-500',
    visitors: 'green-500',
    sessions: 'purple-500'
  };

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
        return undefined;
      }
      if (previous === 0) {
        return current === 0 ? 0 : undefined;
      }
      const change = calculatePercentChange(current, previous);
      return Math.max(-100, Math.min(1000, Math.round(change)));
    };

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

  // Technology data processing
  const processedDeviceData = useMemo(() => 
    processDeviceData(analytics.device_types || []), 
    [analytics.device_types]
  );

  const processedBrowserData = useMemo(() => 
    processBrowserData(analytics.browser_versions || []), 
    [analytics.browser_versions]
  );

  const processedOSData = useMemo(() => 
    inferOperatingSystems(analytics.device_types || [], analytics.browser_versions || []), 
    [analytics.device_types, analytics.browser_versions]
  );

  // Technology table columns with enhanced styling
  const deviceColumns = useMemo((): ColumnDef<TechnologyTableEntry, unknown>[] => [
    col<TechnologyTableEntry>('name', 'Device Type', (info) => {
      const entry = info.row.original;
      return (
        <div className="flex items-center gap-3">
          <TechnologyIcon entry={entry} size="md" />
          <span className="font-medium">{entry.name}</span>
        </div>
      );
    }),
    col<TechnologyTableEntry>('visitors', 'Visitors'),
    col<TechnologyTableEntry>('percentage', 'Share', (info) => {
      const percentage = info.getValue() as number;
      return <PercentageBadge percentage={percentage} />;
    }),
  ], []);

  const browserColumns = useMemo((): ColumnDef<TechnologyTableEntry, unknown>[] => [
    col<TechnologyTableEntry>('name', 'Browser', (info) => {
      const entry = info.row.original;
      return (
        <div className="flex items-center gap-3">
          <TechnologyIcon entry={entry} size="md" />
          <span className="font-medium">{entry.name}</span>
        </div>
      );
    }),
    col<TechnologyTableEntry>('visitors', 'Visitors'),
    col<TechnologyTableEntry>('percentage', 'Share', (info) => {
      const percentage = info.getValue() as number;
      return <PercentageBadge percentage={percentage} />;
    }),
  ], []);

  const osColumns = useMemo((): ColumnDef<TechnologyTableEntry, unknown>[] => [
    col<TechnologyTableEntry>('name', 'Operating System', (info) => {
      const entry = info.row.original;
      return (
        <div className="flex items-center gap-3">
          <TechnologyIcon entry={entry} size="md" />
          <span className="font-medium">{entry.name}</span>
        </div>
      );
    }),
    col<TechnologyTableEntry>('visitors', 'Visitors'),
    col<TechnologyTableEntry>('percentage', 'Share', (info) => {
      const percentage = info.getValue() as number;
      return <PercentageBadge percentage={percentage} />;
    }),
  ], []);

  return (
    <div className="space-y-6">
      {/* Key metrics */}
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

      {/* Visitor Trends */}
      <div className="rounded-xl border shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Visitor Trends</h2>
            <p className="text-sm text-muted-foreground">
              Website performance metrics over time
              {dateRange.granularity === 'hourly' ? ' (hourly data)' : ' (daily data)'}
            </p>
            {dateRange.granularity === 'hourly' && dateDiff > 7 && (
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
        <div>
          <MetricsChart 
            data={chartData}
            isLoading={isLoading} 
            height={350}
          />
        </div>
      </div>

      {/* Content Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataTable 
          data={processedTopReferrers}
          columns={referrerColumns}
          title="Top Referrers"
          description="Sources of your traffic"
          isLoading={isLoading}
          initialPageSize={7}
          minHeight={230}
        />
        
        <DataTable 
          data={processedTopPages}
          columns={topPagesColumns}
          title="Top Pages"
          description="Most viewed content"
          isLoading={isLoading}
          initialPageSize={7}
          minHeight={230}
        />
      </div>

      {/* Technology Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DataTable 
          data={processedDeviceData}
          columns={deviceColumns}
          title="Device Types"
          description="Visitors by device type"
          isLoading={isLoading}
          initialPageSize={8}
          minHeight={200}
          showSearch={false}
        />
        
        <DataTable 
          data={processedBrowserData}
          columns={browserColumns}
          title="Browsers"
          description="Visitors by browser"
          isLoading={isLoading}
          initialPageSize={8}
          minHeight={200}
          showSearch={false}
        />
        
        <DataTable 
          data={processedOSData}
          columns={osColumns}
          title="Operating Systems"
          description="Visitors by operating system"
          isLoading={isLoading}
          initialPageSize={8}
          minHeight={200}
          showSearch={false}
        />
      </div>
    </div>
  );
} 