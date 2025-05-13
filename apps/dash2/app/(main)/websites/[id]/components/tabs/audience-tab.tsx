"use client";

import { useMemo, useEffect } from "react";

import { DistributionChart } from "@/components/charts/distribution-chart";
import { DataTable } from "@/components/analytics/data-table";
import { useWebsiteAnalytics } from "@/hooks/use-analytics";
import { formatDistributionData, groupBrowserData } from "../utils/analytics-helpers";
import type { RefreshableTabProps } from "../utils/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Laptop, Smartphone, Tablet, Monitor, HelpCircle, Languages, Wifi, WifiOff } from 'lucide-react';
import { getLanguageName } from "@databuddy/shared";

// Define the structure for API entries (mirroring overview-tab.tsx)
interface ApiBrowserVersionEntry {
  browser_name?: string;
  browser?: string;
  browser_version?: string;
  version?: string;
  os_name?: string;
  os_version?: string;
  count: number;
  visitors: number;
}

interface DeviceTypeEntry {
  device_type: string;
  device_brand: string;
  device_model: string;
  visitors: number;
  pageviews: number;
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

export function WebsiteAudienceTab({
  websiteId,
  dateRange,
  isRefreshing,
  setIsRefreshing
}: RefreshableTabProps) {
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

  // Prepare device data with descriptive names and icons
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
        name += ` - ${model}`;
      }
      
      // Add icon property 
      const icon = getDeviceIcon(item.device_type);
      
      return {
        ...item,
        descriptiveName: name,
        icon
      };
    });
    
    return formatDistributionData(processedDeviceData, 'descriptiveName');
  }, [analytics.device_types]);

  // Prepare browser data with icons
  const browserData = useMemo(() => {
    const data = groupBrowserData(analytics.browser_versions);
    
    // Add icon property to each browser
    return data.map(item => ({
      ...item,
      icon: getBrowserIcon(item.name),
    }));
  }, [analytics.browser_versions]);
  // Prepare connection types data with icons
  const connectionData = useMemo(() => {
    if (!analytics.connection_types?.length) return [];
    
    const processedData = analytics.connection_types.map(item => ({
      ...item,
      connectionName: item.connection_type || 'Unknown',
      icon: getConnectionIcon(item.connection_type || '')
    }));
    
    return formatDistributionData(processedData, 'connectionName');
  }, [analytics.connection_types]);

  // Prepare language data with better formatting
  const languageData = useMemo(() => {
    if (!analytics.languages?.length) return [];
    
    const processedData = analytics.languages.map(item => ({
      ...item,
      formattedLanguage: getLanguageName(item.language),
      icon: <Languages className="h-4 w-4 text-primary" />
    }));
    
    return formatDistributionData(processedData, 'formattedLanguage');
  }, [analytics.languages]);

  // Combine loading states
  const isLoading = loading.summary || isRefreshing;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Audience Insights</h2>
        <p className="text-sm text-muted-foreground">Detailed information about your website visitors</p>
      </div>
      
      {/* First row - Device and browser info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border shadow-sm">
          <DistributionChart 
            data={deviceData} 
            isLoading={isLoading}
            title="Device Types"
            description="Visitors by device type"
            height={250}
          />
        </div>
        
        <div className="rounded-xl border shadow-sm">
          <DistributionChart 
            data={browserData} 
            isLoading={isLoading}
            title="Browsers"
            description="Visitors by browser"
            height={250}
          />
        </div>
      </div>
      
      {/* Second row - Connection type and language data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border shadow-sm">
          <DistributionChart 
            data={connectionData} 
            isLoading={isLoading}
            title="Connection Types"
            description="Visitors by network connection"
            height={250}
          />
        </div>
        
        <div className="rounded-xl border shadow-sm">
          <DistributionChart 
            data={languageData} 
            isLoading={isLoading}
            title="Languages"
            description="Visitors by preferred language"
            height={250}
          />
        </div>
      </div>
      
      {/* Timezones */}
      <div className="rounded-xl border shadow-sm">
        <DataTable 
          data={analytics.timezones?.map(item => ({
            timezone: item.timezone, 
            visitors: item.visitors, 
            pageviews: item.pageviews
          })) || []}
          columns={[
            {
              accessorKey: 'timezone',
              header: 'Timezone',
              cell: (value: string) => (
                <span className="font-medium">
                  {value || 'Unknown'}
                </span>
              )
            },
            {
              accessorKey: 'visitors',
              header: 'Visitors',
              className: 'text-right'
            },
            {
              accessorKey: 'pageviews',
              header: 'Pageviews',
              className: 'text-right'
            }
          ]}
          title="Timezones"
          description="Visitors by timezone"
          isLoading={isLoading}
          limit={10}
        />
      </div>
      
      {/* Countries with flags */}
      <div className="rounded-xl border shadow-sm">
        <DataTable 
          data={analytics.countries}
          columns={[
            {
              accessorKey: 'country',
              header: 'Country',
              cell: (value: string) => (
                <div className="flex items-center gap-2">
                  {value ? (
                    <div className="w-5 h-4 relative overflow-hidden rounded-sm bg-muted">
                      <img 
                        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${value.toUpperCase()}.svg`} 
                        alt={value}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-5 h-4 flex items-center justify-center rounded-sm bg-muted">
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className="font-medium">{value || 'Unknown'}</span>
                </div>
              )
            },
            {
              accessorKey: 'visitors',
              header: 'Visitors',
              className: 'text-right'
            },
            {
              accessorKey: 'pageviews',
              header: 'Pageviews',
              className: 'text-right'
            }
          ]}
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
                let deviceIcon = "💻";
                if (isValid) {
                  if (width <= 480) {
                    deviceType = "Mobile";
                    deviceIcon = "📱";
                  } else if (width <= 1024) {
                    deviceType = "Tablet";
                    deviceIcon = "📱";
                  } else if (width <= 1440) {
                    deviceType = "Laptop";
                    deviceIcon = "💻";
                  } else {
                    deviceType = "Desktop";
                    deviceIcon = "🖥️";
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
                      <div className="text-2xl">{deviceIcon}</div>
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