"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useQueryState } from "nuqs";
import { 
  ArrowLeft, 
  RefreshCw,
  Calendar,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWebsiteById } from "@/app/actions/websites";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, subHours } from "date-fns";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAtom } from "jotai";
import {
  dateRangeAtom,
  timeGranularityAtom,
  setDateRangeAndAdjustGranularityAtom,
  formattedDateRangeAtom,
} from "@/stores/jotai/filterAtoms";
import { EmptyState } from "./components/utils/ui-components";

import type { FullTabProps, WebsiteDataTabProps } from "./components/utils/types";

type TabId = 'overview' | 'audience' | 'content' | 'performance' | 'settings' | 'errors';

const WebsiteOverviewTab = dynamic(
  () => import("./components/tabs/overview-tab").then(mod => ({ default: mod.WebsiteOverviewTab })),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
);
const WebsiteAudienceTab = dynamic(
  () => import("./components/tabs/audience-tab").then(mod => ({ default: mod.WebsiteAudienceTab })),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
);
const WebsiteContentTab = dynamic(
  () => import("./components/tabs/content-tab").then(mod => ({ default: mod.WebsiteContentTab })),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
);
const WebsitePerformanceTab = dynamic(
  () => import("./components/tabs/performance-tab").then(mod => ({ default: mod.WebsitePerformanceTab })),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
);
const WebsiteSettingsTab = dynamic(
  () => import("./components/tabs/settings-tab").then(mod => ({ default: mod.WebsiteSettingsTab })),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
);
const WebsiteErrorsTab = dynamic(
  () => import("./components/tabs/errors-tab").then(mod => ({ default: mod.WebsiteErrorsTab })),
  { loading: () => <TabLoadingSkeleton />, ssr: false }
);

type TabDefinition = {
  id: TabId;
  label: string;
  component: React.ComponentType<any>;
  className?: string;
  props?: "settings" | "full";
};

function WebsiteDetailsPage() {
  const [activeTab, setActiveTab] = useQueryState('tab', { defaultValue: 'overview' as TabId });
  const { id } = useParams();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshDetails, setRefreshDetails] = useState({
    component: "",
    progress: 0,
    total: 4
  });
  const [currentDateRange, setCurrentDateRangeState] = useAtom(dateRangeAtom);
  const [currentGranularity, setCurrentGranularityAtomState] = useAtom(timeGranularityAtom);
  const [, setDateRangeAction] = useAtom(setDateRangeAndAdjustGranularityAtom);
  const [formattedDateRangeState] = useAtom(formattedDateRangeAtom);

  const dayPickerSelectedRange: DayPickerRange | undefined = useMemo(() => ({
    from: currentDateRange.startDate,
    to: currentDateRange.endDate,
  }), [currentDateRange]);
  
  const quickRanges = [
    { label: "24h", fullLabel: "Last 24 hours", value: "24h", fn: () => ({ start: subHours(new Date(), 24), end: new Date() })},
    { label: "7d", fullLabel: "Last 7 days", value: "7d", fn: () => ({ start: subDays(new Date(), 7), end: new Date() })},
    { label: "30d", fullLabel: "Last 30 days", value: "30d", fn: () => ({ start: subDays(new Date(), 30), end: new Date() })},
  ];
  
  const handleQuickRangeSelect = (rangeValue: string) => {
    const selectedRange = quickRanges.find(r => r.value === rangeValue);
    if (selectedRange) {
      const { start, end } = selectedRange.fn();
      setDateRangeAction({ startDate: start, endDate: end });
    }
  };

  const memoizedDateRangeForTabs = useMemo(() => ({
    start_date: formattedDateRangeState.startDate,
    end_date: formattedDateRangeState.endDate,
    granularity: currentGranularity,
  }), [formattedDateRangeState, currentGranularity]);

  const handleDateRangeChange = useCallback((range: DayPickerRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRangeAction({ startDate: range.from, endDate: range.to });
    }
  }, [setDateRangeAction]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["website", id],
    queryFn: async () => {
      const result = await getWebsiteById(id as string);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 1,
    retryDelay: 3000,
  });

  const renderTabContent = useCallback((tabId: TabId) => {
    if (tabId !== activeTab) return null; 

    const key = `${tabId}-${id as string}-${tabId === "settings" ? "static" : memoizedDateRangeForTabs.start_date ?? 'loading'}`;

    const tabProps: FullTabProps = {
      websiteId: id as string,
      dateRange: memoizedDateRangeForTabs,
      websiteData: data,
      isRefreshing,
      setIsRefreshing,
    };

    const settingsProps: WebsiteDataTabProps = {
      websiteId: id as string,
      dateRange: memoizedDateRangeForTabs,
      websiteData: data
    };

    if (tabId === "settings") {
      return (
        <Suspense fallback={<TabLoadingSkeleton />}>
          <WebsiteSettingsTab key={key} {...settingsProps} />
        </Suspense>
      );
    }

    const TabComponent = (() => {
      switch (tabId) {
        case "overview": return WebsiteOverviewTab;
        case "audience": return WebsiteAudienceTab;
        case "content": return WebsiteContentTab;
        case "performance": return WebsitePerformanceTab;
        case "errors": return WebsiteErrorsTab;
        default: return null;
      }
    })();

    if (!TabComponent) return null;

    return (
      <Suspense fallback={<TabLoadingSkeleton />}>
        <TabComponent key={key} {...tabProps} />
      </Suspense>
    );
  }, [activeTab, id, memoizedDateRangeForTabs, data, isRefreshing]);

  if (isLoading) {
    return <TabLoadingSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="pt-8">
        <EmptyState
          icon={<AlertTriangle className="h-10 w-10" />}
          title="Website not found"
          description="The website you are looking for does not exist or you do not have access."
          action={<Link href="/websites"><Button variant="outline">Back to Websites</Button></Link>}
        />
      </div>
    );
  }

  const tabs: TabDefinition[] = [
    { id: "overview", label: "Overview", component: WebsiteOverviewTab, className: "pt-2 space-y-2" },
    { id: "audience", label: "Audience", component: WebsiteAudienceTab },
    { id: "content", label: "Content", component: WebsiteContentTab },
    { id: "performance", label: "Performance", component: WebsitePerformanceTab },
    { id: "errors", label: "Errors", component: WebsiteErrorsTab },
    { id: "settings", label: "Settings", component: WebsiteSettingsTab, props: "settings" },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const activeTabDef = tabs.find(tab => tab.id === activeTab);
      setRefreshDetails({ 
        component: `${activeTabDef?.label || "Current"} data`, 
        progress: 1, 
        total: 1 
      });
      toast.success(`${activeTabDef?.label || "Dashboard"} data refreshed`);
    } catch (error) {
      toast.error("Failed to refresh data");
      console.error(error);
    } finally {
      setRefreshDetails({ component: "", progress: 0, total: 1 });
      setTimeout(() => {
        setIsRefreshing(false);
      }, 5000);
    }
  };

  return (
    <div className="p-3 sm:p-4 max-w-[1600px] mx-auto">
      <header className="border-b pb-3">
        <div className="flex flex-col gap-3 mt-3 bg-muted/30 rounded-lg p-2.5 border">
          <div className="flex items-center justify-between gap-3">
            <div className="bg-background rounded-md border overflow-hidden flex shadow-sm h-8">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 text-xs px-2 sm:px-3 rounded-none cursor-pointer touch-manipulation ${currentGranularity === 'daily' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}
                onClick={() => setCurrentGranularityAtomState('daily')}
                title="View daily aggregated data"
              >
                Daily
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 text-xs px-2 sm:px-3 rounded-none cursor-pointer touch-manipulation ${currentGranularity === 'hourly' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}
                onClick={() => setCurrentGranularityAtomState('hourly')}
                title="View hourly data (best for 24h periods)"
              >
                Hourly
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 bg-background shadow-sm font-medium touch-manipulation cursor-pointer"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isRefreshing 
                  ? `${refreshDetails.progress}/${refreshDetails.total}` 
                  : 'Refresh'
                }
              </span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 bg-background rounded-md p-1 border shadow-sm overflow-x-auto">
            {quickRanges.map((range) => {
              const dayPickerCurrentRange = dayPickerSelectedRange;
              const isActive = dayPickerCurrentRange?.from && dayPickerCurrentRange?.to &&
                format(dayPickerCurrentRange.from, 'yyyy-MM-dd') === format(range.fn().start, 'yyyy-MM-dd') &&
                format(dayPickerCurrentRange.to, 'yyyy-MM-dd') === format(range.fn().end, 'yyyy-MM-dd');
              
              return (
                <Button 
                  key={range.value}
                  variant={isActive ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`h-6 cursor-pointer text-xs whitespace-nowrap px-2 sm:px-2.5 touch-manipulation ${isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => handleQuickRangeSelect(range.value)}
                  title={range.fullLabel}
                >
                  <span className="sm:hidden">{range.label}</span>
                  <span className="hidden sm:inline">{range.fullLabel}</span>
                </Button>
              );
            })}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs gap-1 sm:gap-1.5 whitespace-nowrap px-2 sm:px-2.5 border-l border-border/50 ml-1 pl-2 sm:pl-3 touch-manipulation"
                >
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary flex-shrink-0" />
                  <span className="font-medium text-xs truncate">
                    {dayPickerSelectedRange?.from ? format(dayPickerSelectedRange.from, 'MMM d') : ''} - {dayPickerSelectedRange?.to ? format(dayPickerSelectedRange.to, 'MMM d') : ''}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 border shadow-lg" align="end">
                <div className="grid gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <span className="text-sm font-medium">Select date range</span>
                    <div className="flex gap-1 flex-wrap">
                      {quickRanges.map((range) => (
                        <Button 
                          key={range.value}
                          variant="outline"
                          size="sm" 
                          className="h-7 text-xs touch-manipulation"
                          onClick={() => handleQuickRangeSelect(range.value)}
                        >
                          {range.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dayPickerSelectedRange?.from}
                    selected={dayPickerSelectedRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={window.innerWidth < 640 ? 1 : 2}
                    disabled={(d) => d > new Date() || d < new Date(2020, 0, 1)}
                    className="rounded-md border"
                  />
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      className="mt-2 touch-manipulation"
                      onClick={() => {
                        if (dayPickerSelectedRange?.from && dayPickerSelectedRange?.to) {
                           setDateRangeAction({ startDate: dayPickerSelectedRange.from, endDate: dayPickerSelectedRange.to });
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
        </div>
      </header>

      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as TabId)} 
        className="space-y-4"
      >
        <div className="border-b relative">
          <TabsList className="h-10 bg-transparent p-0 w-full justify-start overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="text-xs sm:text-sm h-10 px-2 sm:px-4 rounded-none touch-manipulation hover:bg-muted/50 relative transition-colors whitespace-nowrap cursor-pointer"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map((tab) => (
          <TabsContent 
            key={tab.id} 
            value={tab.id} 
            className={`${tab.className || ''} transition-all duration-200 animate-fadeIn`}
          >
            {renderTabContent(tab.id)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 

function TabLoadingSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4 pt-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((num) => (
          <Skeleton key={`tab-loading-skeleton-${num}`} className="h-20 sm:h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-48 sm:h-64 w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Skeleton className="h-32 sm:h-40 w-full" />
        <Skeleton className="h-32 sm:h-40 w-full" />
      </div>
    </div>
  );
}

export default function Page() {
    return (
        <Suspense fallback={
          <div className="p-3 sm:p-4 flex items-center justify-center h-screen">
            <div className="space-y-3 w-full max-w-md">
              <Skeleton className="h-6 sm:h-7 w-2/3 mx-auto" />
              <Skeleton className="h-20 sm:h-24 w-full" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-12 sm:h-16 w-full" />
                <Skeleton className="h-12 sm:h-16 w-full" />
              </div>
              <Skeleton className="h-32 sm:h-48 w-full" />
            </div>
          </div>
        }>
            <WebsiteDetailsPage />
        </Suspense>
    )
}