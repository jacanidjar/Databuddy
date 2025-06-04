"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { format, parseISO, isValid } from "date-fns";
import { toast } from "sonner";
import { 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Code,
  Bug,
  AlertTriangle,
  Monitor,
  Smartphone,
  Calendar,
  MapPin,
  User,
  RotateCcw,
  Laptop,
  Tablet,
  Network,
  FileCode,
  Terminal,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Brush } from "recharts";
import { useWebsiteErrors } from "@/hooks/use-analytics";
import type { DateRange, ErrorDetail } from "@/hooks/use-analytics";
import { AnimatedLoading } from "@/components/analytics/animated-loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FullTabProps } from "../utils/types";
import { EmptyState } from "../utils/ui-components";
import { StatCard } from "@/components/analytics/stat-card";

// Helper function to safely parse dates from API responses
const safeDateParse = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  // Try parsing as ISO string first
  let date = parseISO(dateString);
  if (isValid(date)) return date;
  
  // If that fails, try converting space to T for ISO format
  const isoString = dateString.replace(' ', 'T');
  date = parseISO(isoString);
  if (isValid(date)) return date;
  
  // If that fails, try native Date constructor
  date = new Date(dateString);
  if (isValid(date)) return date;
  
  // Fallback to current date if all parsing fails
  console.warn('Failed to parse date:', dateString);
  return new Date();
};

// Helper function to safely format dates
const safeFormatDate = (dateString: string, formatString: string): string => {
  try {
    const date = safeDateParse(dateString);
    return format(date, formatString);
  } catch (error) {
    console.warn('Failed to format date:', dateString, error);
    return dateString; // Return original string as fallback
  }
};

// Helper function to categorize errors by their actual type
const categorizeError = (errorMessage: string): { type: string; category: string; severity: 'high' | 'medium' | 'low' } => {
  const message = errorMessage.toLowerCase();
  
  if (message.includes('react error #185')) {
    return { type: 'React Error #185', category: 'React', severity: 'high' };
  }
  if (message.includes('react error #418')) {
    return { type: 'React Error #418', category: 'React', severity: 'high' };
  }
  if (message.includes('react error #419')) {
    return { type: 'React Error #419', category: 'React', severity: 'high' };
  }
  if (message.includes('script error')) {
    return { type: 'Script Error', category: 'JavaScript', severity: 'medium' };
  }
  if (message.includes('network')) {
    return { type: 'Network Error', category: 'Network', severity: 'medium' };
  }
  if (message.includes('syntax')) {
    return { type: 'Syntax Error', category: 'JavaScript', severity: 'high' };
  }
  if (message.includes('reference')) {
    return { type: 'Reference Error', category: 'JavaScript', severity: 'high' };
  }
  if (message.includes('type')) {
    return { type: 'Type Error', category: 'JavaScript', severity: 'medium' };
  }
  
  return { type: 'Unknown Error', category: 'Other', severity: 'low' };
};

// Helper function to get error severity color
const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Enhanced Custom Tooltip for Error Chart
const ErrorChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any) => (
          <div key={`tooltip-${entry.dataKey}-${entry.value}`} className="flex items-center gap-2">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">Errors:</span>
            <span className="font-medium text-foreground">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Get icon for error type
const getErrorTypeIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('react')) return <Code className="h-4 w-4" />;
  if (lowerType.includes('network')) return <Network className="h-4 w-4" />;
  if (lowerType.includes('script')) return <FileCode className="h-4 w-4" />;
  if (lowerType.includes('syntax')) return <Terminal className="h-4 w-4" />;
  return <Bug className="h-4 w-4" />;
};

// Get device icon
const getDeviceIcon = (deviceType: string) => {
  switch (deviceType.toLowerCase()) {
    case 'mobile': return <Smartphone className="h-4 w-4" />;
    case 'tablet': return <Tablet className="h-4 w-4" />;
    case 'desktop': return <Laptop className="h-4 w-4" />;
    default: return <Monitor className="h-4 w-4" />;
  }
};

export function WebsiteErrorsTab({
  websiteId,
  dateRange,
  websiteData,
  isRefreshing,
  setIsRefreshing
}: FullTabProps) {
  // State for errors tab
  const [errorPage, setErrorPage] = useState<number>(1);
  const [selectedError, setSelectedError] = useState<ErrorDetail | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  
  // Chart zoom state
  const [zoomDomain, setZoomDomain] = useState<{ startIndex?: number; endIndex?: number }>({});
  const [isZoomed, setIsZoomed] = useState(false);

  // Fetch errors data
  const { 
    data: errorsData, 
    isLoading: isLoadingErrors,
    error: errorsError,
    refetch: errorsRefetch 
  } = useWebsiteErrors(
    websiteId, 
    { start_date: dateRange.start_date, end_date: dateRange.end_date },
    50,
    errorPage
  );

  // Handle refresh
  useEffect(() => {
    if (isRefreshing) {
      const doRefresh = async () => {
        try {
          await errorsRefetch();
        } catch (error) {
          console.error("Failed to refresh data:", error);
          toast.error("Failed to refresh error data.");
        } finally {
          setIsRefreshing(false);
        }
      };
      
      doRefresh();
    }
  }, [isRefreshing, errorsRefetch, setIsRefreshing]);

  // Combine loading states
  const isLoading = isLoadingErrors || isRefreshing;

  // Process and categorize errors from recent_errors data
  const processedErrors = useMemo(() => {
    if (!errorsData?.recent_errors) return [];
    
    const errorMap = new Map();
    
    for (const error of errorsData.recent_errors) {
      const { type, category, severity } = categorizeError(error.error_message);
      const key = `${type}-${error.error_message}`;
      
      if (errorMap.has(key)) {
        const existing = errorMap.get(key);
        existing.count += 1;
        existing.sessions.add((error as any).session_id);
        if (new Date(error.time) > new Date(existing.last_occurrence)) {
          existing.last_occurrence = error.time;
        }
      } else {
        errorMap.set(key, {
          error_type: type,
          category,
          severity,
          error_message: error.error_message,
          count: 1,
          unique_sessions: 1,
          sessions: new Set([(error as any).session_id]),
          last_occurrence: error.time,
          sample_error: error
        });
      }
    }
    
    return Array.from(errorMap.values())
      .map(error => ({
        ...error,
        unique_sessions: error.sessions.size
      }))
      .sort((a, b) => b.count - a.count);
  }, [errorsData?.recent_errors]);

  // Reset zoom function
  const resetZoom = useCallback(() => {
    setZoomDomain({});
    setIsZoomed(false);
  }, []);

  // Handle brush change for zoom
  const handleBrushChange = useCallback((brushData: any) => {
    if (brushData && brushData.startIndex !== undefined && brushData.endIndex !== undefined) {
      setZoomDomain({
        startIndex: brushData.startIndex,
        endIndex: brushData.endIndex
      });
      setIsZoomed(true);
    }
  }, []);

  // Memoize chart data - use processed errors for better categorization
  const errorChartData = useMemo(() => {
    if (!errorsData?.errors_over_time) return [];
    
    return errorsData.errors_over_time.map(point => ({
      date: safeFormatDate(point.date, 'MMM d'),
      errors: point.Error || 0
    }));
  }, [errorsData?.errors_over_time]);

  // Handle loading progress animation
  useEffect(() => {
    if (isLoadingErrors) {
      const intervals = [
        { target: 20, duration: 800 },
        { target: 45, duration: 1300 },
        { target: 70, duration: 1800 },
        { target: 90, duration: 2000 }
      ];
      
      const cleanup: NodeJS.Timeout[] = [];
      
      intervals.forEach((interval, index) => {
        const timeout = setTimeout(() => {
          setLoadingProgress(interval.target);
        }, interval.duration * (index === 0 ? 1 : index));
        
        cleanup.push(timeout);
      });
      
      return () => {
        for (const timeout of cleanup) {
          clearTimeout(timeout);
        }
      };
    }
    
    // Reset progress when loading is complete
    setLoadingProgress(100);
    
      // After animation completes, reset to 0
      const timeout = setTimeout(() => {
        setLoadingProgress(0);
      }, 1000);
      
    return () => clearTimeout(timeout);
  }, [isLoadingErrors]);

  // Calculate summary stats for StatCards
  const totalErrorOccurrences = useMemo(() => {
    return processedErrors.reduce((sum, error) => sum + error.count, 0);
  }, [processedErrors]);

  const uniqueErrorTypesCount = useMemo(() => {
    return processedErrors.length;
  }, [processedErrors]);

  const affectedSessions = useMemo(() => {
    const sessions = new Set();
    if (errorsData?.recent_errors) {
      for (const error of errorsData.recent_errors) {
        sessions.add((error as any).session_id);
      }
    }
    return sessions.size;
  }, [errorsData?.recent_errors]);

  // Only show error state when there's a real error with summary data and not loading
  if (errorsError && !isLoading) {
    return (
      <div className="pt-6">
        <EmptyState
          icon={<AlertCircle className="h-10 w-10" />}
          title="Error loading error data"
          description="Unable to load error metrics for this website."
          action={null}
        />
      </div>
    );
  }

  // Only show empty state when we're not loading and have no data
  if (!isLoading && (!errorsData?.recent_errors || errorsData.recent_errors.length === 0)) {
    return (
      <div className="pt-6">
        <EmptyState
          icon={<Bug className="h-10 w-10" />}
          title="No errors detected"
          description="We haven't detected any errors on your website during this time period."
          action={null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Error Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and analyze errors affecting your website
          </p>
        </div>
      </div>
      
      {/* Summary Stats */}
      {!isLoading && errorsData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard
            title="Total Errors"
            value={totalErrorOccurrences.toLocaleString()}
            icon={AlertTriangle}
            isLoading={isLoading}
            variant="danger"
            description="Total error occurrences"
          />
          <StatCard
            title="Error Types"
            value={uniqueErrorTypesCount.toLocaleString()}
            icon={Bug}
            isLoading={isLoading}
            variant="default"
            description="Distinct error types"
          />
          <StatCard
            title="Affected Sessions"
            value={affectedSessions.toLocaleString()}
            icon={User}
            isLoading={isLoading}
            variant="warning"
            description="Sessions with errors"
          />
        </div>
      )}

      {isLoading && !errorsData ? (
        <AnimatedLoading type="errors" progress={loadingProgress} />
      ) : errorsData ? (
        <>
          {/* Error Trends Chart */}
          <div className="rounded-lg border shadow-sm">
            <div className="p-3 border-b flex flex-col sm:flex-row justify-between items-start gap-2">
              <div>
                <h3 className="text-base font-semibold">Error Trends</h3>
                <p className="text-xs text-muted-foreground">
                  Error occurrences over time
                  {dateRange.granularity === 'hourly' ? ' (hourly data)' : ' (daily data)'}
                </p>
              </div>
              
              {errorChartData.length > 5 && (
                <div className="flex items-center gap-2">
                  {isZoomed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetZoom}
                      className="h-7 px-2 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset Zoom
                    </Button>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Drag to zoom
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-2">
              {errorChartData && errorChartData.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={errorChartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: errorChartData.length > 5 ? 35 : 5 }}
                    >
                      <defs>
                        <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="var(--border)" 
                        strokeOpacity={0.5} 
                      />
                      
                      <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                        dy={5}
                        domain={zoomDomain.startIndex !== undefined && zoomDomain.endIndex !== undefined ? [zoomDomain.startIndex, zoomDomain.endIndex] : undefined}
                      />
                      
                      <YAxis 
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                          if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
                          return value.toString();
                        }}
                      />
                      
                      <Tooltip 
                        content={<ErrorChartTooltip />} 
                        wrapperStyle={{ outline: 'none' }} 
                      />
                      
                      <Legend 
                        wrapperStyle={{ 
                          fontSize: '10px', 
                          paddingTop: '5px',
                          bottom: errorChartData.length > 5 ? 20 : 0
                        }}
                        formatter={(value) => (
                          <span className="text-xs">Error Occurrences</span>
                        )}
                        iconType="circle"
                        iconSize={8}
                      />
                      
                      <Area 
                        type="monotone" 
                        dataKey="errors" 
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#colorErrors)" 
                        strokeWidth={2}
                        activeDot={{ r: 4, strokeWidth: 2, fill: '#ef4444' }}
                        name="Errors"
                      />
                      
                      {errorChartData.length > 5 && (
                        <Brush
                          dataKey="date"
                          padding={{ top: 5, bottom: 5 }}
                          height={25}
                          stroke="var(--border)"
                          fill="var(--muted)"
                          fillOpacity={0.1}
                          onChange={handleBrushChange}
                          startIndex={zoomDomain.startIndex}
                          endIndex={zoomDomain.endIndex}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          }}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Bug className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No error trend data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Error Types List */}
          <div className="rounded-lg border shadow-sm">
            <div className="p-3 border-b">
              <h3 className="text-base font-semibold">Error Types</h3>
              <p className="text-xs text-muted-foreground">
                Categorized errors affecting your website
              </p>
            </div>
            
            <div className="divide-y">
              {processedErrors && processedErrors.length > 0 ? (
                processedErrors.map((error) => (
                  <button
                    key={`${error.error_type}-${error.last_occurrence}`}
                    type="button"
                    className="w-full p-3 hover:bg-muted/50 transition-colors text-left"
                    onClick={() => setSelectedError(error.sample_error)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getErrorTypeIcon(error.error_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(error.severity)}>
                            {error.error_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {error.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {error.error_message}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {error.count}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {error.unique_sessions}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {safeFormatDate(error.last_occurrence, 'MMM d, HH:mm')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-semibold">{error.count}</div>
                          <div className="text-xs text-muted-foreground">errors</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  <Bug className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No error data available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Pagination */}
          {errorsData.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {errorPage} of {errorsData.total_pages}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setErrorPage(1)}
                  disabled={errorPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <ChevronLeft className="h-4 w-4 -ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setErrorPage(Math.max(1, errorPage - 1))}
                  disabled={errorPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, errorsData.total_pages) }, (_, i) => {
                  let pageNum: number;
                  if (errorsData.total_pages <= 5) {
                    pageNum = i + 1;
                  } else {
                    const offset = Math.min(
                      Math.max(0, errorPage - 3),
                      Math.max(0, errorsData.total_pages - 5)
                    );
                    pageNum = i + 1 + offset;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === errorPage ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setErrorPage(pageNum)}
                      disabled={isLoading}
                    >
                      <span className="text-xs">{pageNum}</span>
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setErrorPage(Math.min(errorsData.total_pages, errorPage + 1))}
                  disabled={errorPage === errorsData.total_pages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setErrorPage(errorsData.total_pages)}
                  disabled={errorPage === errorsData.total_pages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4 -ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border shadow-sm p-6 text-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-base font-medium mb-1">No error data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No error data is available for the selected time period.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRefreshing(true);
                errorsRefetch()
                  .then(() => {
                    toast.success("Error data refreshed");
                  })
                  .catch(() => {
                    toast.error("Failed to refresh error data");
                  })
                  .finally(() => {
                    setIsRefreshing(false);
                  });
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Error Detail Dialog */}
      <Dialog open={!!selectedError} onOpenChange={(open) => {
        if (!open) setSelectedError(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedError && getErrorTypeIcon(categorizeError(selectedError.error_message).type)}
              Error Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this error occurrence
            </DialogDescription>
          </DialogHeader>
          
          {selectedError && (
            <div className="space-y-4">
              {/* Error Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="p-3">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Error Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">Type</div>
                      <p className="text-sm">{categorizeError(selectedError.error_message).type}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">Time</div>
                      <p className="text-sm">{safeFormatDate(selectedError.time, 'MMM d, yyyy HH:mm:ss')}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">Page URL</div>
                      <p className="text-sm break-all">{(selectedError as any).page_url || selectedError.url}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-3">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    User Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">Session ID</div>
                      <p className="text-sm font-mono">{(selectedError as any).session_id || 'N/A'}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">Location</div>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {(selectedError as any).city && (selectedError as any).country 
                          ? `${(selectedError as any).city}, ${(selectedError as any).country}`
                          : (selectedError as any).country || 'Unknown'
                        }
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">Device</div>
                      <p className="text-sm flex items-center gap-1">
                        {getDeviceIcon((selectedError as any).device_type)}
                        {(selectedError as any).device_type} • {(selectedError as any).browser} • {(selectedError as any).os}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Error Message */}
              <Card className="p-3">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                  <Code className="h-4 w-4" />
                  Error Message
                </h4>
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-mono break-words">{selectedError.error_message}</p>
                </div>
              </Card>
              
              {/* Stack Trace */}
              {(selectedError as any).error_stack && (
                <Card className="p-3">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <Terminal className="h-4 w-4" />
                    Stack Trace
                  </h4>
                  <div className="bg-muted/50 p-3 rounded-md max-h-48 overflow-y-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {(selectedError as any).error_stack}
                    </pre>
                  </div>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 