"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Pencil, BarChart2, Calendar, Globe, Smartphone } from "lucide-react";
import { DateRange as DayPickerRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebsiteDialog } from "@/components/website-dialog";
import { getWebsiteById, updateWebsite } from "@/app/actions/websites";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/app/providers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useWebsiteAnalytics,
  PageData,
  ReferrerData,
  DateRange
} from "@/hooks/use-analytics";
import { useParams } from "next/navigation";

// Define browser and device types
interface BrowserInfo {
  browser: string;
  visitors: number;
  pageviews: number;
}

interface DeviceInfo {
  device_type: string;
  visitors: number;
  pageviews: number;
}

function WebsiteDetailsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const { id } = useParams();
  
  // Date range state for analytics
  const [dateRange, setDateRange] = useState<DateRange>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  // Memoize date range to prevent unnecessary re-renders
  const memoizedDateRange = useMemo(() => dateRange, [dateRange.start_date, dateRange.end_date]);

  // Callback for date range updates
  const handleDateRangeChange = useCallback((range?: DayPickerRange) => {
    if (range?.from && range?.to) {
      setDateRange({
        start_date: range.from.toISOString().split('T')[0],
        end_date: range.to.toISOString().split('T')[0]
      });
    }
  }, []);

  // Fetch website details
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["website", id],
    queryFn: async () => {
      const result = await getWebsiteById(id as string);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  // Fetch all analytics data with a single hook
  const {
    analytics,
    loading,
    error: analyticsError
  } = useWebsiteAnalytics(id as string, memoizedDateRange);

  // Handle website update
  const updateWebsiteMutation = useMutation({
    mutationFn: async (data: { name?: string; domain?: string }) => {
      return updateWebsite(id as string, data);
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Website updated successfully");
      queryClient.invalidateQueries({ queryKey: ["website", id] });
      queryClient.invalidateQueries({ queryKey: ["websites"] });
    },
    onError: (error) => {
      toast.error("Failed to update website");
      console.error(error);
    },
  });

  // Handle errors
  useEffect(() => {
    if (isError) {
      toast.error("Failed to load website details");
      console.error(error);
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-10 w-60 mb-4" />
          <Skeleton className="h-4 w-full max-w-md mb-2" />
          <Skeleton className="h-4 w-2/3 max-w-sm" />
        </div>
        <Skeleton className="h-12 w-full max-w-md mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold mb-4">Website Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The website you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button asChild>
            <Link href="/websites">Back to Websites</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/websites")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-muted-foreground text-sm">
          Back to websites
        </div>
      </div>

      {/* Title and actions */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{data.name || "Unnamed Website"}</h1>
          <div className="flex items-center gap-2 mt-1">
            <a
              href={data.domain}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {data.domain}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Date range picker implementation could be added back here when stable */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              {new Date(dateRange.start_date).toLocaleDateString()} - {new Date(dateRange.end_date).toLocaleDateString()}
            </span>
          </div>
          <WebsiteDialog
            website={{
              id: data.id,
              name: data.name,
              domain: data.domain,
            }}
            onSubmit={(formData) => updateWebsiteMutation.mutate(formData)}
            isSubmitting={updateWebsiteMutation.isPending}
          >
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Website
            </Button>
          </WebsiteDialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="py-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Website Information</h3>
              <div className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Created:</span>{" "}
                {new Date(data.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Last Updated:</span>{" "}
                {new Date(data.updatedAt).toLocaleDateString()}
              </div>
            </div>
            
            {/* Today's visitors card */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Today's Visitors</h3>
              {loading.summary ? (
                <Skeleton className="h-8 w-16 mb-2" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{analytics.today?.visitors || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics.today?.pageviews || 0} page views
                  </p>
                </>
              )}
            </div>
            
            {/* Total page views card */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Total Page Views</h3>
              {loading.summary ? (
                <Skeleton className="h-8 w-16 mb-2" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{analytics.summary?.pageviews || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics.summary?.visitors || 0} unique visitors in selected period
                  </p>
                </>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.summary ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {analytics.summary?.unique_visitors || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.summary ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {analytics.summary?.pageviews || 0}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.summary ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {(analytics.summary?.bounce_rate || 0).toFixed(1)}%
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.summary ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {formatDuration(analytics.summary?.avg_session_duration || 0)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Website Settings</h2>
            <div className="border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Tracking Code</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add this code to your website to start tracking visitors and analytics.
              </p>
              <div className="bg-secondary p-4 rounded-md mb-4 overflow-x-auto">
                <pre className="text-xs">
                  <code>{`<script src="https://cdn.databuddy.com/tracker.js" data-website-id="${data.id}"></script>`}</code>
                </pre>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<script src="https://cdn.databuddy.com/tracker.js" data-website-id="${data.id}"></script>`
                  );
                  toast.success("Tracking code copied to clipboard");
                }}
              >
                Copy Code
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Utility function to format duration in seconds to a human-readable format
function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0s';
  
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
} 
export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WebsiteDetailsPage />
        </Suspense>
    )
}