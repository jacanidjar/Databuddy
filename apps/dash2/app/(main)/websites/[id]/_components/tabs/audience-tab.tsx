"use client";

import { useMemo, useEffect } from "react";
// Import TanStack Table types
import type { ColumnDef, CellContext } from "@tanstack/react-table";

import { DistributionChart } from "@/components/charts/distribution-chart";
import { DataTable } from "@/components/analytics/data-table";
import { useWebsiteAnalytics } from "@/hooks/use-analytics";
import { formatDistributionData, groupBrowserData } from "../utils/analytics-helpers";
import type { FullTabProps } from "../utils/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Laptop, Smartphone, Tablet, Monitor, HelpCircle, Languages, Wifi, WifiOff } from 'lucide-react';
import { getLanguageName } from "@databuddy/shared";
import { 
  processDeviceData, 
  processBrowserData, 
  TechnologyIcon,
  PercentageBadge,
  type TechnologyTableEntry,
} from "../utils/technology-helpers";

interface DeviceTypeEntry {
  device_type: string;
  device_brand: string;
  device_model: string;
  visitors: number;
  pageviews: number;
}

// Define types for table data
interface TimezoneEntry {
  timezone: string;
  visitors: number;
  pageviews: number;
}

interface CountryEntry {
  country: string;
  visitors: number;
  pageviews: number;
  // Potentially other fields from API if any
}

interface ConnectionEntry extends TechnologyTableEntry {
  category: 'connection';
}

interface LanguageEntry extends TechnologyTableEntry {
  category: 'language';
}

// Helper function to get browser icon
const getBrowserIcon = (browser: string): string => {
  const browserLower = browser.toLowerCase();
  if (browserLower.includes('chrome')) return '/icons/chrome.svg';
  if (browserLower.includes('firefox')) return '/icons/firefox.svg';
  if (browserLower.includes('safari')) return '/icons/safari.svg';
  if (browserLower.includes('edge')) return '/icons/edge.svg';
  if (browserLower.includes('opera')) return '/icons/opera.svg';
  if (browserLower.includes('ie') || browserLower.includes('internet explorer')) return '/icons/ie.svg';
  if (browserLower.includes('samsung')) return '/icons/samsung.svg';
  return '/icons/browser.svg';
};

// Helper function to get connection icon
const getConnectionIcon = (connection: string) => {
  const connectionLower = connection.toLowerCase();
  if (!connection || connection === 'Unknown') return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
  if (connectionLower.includes('wifi')) return <Wifi className="h-4 w-4 text-green-500" />;
  if (connectionLower.includes('4g')) return <Smartphone className="h-4 w-4 text-blue-500" />;
  if (connectionLower.includes('5g')) return <Smartphone className="h-4 w-4 text-purple-500" />;
  if (connectionLower.includes('3g')) return <Smartphone className="h-4 w-4 text-yellow-500" />;
  if (connectionLower.includes('2g')) return <Smartphone className="h-4 w-4 text-orange-500" />;
  if (connectionLower.includes('ethernet')) return <Laptop className="h-4 w-4 text-blue-400" />;
  if (connectionLower.includes('cellular')) return <Smartphone className="h-4 w-4 text-blue-500" />;
  if (connectionLower.includes('offline')) return <WifiOff className="h-4 w-4 text-red-500" />;
  return <Globe className="h-4 w-4 text-primary" />;
};

// Helper function to get device icon
const getDeviceIcon = (deviceType: string) => {
  const typeLower = deviceType.toLowerCase();
  if (!deviceType || deviceType === 'Unknown') return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
  if (typeLower.includes('mobile') || typeLower.includes('phone')) return <Smartphone className="h-4 w-4 text-blue-500" />;
  if (typeLower.includes('tablet')) return <Tablet className="h-4 w-4 text-purple-500" />;
  if (typeLower.includes('desktop')) return <Monitor className="h-4 w-4 text-green-500" />;
  if (typeLower.includes('laptop')) return <Laptop className="h-4 w-4 text-amber-500" />;
  if (typeLower.includes('tv')) return <Monitor className="h-4 w-4 text-red-500" />;
  return <Laptop className="h-4 w-4 text-primary" />;
};

// Helper to create a column with optional cell and meta
function col<T>(accessorKey: keyof T, header: string, cell?: (info: CellContext<T, unknown>) => React.ReactNode, meta?: object): ColumnDef<T, unknown> {
  return {
    accessorKey: accessorKey as string,
    header,
    ...(cell && { cell }),
    ...(meta && { meta }),
  };
}

export function WebsiteAudienceTab({
  websiteId,
  dateRange,
  websiteData,
  isRefreshing,
  setIsRefreshing
}: FullTabProps) {
  // Fetch analytics data
  const {
    analytics,
    loading,
    refetch
  } = useWebsiteAnalytics(websiteId, dateRange);

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

  // Technology data processing using the same helpers as overview
  const processedDeviceData = useMemo(() => 
    processDeviceData(analytics.device_types || []), 
    [analytics.device_types]
  );

  const processedBrowserData = useMemo(() => 
    processBrowserData(analytics.browser_versions || []), 
    [analytics.browser_versions]
  );

  // Process connection types data with percentages
  const processedConnectionData = useMemo((): ConnectionEntry[] => {
    if (!analytics.connection_types?.length) return [];
    
    const totalVisitors = analytics.connection_types.reduce((sum, item) => sum + item.visitors, 0);
    
    return analytics.connection_types.map(item => ({
      name: item.connection_type || 'Unknown',
      visitors: item.visitors,
      percentage: totalVisitors > 0 ? Math.round((item.visitors / totalVisitors) * 100) : 0,
      iconComponent: getConnectionIcon(item.connection_type || ''),
      category: 'connection' as const
    })).sort((a, b) => b.visitors - a.visitors);
  }, [analytics.connection_types]);

  // Process language data with percentages
  const processedLanguageData = useMemo((): TechnologyTableEntry[] => {
    if (!analytics.languages?.length) return [];
    
    // Group languages by base language code (before the hyphen)
    const languageGroups: Record<string, number> = {};
    
    for (const item of analytics.languages) {
      const baseLanguage = item.language.split('-')[0]; // Get 'en' from 'en-US'
      languageGroups[baseLanguage] = (languageGroups[baseLanguage] || 0) + (item.visitors || 0);
    }
    
    const totalVisitors = Object.values(languageGroups).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(languageGroups)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([baseLanguage, visitors]) => {
        const languageName = getLanguageName(baseLanguage);
        
        return {
          name: languageName !== 'Unknown' ? languageName : baseLanguage.toUpperCase(),
          visitors,
          percentage: totalVisitors > 0 ? Math.round((visitors / totalVisitors) * 100) : 0,
          iconComponent: <Languages className="h-4 w-4 text-primary" />,
          category: 'language'
        };
      });
  }, [analytics.languages]);

  // Combine loading states
  const isLoading = loading.summary || isRefreshing;

  // Technology table columns
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

  const connectionColumns = useMemo((): ColumnDef<ConnectionEntry, unknown>[] => [
    col<ConnectionEntry>('name', 'Connection Type', (info) => {
      const entry = info.row.original;
      return (
        <div className="flex items-center gap-3">
          {entry.iconComponent}
          <span className="font-medium">{entry.name}</span>
        </div>
      );
    }),
    col<ConnectionEntry>('visitors', 'Visitors'),
    col<ConnectionEntry>('percentage', 'Share', (info) => {
      const percentage = info.getValue() as number;
      return <PercentageBadge percentage={percentage} />;
    }),
  ], []);

  const languageColumns = useMemo((): ColumnDef<TechnologyTableEntry, unknown>[] => [
    col<TechnologyTableEntry>('name', 'Language', (info) => {
      const entry = info.row.original;
      return (
        <div className="flex items-center gap-3">
          {entry.iconComponent}
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Audience Insights</h2>
        <p className="text-sm text-muted-foreground">Detailed information about your website visitors</p>
      </div>
      
      {/* Technology Breakdown Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
      
      {/* Connection and Language Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataTable 
          data={processedConnectionData}
          columns={connectionColumns}
          title="Connection Types"
          description="Visitors by network connection"
          isLoading={isLoading}
          initialPageSize={8}
          minHeight={200}
          showSearch={false}
        />
        
        <DataTable 
          data={processedLanguageData}
          columns={languageColumns}
          title="Languages"
          description="Visitors by preferred language"
          isLoading={isLoading}
          initialPageSize={8}
          minHeight={200}
          showSearch={false}
        />
      </div>
      
      {/* Timezones */}
      <div className="rounded-xl border shadow-sm">
        <DataTable 
          data={analytics.timezones?.map(item => ({ // Ensure data maps to TimezoneEntry
            timezone: item.timezone,
            visitors: item.visitors,
            pageviews: item.pageviews
          })) || []}
          columns={useMemo((): ColumnDef<TimezoneEntry, unknown>[] => [
            col<TimezoneEntry>('timezone', 'Timezone', (info) => (
              <span className="font-medium">{info.getValue() as string || 'Unknown'}</span>
            )),
            col<TimezoneEntry>('visitors', 'Visitors'),
            col<TimezoneEntry>('pageviews', 'Pageviews'),
          ], [])}
          title="Timezones"
          description="Visitors by timezone"
          isLoading={isLoading}
          initialPageSize={10}
        />
      </div>
      
      {/* Countries with flags */}
      <div className="rounded-xl border shadow-sm">
        <DataTable 
          data={analytics.countries?.map(item => ({ // Ensure data maps to CountryEntry
            country: item.country,
            visitors: item.visitors,
            pageviews: item.pageviews
          })) || []}
          columns={useMemo((): ColumnDef<CountryEntry, unknown>[] => [
            col<CountryEntry>('country', 'Country', (info) => {
              const countryCode = info.getValue() as string;
              return (
                <div className="flex items-center gap-2">
                  {countryCode ? (
                    <div className="w-5 h-4 relative overflow-hidden rounded-sm bg-muted">
                      <img 
                        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode.toUpperCase()}.svg`} 
                        alt={countryCode}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            const helpCircle = parent.querySelector('.fallback-icon');
                            if (helpCircle) (helpCircle as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div className="fallback-icon w-5 h-4 items-center justify-center rounded-sm bg-muted" style={{display: 'none'}}>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-5 h-4 flex items-center justify-center rounded-sm bg-muted">
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className="font-medium">{countryCode || 'Unknown'}</span>
                </div>
              );
            }),
            col<CountryEntry>('visitors', 'Visitors', undefined),
            col<CountryEntry>('pageviews', 'Pageviews', undefined),
          ], [])}
          title="Geographic Distribution"
          description="Visitors by location"
          isLoading={isLoading}
        />
      </div>
      
      {/* Screen Resolutions */}
      <div className="rounded-xl border shadow-sm bg-card">
        <div className="px-3 pt-3 pb-0.5">
          <h3 className="text-xs font-medium">Screen Resolutions</h3>
          <p className="text-xs text-muted-foreground">Visitors by screen size</p>
        </div>
        
        <div className="p-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !analytics.screen_resolutions?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">No screen resolution data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.screen_resolutions?.slice(0, 6).map((item, index) => {
                const [width, height] = item.screen_resolution.split('x').map(Number);
                const isValid = !Number.isNaN(width) && !Number.isNaN(height);
                
                // Calculate percentage of total visitors
                const totalVisitors = analytics.screen_resolutions?.reduce(
                  (sum, item) => sum + item.visitors, 0) || 1;
                const percentage = Math.round((item.visitors / totalVisitors) * 100);
                
                // Determine device type based on resolution
                let deviceType = "Unknown";
                if (isValid) {
                  if (width <= 480) {
                    deviceType = "Mobile";
                  } else if (width <= 1024) {
                    deviceType = "Tablet";
                  } else if (width <= 1440) {
                    deviceType = "Laptop";
                  } else {
                    deviceType = "Desktop";
                  }
                }
                
                // Create aspect ratio-correct box
                const aspectRatio = isValid ? width / height : 16/9;
                
                return (
                  <div 
                    key={item.screen_resolution} 
                    className="border rounded-lg p-4 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium">{item.screen_resolution}</div>
                        <div className="text-xs text-muted-foreground">{deviceType}</div>
                      </div>
                    </div>
                    
                    {/* Screen visualization with perspective */}
                    <div className="flex justify-center mb-4 h-40 relative perspective">
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg shadow-md flex items-center justify-center transform-gpu"
                        style={{
                          width: `${Math.min(250, 120 * Math.sqrt(aspectRatio))}px`,
                          height: `${Math.min(200, 120 / Math.sqrt(aspectRatio))}px`,
                          transformStyle: 'preserve-3d',
                          transform: 'rotateY(-10deg) rotateX(5deg)',
                          margin: 'auto'
                        }}
                      >
                        {isValid && (
                          <div 
                            className="text-xs font-mono text-primary font-medium transform-gpu" 
                            style={{ transform: 'translateZ(5px)' }}
                          >
                            {width} × {height}
                          </div>
                        )}
                        
                        {/* Screen content simulation */}
                        <div 
                          className="absolute inset-2 rounded opacity-80"
                          style={{ transform: 'translateZ(2px)' }}
                        />
                        
                        {/* Screen UI elements simulation */}
                        <div 
                          className="absolute top-3 left-3 right-3 h-2 bg-primary/20 rounded-full"
                          style={{ transform: 'translateZ(3px)' }}
                        />
                        <div 
                          className="absolute top-7 left-3 w-1/2 h-2 bg-primary/15 rounded-full"
                          style={{ transform: 'translateZ(3px)' }}
                        />
                        <div 
                          className="absolute bottom-6 inset-x-3 grid grid-cols-3 gap-1"
                          style={{ transform: 'translateZ(3px)' }}
                        >
                          <div className="h-2 bg-primary/10 rounded-full" />
                          <div className="h-2 bg-primary/15 rounded-full" />
                          <div className="h-2 bg-primary/10 rounded-full" />
                        </div>
                      </div>
                      
                      {/* Stand or base for desktop/laptop */}
                      {(deviceType === "Desktop" || deviceType === "Laptop") && (
                        <div 
                          className="absolute bottom-0 w-1/3 h-4 bg-muted rounded-b-lg mx-auto"
                          style={{
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderTop: 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      )}
                    </div>
                    
                    <div className="mt-auto w-full">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.visitors} visitors</span>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-right">
                        {item.count} pageviews
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {!isLoading && analytics.screen_resolutions && analytics.screen_resolutions.length > 6 && (
            <div className="text-xs text-center text-muted-foreground mt-4">
              Showing top 6 of {analytics.screen_resolutions.length} screen resolutions
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 