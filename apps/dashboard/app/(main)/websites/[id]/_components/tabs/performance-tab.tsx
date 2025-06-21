"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { Monitor, Smartphone, Zap, MapPin, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Question } from "@phosphor-icons/react";
import { DataTable } from "@/components/analytics/data-table";
import { useEnhancedPerformanceData } from "@/hooks/use-dynamic-query";
import type { FullTabProps } from "../utils/types";
import { BrowserIcon, OSIcon } from "@/components/icon";
import { CountryFlag } from "@/components/analytics/icons/CountryFlag";
import { calculatePerformanceSummary } from "@/lib/performance-utils";
import type { PerformanceEntry, PerformanceSummary } from "@/types/performance";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function getPerformanceRating(score: number): { rating: string; className: string } {
  if (score >= 90) return { rating: "Excellent", className: "text-green-500" };
  if (score >= 70) return { rating: "Good", className: "text-green-500" };
  if (score >= 50) return { rating: "Moderate", className: "text-yellow-500" };
  if (score >= 30) return { rating: "Poor", className: "text-orange-500" };
  return { rating: "Very Poor", className: "text-red-500" };
}

function formatPerformanceTime(value: number): string {
  if (!value || value === 0) return "N/A";

  // Use consistent formatting: show ms for values < 1000, seconds for >= 1000
  // Always round to remove decimal places for cleaner display
  if (value < 1000) {
    return `${Math.round(value)}ms`;
  } else {
    // Round to 1 decimal place for seconds, but remove .0 if it's a whole number
    const seconds = Math.round(value / 100) / 10; // This gives us 1 decimal place with rounding
    return seconds % 1 === 0 ? `${seconds.toFixed(0)}s` : `${seconds.toFixed(1)}s`;
  }
}

function PerformanceMetricCell({ value, type = 'time' }: { value?: number; type?: 'time' | 'cls' }) {
  if (!value || value === 0) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  let formatted: string;
  let colorClass: string;
  let showIcon = false;

  if (type === 'cls') {
    formatted = value.toFixed(3);
    colorClass = value < 0.1 ? "text-green-600" : value < 0.25 ? "text-yellow-600" : "text-red-400";
    showIcon = value < 0.1 || value >= 0.25;
  } else {
    formatted = formatPerformanceTime(value);
    colorClass = value < 1000 ? "text-green-600" : value < 3000 ? "text-yellow-600" : "text-red-400";
    showIcon = value < 1000 || value >= 3000;
  }

  return (
    <div className="flex items-center gap-1">
      <span className={colorClass}>{formatted}</span>
      {showIcon && value < (type === 'cls' ? 0.1 : 1000) && <CheckCircle className="h-3 w-3 text-green-600" />}
      {showIcon && value >= (type === 'cls' ? 0.25 : 3000) && <AlertTriangle className="h-3 w-3 text-red-400" />}
    </div>
  );
}

function PerformanceSummaryCard({
  summary,
  activeFilter,
  onFilterChange
}: {
  summary: PerformanceSummary;
  activeFilter: 'fast' | 'slow' | null;
  onFilterChange: (filter: 'fast' | 'slow' | null) => void;
}) {
  const performanceColor = useMemo(() => {
    if (summary.performanceScore >= 80) return 'text-green-600';
    if (summary.performanceScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }, [summary.performanceScore]);

  const avgLoadTimeColor = useMemo(() => {
    if (summary.avgLoadTime < 1500) return 'text-green-600';
    if (summary.avgLoadTime < 3000) return 'text-yellow-600';
    return 'text-red-600';
  }, [summary.avgLoadTime]);

  const ratingInfo = getPerformanceRating(summary.performanceScore);

  const handleFastPagesClick = () => {
    onFilterChange(activeFilter === 'fast' ? null : 'fast');
  };

  const handleSlowPagesClick = () => {
    onFilterChange(activeFilter === 'slow' ? null : 'slow');
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-lg border bg-background">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Performance Score</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Question className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>A weighted score based on page load times and visitor counts.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className={`text-2xl font-bold ${performanceColor}`}>
          {summary.performanceScore}/100
        </div>
        <div className={`text-sm font-medium ${ratingInfo.className}`}>{ratingInfo.rating}</div>
      </div>

      <div className="p-4 rounded-lg border bg-background">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-muted-foreground">Avg Load Time</span>
        </div>
        <div className={`text-2xl font-bold ${avgLoadTimeColor}`}>
          {formatPerformanceTime(summary.avgLoadTime)}
        </div>
      </div>

      <div
        className={`p-4 rounded-lg border bg-background cursor-pointer transition-all hover:shadow-md ${activeFilter === 'fast' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20' : 'hover:bg-muted/50'
          }`}
        onClick={handleFastPagesClick}
      >
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-muted-foreground">Fast Pages</span>
          {activeFilter === 'fast' && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded">
              Active
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-green-600">
          {summary.fastPages}
          <span className="text-sm text-muted-foreground ml-1">
            ({Math.round((summary.fastPages / summary.totalPages) * 100)}%)
          </span>
        </div>
      </div>

      <div
        className={`p-4 rounded-lg border bg-background cursor-pointer transition-all hover:shadow-md ${activeFilter === 'slow' ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/20' : 'hover:bg-muted/50'
          }`}
        onClick={handleSlowPagesClick}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-muted-foreground">Slow Pages</span>
          {activeFilter === 'slow' && (
            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded">
              Active
            </span>
          )}
        </div>
        <div className="text-2xl font-bold text-red-600">
          {summary.slowPages}
          <span className="text-sm text-muted-foreground ml-1">
            ({Math.round((summary.slowPages / summary.totalPages) * 100)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

const performanceColumns = [
  {
    id: 'visitors',
    accessorKey: 'visitors',
    header: 'Visitors',
    cell: ({ getValue }: any) => getValue()?.toLocaleString() ?? '0'
  },
  {
    id: 'avg_load_time',
    accessorKey: 'avg_load_time',
    header: 'Load Time',
    cell: ({ row }: any) => <PerformanceMetricCell value={row.original.avg_load_time} />
  },
  {
    id: 'avg_ttfb',
    accessorKey: 'avg_ttfb',
    header: 'TTFB',
    cell: ({ row }: any) => <PerformanceMetricCell value={row.original.avg_ttfb} />
  },
  {
    id: 'avg_dom_ready_time',
    accessorKey: 'avg_dom_ready_time',
    header: 'DOM Ready',
    cell: ({ row }: any) => <PerformanceMetricCell value={row.original.avg_dom_ready_time} />
  },
  {
    id: 'avg_render_time',
    accessorKey: 'avg_render_time',
    header: 'Render Time',
    cell: ({ row }: any) => <PerformanceMetricCell value={row.original.avg_render_time} />
  },

];

const createNameColumn = (header: string, iconRenderer?: (name: string) => React.ReactNode, nameFormatter?: (name: string) => string) => ({
  id: 'name',
  accessorKey: 'name',
  header,
  cell: ({ getValue }: any) => {
    const name = getValue() as string;
    const displayName = nameFormatter ? nameFormatter(name) : name;
    return (
      <div className="flex items-center gap-2">
        {iconRenderer && iconRenderer(name)}
        <span className="truncate">{displayName}</span>
      </div>
    );
  }
});

// Optimized data normalization with single pass
const normalizeAndSortData = (data: any[]): PerformanceEntry[] => {
  if (!data?.length) return [];

  return data
    .map((item) => ({
      name: item.name || 'Unknown',
      visitors: item.visitors || 0,
      avg_load_time: item.avg_load_time || 0,
      avg_ttfb: item.avg_ttfb,
      avg_dom_ready_time: item.avg_dom_ready_time,
      avg_render_time: item.avg_render_time,
      avg_fcp: item.avg_fcp,
      avg_lcp: item.avg_lcp,
      avg_cls: item.avg_cls,
    }))
    .sort((a, b) => a.avg_load_time - b.avg_load_time);
};

export function WebsitePerformanceTab({
  websiteId,
  dateRange,
  isRefreshing,
  setIsRefreshing
}: FullTabProps) {
  const [activeFilter, setActiveFilter] = useState<'fast' | 'slow' | null>(null);

  const {
    results: performanceResults,
    isLoading,
    refetch,
    error
  } = useEnhancedPerformanceData(websiteId, dateRange);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) {
      try {
        await refetch();
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing, refetch, setIsRefreshing]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Filter function for fast/slow pages
  const filterPagesByPerformance = useCallback((pages: PerformanceEntry[], filter: 'fast' | 'slow' | null) => {
    if (!filter) return pages;

    return pages.filter(page => {
      const loadTime = page.avg_load_time || 0;
      if (filter === 'fast') {
        return loadTime < 1500; // Fast pages are under 1.5 seconds
      } else {
        return loadTime >= 3000; // Slow pages are 3+ seconds
      }
    });
  }, []);

  // Optimized data processing with reduced operations
  const processedData = useMemo(() => {
    if (!performanceResults?.length) {
      return {
        pages: [],
        countries: [],
        devices: [],
        browsers: [],
        operating_systems: [],
        regions: []
      };
    }

    // Single pass through results to extract and process all data
    const dataMap = new Map();

    performanceResults.forEach(result => {
      if (result.success && result.data) {
        Object.entries(result.data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            dataMap.set(key, normalizeAndSortData(value));
          }
        });
      }
    });

    const allPages = dataMap.get('slow_pages') || [];
    const filteredPages = filterPagesByPerformance(allPages, activeFilter);

    return {
      pages: filteredPages,
      allPages: allPages, // Keep unfiltered for summary calculation
      countries: dataMap.get('performance_by_country') || [],
      devices: dataMap.get('performance_by_device') || [],
      browsers: dataMap.get('performance_by_browser') || [],
      operating_systems: dataMap.get('performance_by_os') || [],
      regions: dataMap.get('performance_by_region') || [],
    };
  }, [performanceResults, activeFilter, filterPagesByPerformance]);

  // Optimized performance summary calculation
  const performanceSummary = useMemo((): PerformanceSummary => {
    return calculatePerformanceSummary(processedData.allPages || []);
  }, [processedData.allPages]);

  // Optimized tabs generation with stable references
  const tabs = useMemo(() => {
    const tabConfigs = [
      {
        id: 'pages',
        label: 'Pages',
        data: processedData.pages,
        iconRenderer: undefined,
        nameFormatter: (name: string) => {
          try {
            return name.startsWith('http') ? new URL(name).pathname : name;
          } catch {
            return name.startsWith('/') ? name : `/${name}`;
          }
        }
      },
      {
        id: 'countries',
        label: 'Countries',
        data: processedData.countries,
        iconRenderer: (name: string) => <CountryFlag country={name} size={16} />,
        nameFormatter: undefined
      },
      {
        id: 'regions',
        label: 'Regions',
        data: processedData.regions,
        iconRenderer: () => <MapPin className="h-4 w-4 text-primary" />,
        nameFormatter: undefined
      },
      {
        id: 'devices',
        label: 'Device Types',
        data: processedData.devices,
        iconRenderer: (name: string) => {
          const device = name.toLowerCase();
          return device.includes('mobile') || device.includes('phone') ?
            <Smartphone className="h-4 w-4 text-blue-500" /> :
            device.includes('tablet') ?
              <Monitor className="h-4 w-4 text-purple-500" /> :
              <Monitor className="h-4 w-4 text-gray-500" />;
        },
        nameFormatter: undefined
      },
      {
        id: 'browsers',
        label: 'Browsers',
        data: processedData.browsers,
        iconRenderer: (name: string) => <BrowserIcon name={name} size="sm" />,
        nameFormatter: undefined
      },
      {
        id: 'operating_systems',
        label: 'Operating Systems',
        data: processedData.operating_systems,
        iconRenderer: (name: string) => <OSIcon name={name} size="sm" />,
        nameFormatter: undefined
      },
    ];

    return tabConfigs.map(config => ({
      id: config.id,
      label: config.label,
      data: config.data.map((item: PerformanceEntry, i: number) => ({
        ...item,
        _uniqueKey: `${config.id}-${i}`
      })),
      columns: [
        createNameColumn(
          config.label.slice(0, -1), // Remove 's' from plural
          config.iconRenderer,
          config.nameFormatter
        ),
        ...performanceColumns
      ],
    }));
  }, [processedData]);

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load performance data. Please try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/20 rounded border">
        <div className="flex gap-2 items-start mb-4">
          <Zap className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
          <div>
            <p className="font-medium text-foreground mb-1">Performance Overview</p>
            <p className="text-xs text-muted-foreground">
              Core Web Vitals and performance metrics.
              <span className="text-green-600 font-medium">Good</span>,
              <span className="text-yellow-600 font-medium ml-1">Needs Improvement</span>,
              <span className="text-red-600 font-medium ml-1">Poor</span> ratings.
            </p>
          </div>
        </div>

        {!isLoading && (processedData.allPages?.length > 0 || processedData.pages.length > 0) && (
          <PerformanceSummaryCard
            summary={performanceSummary}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}
      </div>

      <DataTable
        tabs={tabs}
        title="Performance Analysis"
        description={
          activeFilter
            ? `Showing ${activeFilter} pages only. Detailed performance metrics across pages, locations, devices, and browsers`
            : "Detailed performance metrics across pages, locations, devices, and browsers"
        }
        isLoading={isLoading || isRefreshing}
        minHeight={500}
      />
    </div>
  );
} 