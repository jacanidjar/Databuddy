"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useWebsiteAnalytics } from "@/hooks/use-analytics"; // Ensure this path is correct
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Ensure this path is correct
import { Button } from "@/components/ui/button"; // Ensure this path is correct
import { MinimalTable } from "./components/minimal-table";
import { 
  TechnologyIcon,
  PercentageBadge,
  type TechnologyTableEntry,
} from "../_components/utils/technology-helpers";
import type { ColumnDef, CellContext } from "@tanstack/react-table";

// Mock Website type. Replace with your actual Website type import.
// e.g., import type { Website } from "@prisma/client";
// or import type { Website } from "@/lib/types";
type WebsitePlaceholder = {
  id: string;
  name: string;
  domain: string;
  // Add other fields as necessary from your actual Website type
};

// Mock server action for fetching website data.
// Replace this with your actual implementation (e.g., calling a server action or API route).
async function fetchWebsiteDataById(id: string): Promise<WebsitePlaceholder | null> {
  console.log(`%cMock fetch for website data, ID: ${id}`, "color: orange; font-weight: bold;");
  // Example of what this function should do:
  // try {
  //   const website = await getRealWebsiteDataFromServer(id); // Your actual server action/API call
  //   return website;
  // } catch (error) {
  //   console.error("Failed to fetch website data:", error);
  //   return null;
  // }

  // For testing purposes, returning a mock object:
  if (id) {
    return {
      id: id,
      name: `Website ${id} (Mock Data)`,
      domain: `${id}.mock-example.com`,
    };
  }
  return null;
}

const initializeDateRange = (searchParams: URLSearchParams | null) => {
  const start = searchParams?.get("start_date");
  const end = searchParams?.get("end_date");
  const granularity = (searchParams?.get("granularity") || "daily") as 'hourly' | 'daily';

  if (start && end) {
    return {
      start_date: start,
      end_date: end,
      granularity: granularity,
    };
  }
  // Default to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  return {
    start_date: thirtyDaysAgo.toISOString().split("T")[0],
    end_date: today.toISOString().split("T")[0],
    granularity: 'daily' as 'hourly' | 'daily',
  };
};

interface TestPageParams {
  id: string; // This is websiteId from the route segment [id]
}

// Helper function to create column definitions - copied exactly from overview-tab
function col<T>(accessorKey: keyof T, header: string, cell?: (info: CellContext<T, unknown>) => React.ReactNode, meta?: object): ColumnDef<T, unknown> {
  return {
    accessorKey: accessorKey as string,
    header,
    ...(cell && { cell }),
    ...(meta && { meta }),
  };
}

// Mock browser data matching TechnologyTableEntry format
const processedBrowserData: TechnologyTableEntry[] = [
  { name: "Chrome", visitors: 7400, percentage: 45, icon: '/browsers/Chrome.svg', category: 'browser' },
  { name: "Firefox", visitors: 2000, percentage: 12, icon: '/browsers/Firefox.svg', category: 'browser' },
  { name: "Safari", visitors: 1800, percentage: 11, icon: '/browsers/Safari.svg', category: 'browser' },
  { name: "Edge", visitors: 1600, percentage: 10, icon: '/browsers/Edge.svg', category: 'browser' },
  { name: "Opera", visitors: 1600, percentage: 10, icon: '/browsers/Opera.svg', category: 'browser' },
  { name: "Samsung Internet", visitors: 255, percentage: 2, icon: '/browsers/SamsungInternet.svg', category: 'browser' },
];

const processedDeviceData: TechnologyTableEntry[] = [
  { name: "Desktop", visitors: 12500, percentage: 65, category: 'device' },
  { name: "Mobile", visitors: 5800, percentage: 30, category: 'device' },
  { name: "Tablet", visitors: 1200, percentage: 5, category: 'device' },
];

const processedOSData: TechnologyTableEntry[] = [
  { name: "Windows", visitors: 8500, percentage: 50, icon: '/operating-systems/Windows.svg', category: 'os' },
  { name: "Android", visitors: 5800, percentage: 34, icon: '/operating-systems/Android.svg', category: 'os' },
  { name: "macOS", visitors: 2200, percentage: 13, icon: '/operating-systems/macOS.svg', category: 'os' },
  { name: "iOS", visitors: 500, percentage: 3, icon: '/operating-systems/Apple.svg', category: 'os' },
];

// Mock data for Geography tables
interface GeographyEntry {
  name: string;
  visitors: number;
  percentage: number;
  code?: string;
}

const countryData: GeographyEntry[] = [
  { name: "United States", visitors: 8500, percentage: 42, code: "US" },
  { name: "Canada", visitors: 3200, percentage: 16, code: "CA" },
  { name: "United Kingdom", visitors: 2800, percentage: 14, code: "GB" },
  { name: "Germany", visitors: 2200, percentage: 11, code: "DE" },
  { name: "France", visitors: 1800, percentage: 9, code: "FR" },
  { name: "Australia", visitors: 1600, percentage: 8, code: "AU" },
];

const cityData: GeographyEntry[] = [
  { name: "New York", visitors: 3200, percentage: 18 },
  { name: "London", visitors: 2800, percentage: 16 },
  { name: "Toronto", visitors: 2200, percentage: 12 },
  { name: "Los Angeles", visitors: 1900, percentage: 11 },
  { name: "Berlin", visitors: 1600, percentage: 9 },
  { name: "Paris", visitors: 1400, percentage: 8 },
  { name: "Sydney", visitors: 1200, percentage: 7 },
  { name: "Vancouver", visitors: 1000, percentage: 6 },
];

const regionData: GeographyEntry[] = [
  { name: "North America", visitors: 12000, percentage: 55 },
  { name: "Europe", visitors: 7500, percentage: 34 },
  { name: "Asia-Pacific", visitors: 1800, percentage: 8 },
  { name: "South America", visitors: 600, percentage: 3 },
];

// Mock data for Traffic Sources
interface TrafficEntry {
  name: string;
  visitors: number;
  percentage: number;
  type?: string;
}

const referrerData: TrafficEntry[] = [
  { name: "Google", visitors: 8500, percentage: 45, type: "Search Engine" },
  { name: "Direct", visitors: 4200, percentage: 22, type: "Direct" },
  { name: "Facebook", visitors: 2800, percentage: 15, type: "Social" },
  { name: "Twitter", visitors: 1600, percentage: 8, type: "Social" },
  { name: "LinkedIn", visitors: 1200, percentage: 6, type: "Social" },
  { name: "Other", visitors: 800, percentage: 4, type: "Other" },
];

const socialData: TrafficEntry[] = [
  { name: "Facebook", visitors: 2800, percentage: 40, type: "Social Network" },
  { name: "Twitter", visitors: 1600, percentage: 23, type: "Social Network" },
  { name: "LinkedIn", visitors: 1200, percentage: 17, type: "Professional" },
  { name: "Instagram", visitors: 800, percentage: 11, type: "Visual" },
  { name: "YouTube", visitors: 400, percentage: 6, type: "Video" },
  { name: "TikTok", visitors: 200, percentage: 3, type: "Video" },
];

const searchData: TrafficEntry[] = [
  { name: "Google", visitors: 8500, percentage: 75, type: "Search Engine" },
  { name: "Bing", visitors: 1800, percentage: 16, type: "Search Engine" },
  { name: "Yahoo", visitors: 600, percentage: 5, type: "Search Engine" },
  { name: "DuckDuckGo", visitors: 300, percentage: 3, type: "Search Engine" },
  { name: "Yandex", visitors: 150, percentage: 1, type: "Search Engine" },
];

// Mock data for Time Analytics
interface TimeEntry {
  period: string;
  visitors: number;
  percentage: number;
  pageviews?: number;
}

const hourlyData: TimeEntry[] = [
  { period: "09:00", visitors: 1200, percentage: 15, pageviews: 2400 },
  { period: "10:00", visitors: 1400, percentage: 17, pageviews: 2800 },
  { period: "11:00", visitors: 1300, percentage: 16, pageviews: 2600 },
  { period: "14:00", visitors: 1500, percentage: 18, pageviews: 3000 },
  { period: "15:00", visitors: 1100, percentage: 14, pageviews: 2200 },
  { period: "16:00", visitors: 900, percentage: 11, pageviews: 1800 },
  { period: "20:00", visitors: 700, percentage: 9, pageviews: 1400 },
];

const dailyData: TimeEntry[] = [
  { period: "Monday", visitors: 3200, percentage: 18, pageviews: 6400 },
  { period: "Tuesday", visitors: 3800, percentage: 21, pageviews: 7600 },
  { period: "Wednesday", visitors: 3600, percentage: 20, pageviews: 7200 },
  { period: "Thursday", visitors: 3400, percentage: 19, pageviews: 6800 },
  { period: "Friday", visitors: 2800, percentage: 16, pageviews: 5600 },
  { period: "Saturday", visitors: 600, percentage: 3, pageviews: 1200 },
  { period: "Sunday", visitors: 500, percentage: 3, pageviews: 1000 },
];

const weeklyData: TimeEntry[] = [
  { period: "Week 1", visitors: 18000, percentage: 28, pageviews: 36000 },
  { period: "Week 2", visitors: 16500, percentage: 26, pageviews: 33000 },
  { period: "Week 3", visitors: 15200, percentage: 24, pageviews: 30400 },
  { period: "Week 4", visitors: 14300, percentage: 22, pageviews: 28600 },
];

export default function TestComponentsPage({ params: paramsPromise }: { params: Promise<TestPageParams> }) {
  const params = use(paramsPromise); // Unwrap the promise using React.use()
  const websiteId = params.id;      // Access id from the resolved object

  const searchParams = useSearchParams();

  const [dateRange, setDateRange] = useState(() => initializeDateRange(searchParams));
  const [websiteData, setWebsiteData] = useState<WebsitePlaceholder | null>(null);
  const [isLoadingWebsite, setIsLoadingWebsite] = useState(true);
  const [errorWebsite, setErrorWebsite] = useState<string | null>(null);

  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);

  useEffect(() => {
    async function loadWebsiteData() {
      if (!websiteId) {
        setErrorWebsite("No Website ID provided.");
        setIsLoadingWebsite(false);
        return;
      }
      setIsLoadingWebsite(true);
      setErrorWebsite(null);
      try {
        const data = await fetchWebsiteDataById(websiteId);
        setWebsiteData(data);
        if (!data) {
          setErrorWebsite("Website not found or failed to load.");
        }
      } catch (err) {
        setErrorWebsite(err instanceof Error ? err.message : "An unknown error occurred while loading website data.");
      } finally {
        setIsLoadingWebsite(false);
      }
    }
    loadWebsiteData();
  }, [websiteId]);

  const {
    analytics,
    loading: loadingAnalyticsHook,
    error: errorAnalyticsHook,
    refetch: refetchAnalytics,
  } = useWebsiteAnalytics(websiteId, dateRange);

  const handleRefreshAnalytics = async () => {
    setIsRefreshingAnalytics(true);
    try {
      await refetchAnalytics();
    } catch (err) {
      console.error("Failed to refresh analytics:", err);
    } finally {
      setIsRefreshingAnalytics(false);
    }
  };
  
  const isLoadingAnalytics = loadingAnalyticsHook.summary || isRefreshingAnalytics;

  // Technology Table Columns
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

  // Geography Table Columns
  const geographyColumns = useMemo((): ColumnDef<GeographyEntry, unknown>[] => [
    col<GeographyEntry>('name', 'Location', (info) => {
      const entry = info.row.original;
      return (
        <div className="flex items-center gap-3">
          {entry.code && <span className="text-xs bg-muted px-2 py-1 rounded">{entry.code}</span>}
          <span className="font-medium">{entry.name}</span>
        </div>
      );
    }),
    col<GeographyEntry>('visitors', 'Visitors'),
    col<GeographyEntry>('percentage', 'Share', (info) => {
      const percentage = info.getValue() as number;
      return <PercentageBadge percentage={percentage} />;
    }),
  ], []);

  // Traffic Sources Table Columns
  const trafficColumns = useMemo((): ColumnDef<TrafficEntry, unknown>[] => [
    col<TrafficEntry>('name', 'Source', (info) => {
      const entry = info.row.original;
      return (
        <div className="flex items-center gap-3">
          <span className="font-medium">{entry.name}</span>
          {entry.type && <span className="text-xs text-muted-foreground">({entry.type})</span>}
        </div>
      );
    }),
    col<TrafficEntry>('visitors', 'Visitors'),
    col<TrafficEntry>('percentage', 'Share', (info) => {
      const percentage = info.getValue() as number;
      return <PercentageBadge percentage={percentage} />;
    }),
  ], []);

  // Time Analytics Table Columns
  const timeColumns = useMemo((): ColumnDef<TimeEntry, unknown>[] => [
    col<TimeEntry>('period', 'Period'),
    col<TimeEntry>('visitors', 'Visitors'),
    col<TimeEntry>('pageviews', 'Pageviews', (info) => (info.getValue() as number | undefined) || 'N/A'),
    col<TimeEntry>('percentage', 'Share', (info) => {
      const percentage = info.getValue() as number;
      return <PercentageBadge percentage={percentage} />;
    }),
  ], []);

  // Tab configurations for each table category
  const technologyTabs = useMemo(() => [
    {
      id: 'devices',
      label: 'Devices',
      data: processedDeviceData,
      columns: deviceColumns,
    },
    {
      id: 'browsers',
      label: 'Browsers',
      data: processedBrowserData,
      columns: browserColumns,
    },
    {
      id: 'os',
      label: 'Operating Systems',
      data: processedOSData,
      columns: osColumns,
    },
  ], [deviceColumns, browserColumns, osColumns]);

  const geographyTabs = useMemo(() => [
    {
      id: 'countries',
      label: 'Countries',
      data: countryData,
      columns: geographyColumns,
    },
    {
      id: 'cities',
      label: 'Cities',
      data: cityData,
      columns: geographyColumns,
    },
    {
      id: 'regions',
      label: 'Regions',
      data: regionData,
      columns: geographyColumns,
    },
  ], [geographyColumns]);

  const trafficTabs = useMemo(() => [
    {
      id: 'referrers',
      label: 'All Sources',
      data: referrerData,
      columns: trafficColumns,
    },
    {
      id: 'social',
      label: 'Social Media',
      data: socialData,
      columns: trafficColumns,
    },
    {
      id: 'search',
      label: 'Search Engines',
      data: searchData,
      columns: trafficColumns,
    },
  ], [trafficColumns]);

  const timeTabs = useMemo(() => [
    {
      id: 'hourly',
      label: 'Hourly',
      data: hourlyData,
      columns: timeColumns,
    },
    {
      id: 'daily',
      label: 'Daily',
      data: dailyData,
      columns: timeColumns,
    },
    {
      id: 'weekly',
      label: 'Weekly',
      data: weeklyData,
      columns: timeColumns,
    },
  ], [timeColumns]);

  if (isLoadingWebsite) {
    return <div className="flex justify-center items-center h-screen p-4"><p className="text-lg">Loading...</p></div>;
  }

  if (!websiteData) {
    return <div className="flex justify-center items-center h-screen p-4"><p className="text-lg">No website data found.</p></div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
          <CardDescription className="text-xs">Tabbed tables with percentage visualizations</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button size="sm" onClick={handleRefreshAnalytics} disabled={isLoadingAnalytics}>
            {isLoadingAnalytics ? "Refreshing..." : "Refresh"}
          </Button>
        </CardContent>
      </Card>

      {/* Analytics Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Technology Analytics */}
        <MinimalTable 
          tabs={technologyTabs}
          title="Technology"
          description="Devices, browsers, and operating systems"
          isLoading={isLoadingAnalytics}
          initialPageSize={5}
          minHeight={220}
          showSearch={false}
        />

        {/* Geography Analytics */}
        <MinimalTable 
          tabs={geographyTabs}
          title="Geography"
          description="Locations and geographical distribution"
          isLoading={isLoadingAnalytics}
          initialPageSize={5}
          minHeight={220}
          showSearch={false}
        />

        {/* Traffic Sources */}
        <MinimalTable 
          tabs={trafficTabs}
          title="Traffic Sources"
          description="Referrers, social media, and search engines"
          isLoading={isLoadingAnalytics}
          initialPageSize={5}
          minHeight={220}
          showSearch={false}
        />

        {/* Time Analytics */}
        <MinimalTable 
          tabs={timeTabs}
          title="Time Analytics"
          description="Hourly, daily, and weekly patterns"
          isLoading={isLoadingAnalytics}
          initialPageSize={5}
          minHeight={220}
          showSearch={false}
        />
      </div>

      {/* Empty State Example */}
      <MinimalTable
        data={[]}
        columns={deviceColumns}
        title="Empty State"
        description="No data available"
        emptyMessage="No data yet"
      />
    </div>
  );
} 