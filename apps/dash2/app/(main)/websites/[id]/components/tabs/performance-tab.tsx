"use client";

import { useState, useEffect } from "react";
import { Zap, Monitor, AlertCircle, HelpCircle, BarChart } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/analytics/stat-card";
import { useWebsiteAnalytics } from "@/hooks/use-analytics";
import { getColorVariant, PERFORMANCE_THRESHOLDS } from "../utils/analytics-helpers";
import type { FullTabProps } from "../utils/types";
import { EmptyState, MetricTooltip } from "../utils/ui-components";
import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceData {
  avg_load_time: number;
  avg_load_time_formatted: string;
  avg_ttfb: number;
  avg_ttfb_formatted: string;
  avg_dom_ready_time: number;
  avg_dom_ready_time_formatted: string;
  avg_render_time: number;
  avg_render_time_formatted: string;
  avg_fcp: number | null;
  avg_fcp_formatted: string | null;
  avg_lcp: number | null;
  avg_lcp_formatted: string | null;
  avg_cls: number | null;
  avg_cls_formatted: string | null;
}

// Skeleton for the performance tab content
function PerformanceTabSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-52" />
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {/* Using a more unique key prefix to satisfy linter for static list */}
        {["skel1", "skel2", "skel3", "skel4"].map((keySuffix) => (
          <Card key={`perf-skeleton-${keySuffix}`} className="overflow-hidden">
            <div className="p-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-7 w-20 mt-2" />
              <Skeleton className="h-3 w-16 mt-2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function WebsitePerformanceTab({
  websiteId,
  dateRange,
  websiteData,
  isRefreshing,
  setIsRefreshing
}: FullTabProps) {
  const [activeTab, setActiveTab] = useState<string>("core");
  
  const {
    analytics,
    loading,
    error,
    refetch
  } = useWebsiteAnalytics(websiteId, dateRange);

  useEffect(() => {
    let isMounted = true;
    if (isRefreshing) {
      const doRefresh = async () => {
        try {
          await refetch();
        } catch (err) {
          console.error("Failed to refresh performance data:", err);
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

  // The `loading` object from `useWebsiteAnalytics` has a `summary` flag and potentially others.
  // We are primarily concerned with `analytics.performance` which should be available if `loading.summary` is false and `analytics` itself is populated.
  const isLoadingData = loading.summary || isRefreshing;

  if (isLoadingData) {
    return <PerformanceTabSkeleton />;
  }

  // Adjusted error handling: Check if error exists and if it specifically has a summary message
  // or if it's a general string error. The hook might return error for specific data points (e.g., error.summary, error.performance)
  // or a general error string.
  const hasError = error && (typeof error === 'string' || (typeof error === 'object' && error.summary));

  if (hasError) {
    return (
      <div className="pt-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10" />}
          title="Error loading performance data"
          description={typeof error === 'string' ? error : (error as any)?.summary || "Unable to load performance metrics. Please try refreshing."}
          action={null}
        />
      </div>
    );
  }
  
  if (!analytics || !analytics.performance) {
    return (
      <div className="pt-6">
        <EmptyState
          icon={<BarChart className="h-10 w-10" />}
          title="No performance data available"
          description="We haven't collected any performance metrics for this website yet or for the selected period. Data will appear as users visit your site."
          action={null}
        />
      </div>
    );
  }

  const performance = analytics.performance as PerformanceData;

  const hasMeaningfulPerformanceData = 
    performance.avg_load_time > 0 ||
    performance.avg_ttfb > 0 ||
    performance.avg_dom_ready_time > 0 ||
    performance.avg_render_time > 0 ||
    (performance.avg_fcp !== null && performance.avg_fcp > 0) ||
    (performance.avg_lcp !== null && performance.avg_lcp > 0) ||
    (performance.avg_cls !== null && performance.avg_cls >= 0);

  if (!hasMeaningfulPerformanceData) {
     return (
      <div className="pt-6">
        <EmptyState
          icon={<BarChart className="h-10 w-10" />}
          title="Performance data is zero"
          description="Performance metrics have been collected, but all values are currently zero for the selected period. This might be due to very low traffic or specific configurations."
          action={null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Performance Metrics</h2>
          <TabsList className="bg-muted/60">
            <TabsTrigger value="core">Core Metrics</TabsTrigger>
            <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="core" className="pt-1">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <MetricTooltip metricKey="load_time" label="Page Load Time">
              <StatCard 
                title="Page Load Time"
                value={performance.avg_load_time_formatted}
                icon={Zap}
                isLoading={isLoadingData}
                variant={getColorVariant(performance.avg_load_time, PERFORMANCE_THRESHOLDS.load_time.average, PERFORMANCE_THRESHOLDS.load_time.good)}
                className="shadow-sm h-full"
                description="Total time to load the page"
              />
            </MetricTooltip>
            
            <MetricTooltip metricKey="ttfb" label="Time to First Byte">
              <StatCard 
                title="Time to First Byte"
                value={performance.avg_ttfb_formatted}
                icon={Zap}
                isLoading={isLoadingData}
                variant={getColorVariant(performance.avg_ttfb, PERFORMANCE_THRESHOLDS.ttfb.average, PERFORMANCE_THRESHOLDS.ttfb.good)}
                className="shadow-sm h-full"
                description="Server response time"
              />
            </MetricTooltip>
            
            <MetricTooltip metricKey="dom_ready" label="DOM Ready Time">
              <StatCard 
                title="DOM Ready"
                value={performance.avg_dom_ready_time_formatted}
                icon={Zap}
                isLoading={isLoadingData}
                variant={getColorVariant(performance.avg_dom_ready_time, PERFORMANCE_THRESHOLDS.dom_ready.average, PERFORMANCE_THRESHOLDS.dom_ready.good)}
                className="shadow-sm h-full"
                description="Time until DOM is ready"
              />
            </MetricTooltip>
            
            <MetricTooltip metricKey="render_time" label="Render Time">
              <StatCard 
                title="Render Time"
                value={performance.avg_render_time_formatted}
                icon={Zap}
                isLoading={isLoadingData}
                variant={getColorVariant(performance.avg_render_time, PERFORMANCE_THRESHOLDS.render_time.average, PERFORMANCE_THRESHOLDS.render_time.good)}
                className="shadow-sm h-full"
                description="Time until content renders"
              />
            </MetricTooltip>
          </div>
        </TabsContent>

        <TabsContent value="web-vitals" className="pt-1">
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <MetricTooltip metricKey="fcp" label="First Contentful Paint">
              <StatCard 
                title="First Contentful Paint"
                value={performance.avg_fcp === null ? 'N/A' : performance.avg_fcp_formatted || '0 ms'}
                icon={Monitor}
                isLoading={isLoadingData}
                variant={performance.avg_fcp === null ? 'default' : getColorVariant(performance.avg_fcp, PERFORMANCE_THRESHOLDS.fcp.average, PERFORMANCE_THRESHOLDS.fcp.good)}
                className="shadow-sm h-full"
                description="When first content is painted"
              />
            </MetricTooltip>
            
            <MetricTooltip metricKey="lcp" label="Largest Contentful Paint">
              <StatCard 
                title="Largest Contentful Paint"
                value={performance.avg_lcp === null ? 'N/A' : performance.avg_lcp_formatted || '0 ms'}
                icon={Monitor}
                isLoading={isLoadingData}
                variant={performance.avg_lcp === null ? 'default' : getColorVariant(performance.avg_lcp, PERFORMANCE_THRESHOLDS.lcp.average, PERFORMANCE_THRESHOLDS.lcp.good)}
                className="shadow-sm h-full"
                description="When largest content is painted"
              />
            </MetricTooltip>
            
            <MetricTooltip metricKey="cls" label="Cumulative Layout Shift">
              <StatCard 
                title="Cumulative Layout Shift"
                value={performance.avg_cls === null ? 'N/A' : performance.avg_cls_formatted || '0'}
                icon={Monitor}
                isLoading={isLoadingData}
                variant={performance.avg_cls === null ? 'default' : getColorVariant(performance.avg_cls, PERFORMANCE_THRESHOLDS.cls.average, PERFORMANCE_THRESHOLDS.cls.good)}
                className="shadow-sm h-full"
                description="Visual stability"
              />
            </MetricTooltip>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="p-4 text-sm text-muted-foreground border-muted bg-muted/10">
        <div className="flex gap-2 items-start">
          <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground mb-1">About Performance Metrics</p>
            <p>These metrics show the average values across all visitors. Faster loading times improve user experience and SEO ranking. <span className="text-green-600 dark:text-green-400 font-medium">Green</span> indicates good performance, <span className="text-yellow-600 dark:text-yellow-400 font-medium">yellow</span> needs improvement, and <span className="text-red-600 dark:text-red-400 font-medium">red</span> indicates poor performance.</p>
          </div>
        </div>
      </Card>
    </div>
  );
} 