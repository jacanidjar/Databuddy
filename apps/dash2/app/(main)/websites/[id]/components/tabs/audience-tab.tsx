"use client";

import { useMemo, useEffect } from "react";

import { DistributionChart } from "@/components/charts/distribution-chart";
import { DataTable } from "@/components/analytics/data-table";
import { useWebsiteAnalytics } from "@/hooks/use-analytics";
import { formatDistributionData, groupBrowserData } from "../utils/analytics-helpers";
import { RefreshableTabProps } from "../utils/types";

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

  // Prepare device data
  const deviceData = useMemo(() => 
    formatDistributionData(analytics.device_types, 'device_type'), 
    [analytics.device_types]
  );

  // Prepare browser data
  const browserData = useMemo(() => 
    groupBrowserData(analytics.browser_versions), 
    [analytics.browser_versions]
  );

  // Prepare connection types data
  const connectionData = useMemo(() => 
    formatDistributionData(analytics.connection_types, 'connection_type'), 
    [analytics.connection_types]
  );

  // Prepare language data
  const languageData = useMemo(() => 
    formatDistributionData(analytics.languages, 'language'), 
    [analytics.languages]
  );

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
      
      {/* Countries */}
      <div className="rounded-xl border shadow-sm">
        <DataTable 
          data={analytics.countries}
          columns={[
            {
              accessorKey: 'country',
              header: 'Country',
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
          title="Geographic Distribution"
          description="Visitors by location"
          isLoading={isLoading}
        />
      </div>
      
      {/* Screen Resolutions */}
      <div className="rounded-xl border shadow-sm">
        <DataTable 
          data={analytics.screen_resolutions}
          columns={[
            {
              accessorKey: 'screen_resolution',
              header: 'Resolution',
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
              accessorKey: 'count',
              header: 'Count',
              className: 'text-right'
            }
          ]}
          title="Screen Resolutions"
          description="Visitors by screen size"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 