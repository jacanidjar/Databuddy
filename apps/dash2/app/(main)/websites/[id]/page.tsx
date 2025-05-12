"use client";

import { useEffect, useState, useMemo, useCallback, Suspense, lazy, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ExternalLink, 
  Pencil, 
  RefreshCw,
  Calendar,
  ChevronDown,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWebsiteById } from "@/app/actions/websites";
import { checkDomainVerification, regenerateVerificationToken } from "@/app/actions/domains";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/app/providers";
import { format, subDays, subHours, differenceInDays } from "date-fns";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationDialog } from "@/components/websites/verification-dialog";

// Tab content components
import { WebsiteOverviewTab } from "./components/tabs/overview-tab";
import { WebsiteAudienceTab } from "./components/tabs/audience-tab";
import { WebsiteContentTab } from "./components/tabs/content-tab";
import { WebsitePerformanceTab } from "./components/tabs/performance-tab";
import { WebsiteSettingsTab } from "./components/tabs/settings-tab";
import { WebsiteErrorsTab } from "./components/tabs/errors-tab";

// Shared types
import type { DateRange as BaseDateRange } from "@/hooks/use-analytics";
import React from "react";

// Add type for tab ID
type TabId = 'overview' | 'audience' | 'content' | 'performance' | 'settings' | 'errors';

// Tab definition structure
type TabDefinition = {
  id: TabId;
  label: string;
  component: React.ComponentType<any>;
  className?: string;
  props?: "settings" | "full";
};

function WebsiteDetailsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { id } = useParams();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshDetails, setRefreshDetails] = useState({
    component: "",
    progress: 0,
    total: 4
  });
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Date range state for analytics with default to last 30 days
  const [dateRange, setDateRange] = useState<BaseDateRange>({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd')
  });
  
  // Initialize date picker state with the same values
  const [date, setDate] = useState<DayPickerRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Add time range granularity state
  const [timeGranularity, setTimeGranularity] = useState<'daily' | 'hourly'>('daily');
  
  // Quick date range options
  const quickRanges = [
    { label: "Last 24 hours", value: "24h", fn: () => ({
      start: subHours(new Date(), 24),
      end: new Date()
    })},
    { label: "Last 7 days", value: "7d", fn: () => ({
      start: subDays(new Date(), 7),
      end: new Date()
    })},
    { label: "Last 30 days", value: "30d", fn: () => ({
      start: subDays(new Date(), 30),
      end: new Date()
    })},
  ];
  
  // Handler for quick range selection
  const handleQuickRangeSelect = (rangeValue: string) => {
    const selectedRange = quickRanges.find(r => r.value === rangeValue);
    if (selectedRange) {
      const { start, end } = selectedRange.fn();
      setDate({ from: start, to: end });
      setDateRange({
        start_date: format(start, 'yyyy-MM-dd'),
        end_date: format(end, 'yyyy-MM-dd')
      });
      
      // Auto-adjust granularity based on date range
      // 24h = hourly, longer periods = daily
      const diffHours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
      setTimeGranularity(diffHours <= 24 ? 'hourly' : 'daily');
    }
  };

  // Memoize date range to prevent unnecessary re-renders
  const memoizedDateRange = useMemo(() => ({
    ...dateRange,
    granularity: timeGranularity
  }), [dateRange, timeGranularity]);

  // Callback for date range updates
  const handleDateRangeChange = useCallback((range: DayPickerRange | undefined) => {
    if (range?.from && range?.to) {
      setDate(range);
      setDateRange({
        start_date: format(range.from, 'yyyy-MM-dd'),
        end_date: format(range.to, 'yyyy-MM-dd')
      });
      
      // Auto-adjust granularity based on selected date range
      const diffHours = Math.abs(range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60);
      setTimeGranularity(diffHours <= 24 ? 'hourly' : 'daily');
    }
  }, []);

  // Fetch website details with optimized settings and proper caching
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["website", id],
    queryFn: async () => {
      const result = await getWebsiteById(id as string);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000, // 10 min
    refetchOnWindowFocus: false, // Prevent refetch on focus
    refetchInterval: false, // Disable automatic refetching
    retry: 1, // Limit retries to prevent request loops
    retryDelay: 3000, // Add delay between retries
  });

  // Add a stable reference to website ID to prevent unnecessary re-renders
  const websiteIdRef = useRef(id);
  useEffect(() => {
    websiteIdRef.current = id as string;
  }, [id]);

  // Handle errors
  useEffect(() => {
    if (isError) {
      toast.error("Failed to load website details");
      console.error(error);
    }
  }, [isError, error]);

  // After the data query, check if the website is verified:
  const isLocalhost = data?.domain?.includes('localhost') || data?.domain?.includes('127.0.0.1');
  const isVerified = isLocalhost || data?.domainData?.verificationStatus === "VERIFIED" || data?.domainId;
  
  // Modified implementation of regenerateToken to fix typing issues
  const regenerateToken = async (websiteId: string) => {
    setIsRegenerating(true);
    try {
      const result = await regenerateVerificationToken(websiteId);
      if (result.error) {
        toast.error(result.error);
        return { error: result.error };
      }
      
      // Refetch website data
      queryClient.invalidateQueries({ queryKey: ['website', id] });
      toast.success("Verification token regenerated");
      
      // Add missing domain property
      return { 
        data: result.data ? { 
          ...result.data,
          domain: data?.domain || ''
        } : undefined 
      };
    } catch (error) {
      console.error('Error regenerating token:', error);
      toast.error("Failed to regenerate token");
      return { error: "Failed to regenerate token" };
    } finally {
      setIsRegenerating(false);
    }
  };
  
  // Replace the verifyDomain function with checkDomainVerification:
  const verifyDomain = async (websiteId: string) => {
    try {
      const result = await checkDomainVerification(websiteId);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (result.data?.verified) {
        // Refetch website data
        queryClient.invalidateQueries({ queryKey: ['website', id] });
        toast.success(result.data.message || "Domain verified successfully");
      } else {
        toast.error(result.data?.message || "Domain verification failed");
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast.error("Failed to verify domain");
    }
  };

  // Use useRef for stable function references
  const verifyDomainRef = useRef((id: string) => verifyDomain(id));
  const regenerateTokenRef = useRef((id: string) => regenerateToken(id));

  // Lazy load the verification dialog
  const LazyVerificationDialog = React.memo(VerificationDialog);

  // Create stable versions of the props objects before using in dependencies
  const stableTabProps = useMemo(() => ({
    websiteId: id as string,
    dateRange: memoizedDateRange,
    websiteData: data,
    isRefreshing,
    setIsRefreshing: (value: boolean) => {
      setIsRefreshing(value);
    }
  }), [id, memoizedDateRange, data, isRefreshing]);

  const stableSettingsProps = useMemo(() => ({
    websiteId: id as string,
    dateRange: memoizedDateRange,
    websiteData: data
  }), [id, memoizedDateRange, data]);

  // Function to render tab content with stable props
  const renderTabContent = useCallback((tabId: TabId) => {
    // Only render if this tab is active
    if (tabId !== activeTab) return null;

    // Choose which component to render
    switch (tabId) {
      case "overview":
        return <WebsiteOverviewTab key={`overview-${websiteIdRef.current}-${dateRange.start_date}`} {...stableTabProps} />;
      case "audience":
        return <WebsiteAudienceTab key={`audience-${websiteIdRef.current}-${dateRange.start_date}`} {...stableTabProps} />;
      case "content":
        return <WebsiteContentTab key={`content-${websiteIdRef.current}-${dateRange.start_date}`} {...stableTabProps} />;
      case "performance":
        return <WebsitePerformanceTab key={`performance-${websiteIdRef.current}-${dateRange.start_date}`} {...stableTabProps} />;
      case "settings":
        return <WebsiteSettingsTab key={`settings-${websiteIdRef.current}`} {...stableSettingsProps} />;
      case "errors":
        return <WebsiteErrorsTab key={`errors-${websiteIdRef.current}-${dateRange.start_date}`} {...stableTabProps} />;
    }
  }, [activeTab, stableTabProps, stableSettingsProps, dateRange.start_date]);

  // Define all tabs
  const tabs: TabDefinition[] = [
    { id: "overview", label: "Overview", component: WebsiteOverviewTab, className: "pt-2 space-y-2" },
    { id: "audience", label: "Audience", component: WebsiteAudienceTab },
    { id: "content", label: "Content", component: WebsiteContentTab },
    { id: "performance", label: "Performance", component: WebsitePerformanceTab },
    { id: "errors", label: "Errors", component: WebsiteErrorsTab },
    { id: "settings", label: "Settings", component: WebsiteSettingsTab, props: "settings" },
  ];

  // Add a new handleRefresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Find active tab component and only refresh the currently visible tab
      const activeTabDef = tabs.find(tab => tab.id === activeTab);
      setRefreshDetails({ 
        component: `${activeTabDef?.label || "Current"} data`, 
        progress: 1, 
        total: 1 
      });
      
      // Allow the active component to handle its own refresh via isRefreshing prop
      // We don't need to execute any refetch logic here - each tab component has its own useEffect
      // that will detect isRefreshing=true and call its own refetch() function
      await new Promise(r => setTimeout(r, 1000)); // Give component time to react
      
      // Success message
      toast.success(`${activeTabDef?.label || "Dashboard"} data refreshed`);
    } catch (error) {
      toast.error("Failed to refresh data");
      console.error(error);
    } finally {
      // Component will set isRefreshing to false when done, but set it here as a fallback
      setRefreshDetails({ component: "", progress: 0, total: 1 });
      
      // Add a timeout safety to ensure isRefreshing is always reset
      // This handles edge cases where the component might fail to reset isRefreshing
      setTimeout(() => {
        setIsRefreshing(false);
      }, 5000); // 5 second safety timeout
    }
  };

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" size="icon" disabled className="h-8 w-8">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Skeleton className="h-7 w-48 mb-1" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-9 w-full max-w-xs mb-4" />
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4].map((num) => (
            <Skeleton key={`loading-skeleton-${num}`} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-8">
          <h1 className="text-xl font-bold mb-2">Website Not Found</h1>
          <p className="text-muted-foreground text-sm mb-4">
            The website you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button asChild size="sm">
            <Link href="/websites">Back to Websites</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Add verification check here
  if (!isVerified && !isLocalhost && data) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/websites")}
            className="flex items-center mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">{data.name || data.domain}</h1>
        </div>
        
        <Card className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/50">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle>Domain Verification Required</CardTitle>
                <CardDescription className="mt-1">
                  You need to verify ownership of {data.domain} before you can access analytics.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-muted-foreground mb-4">
              To verify your domain, you'll need to add a DNS TXT record. This proves that you own the domain
              and helps prevent unauthorized tracking.
            </p>
            <Button 
              onClick={() => setShowVerificationDialog(true)}
              className="w-full sm:w-auto"
            >
              Verify Domain Now
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>What is domain verification?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Domain verification is a security measure that ensures only legitimate owners can track analytics
              for a domain. Here's how it works:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground pl-2">
              <li>You add a special TXT record to your domain's DNS settings</li>
              <li>Our system checks for this record to confirm you control the domain</li>
              <li>Once verified, you can access all analytics features for your website</li>
            </ol>
            <p className="text-sm text-muted-foreground">
              The verification process is quick and simple, usually taking just a few minutes to complete.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Button 
              onClick={() => setShowVerificationDialog(true)}
              className="w-full sm:w-auto"
            >
              Start Verification
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/websites")}
              className="w-full sm:w-auto"
            >
              Back to Websites
            </Button>
          </CardFooter>
        </Card>
        
        <LazyVerificationDialog
          website={data}
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
          onVerify={verifyDomainRef.current}
          onRegenerateToken={regenerateTokenRef.current}
          isVerifying={false}
          isRegenerating={isRegenerating}
        />
      </div>
    );
  }

  return (
    <div className="p-3 max-w-[1600px] mx-auto">
      {/* Compact header */}
      <header className="border-b pb-3">
        {/* <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/websites")}
              className="h-8 w-8 cursor-pointer hover:bg-gray-100 -ml-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold leading-tight">{data.name || "Unnamed Website"}</h1>
              <a
                href={data.domain}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                {data.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div> */}
        
        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap mt-3 bg-muted/30 rounded-lg p-2.5 border">
          {/* Time granularity toggle */}
          <div className="bg-background rounded-md border overflow-hidden flex shadow-sm h-8">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 text-xs px-3 rounded-none cursor-pointer ${timeGranularity === 'daily' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setTimeGranularity('daily')}
              title="View daily aggregated data"
            >
              Daily
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 text-xs px-3 rounded-none cursor-pointer ${timeGranularity === 'hourly' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setTimeGranularity('hourly')}
              title="View hourly data (best for 24h periods)"
            >
              Hourly
            </Button>
          </div>
          
          <div className="h-5 border-r border-border/70 mx-1" />
          
          {/* Date range preset buttons */}
          <div className="flex items-center gap-1.5 bg-background rounded-md p-1 border shadow-sm overflow-x-auto scrollbar-hide flex-1 max-w-md">
            {quickRanges.map((range) => {
              const isActive = date?.from && date?.to && 
                format(date.from, 'yyyy-MM-dd') === format(range.fn().start, 'yyyy-MM-dd') &&
                format(date.to, 'yyyy-MM-dd') === format(range.fn().end, 'yyyy-MM-dd');
              
              return (
                <Button 
                  key={range.value}
                  variant={isActive ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`h-6 text-xs whitespace-nowrap px-2.5 cursor-pointer ${isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => handleQuickRangeSelect(range.value)}
                >
                  {range.label}
                </Button>
              );
            })}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs gap-1.5 whitespace-nowrap px-2.5 border-l border-border/50 ml-1 pl-3 cursor-pointer"
                >
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">
                    {date?.from ? format(date.from, 'MMM d') : ''} - {date?.to ? format(date.to, 'MMM d') : ''}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 border shadow-lg" align="end">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Select date range</span>
                    <div className="flex gap-1">
                      {quickRanges.map((range) => (
                        <Button 
                          key={range.value}
                          variant="outline"
                          size="sm" 
                          className="h-7 text-xs cursor-pointer"
                          onClick={() => handleQuickRangeSelect(range.value)}
                        >
                          {range.label.replace('Last ', '')}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    disabled={(date) => date > new Date() || date < new Date(2020, 0, 1)}
                    className="rounded-md border"
                  />
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      className="mt-2 cursor-pointer"
                      onClick={() => {
                        if (date?.from && date?.to) {
                          setDateRange({
                            start_date: format(date.from, 'yyyy-MM-dd'),
                            end_date: format(date.to, 'yyyy-MM-dd')
                          });
                          
                          // Auto-adjust granularity based on selected date range
                          const diffHours = Math.abs(date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60);
                          setTimeGranularity(diffHours <= 24 ? 'hourly' : 'daily');
                        }
                      }}
                    >
                      Apply Range
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 ml-auto bg-background shadow-sm font-medium cursor-pointer"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing 
              ? `${refreshDetails.progress}/${refreshDetails.total}` 
              : 'Refresh'
            }
          </Button>
        </div>
      </header>

      {/* Tabs with CSS animation */}
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as TabId)} 
        className="space-y-4"
      >
        <div className="border-b relative">
          <TabsList className="h-10 bg-transparent p-0 w-full justify-start gap-1">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="text-sm h-10 px-4 rounded-none cursor-pointer hover:bg-muted/50 relative transition-colors"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary animate-slideIn" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map((tab) => (
          <TabsContent 
            key={tab.id} 
            value={tab.id} 
            className={`${tab.className} transition-all duration-200 animate-fadeIn`}
          >
            <Suspense fallback={<TabLoadingSkeleton />}>
              {renderTabContent(tab.id)}
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 

// Fix TabLoadingSkeleton array key issues
function TabLoadingSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((num) => (
          <Skeleton key={`tab-loading-skeleton-${num}`} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

export default function Page() {
    return (
        <Suspense fallback={
          <div className="p-3 flex items-center justify-center h-screen">
            <div className="space-y-3 w-full max-w-md">
              <Skeleton className="h-7 w-2/3 mx-auto" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        }>
            <WebsiteDetailsPage />
        </Suspense>
    )
}