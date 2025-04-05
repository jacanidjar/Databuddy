import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonChart } from "./skeleton-chart";
import { LineChart } from "lucide-react";

// Simplified color palette for metrics
const METRIC_COLORS = {
  pageviews: "#3b82f6", // Blue-500
  visitors: "#22c55e", // Green-500
  unique_visitors: "#10b981", // Emerald-500
  sessions: "#eab308", // Yellow-500
  bounce_rate: "#ef4444", // Red-500
  avg_session_duration: "#a855f7", // Purple-500
};

// Clean tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  // Format duration strings
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0) result += `${minutes}m `;
    if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) result += `${remainingSeconds}s`;
    
    return result.trim();
  };

  return (
    <div className="bg-background border border-border p-3 shadow-md text-xs">
      <p className="font-semibold mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => {
          // Get the data point being hovered
          const dataPoint = entry.payload;
          
          // Format the value based on its type
          let displayValue;
          if (entry.name.toLowerCase().includes('bounce rate')) {
            displayValue = `${entry.value.toFixed(1)}%`;
          } else if (entry.name.toLowerCase().includes('session duration')) {
            displayValue = dataPoint.avg_session_duration_formatted || formatDuration(entry.value);
          } else {
            displayValue = entry.value.toLocaleString();
          }
          
          return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface MetricsChartProps {
  data: Array<{
    date: string;
    pageviews?: number;
    visitors?: number;
    unique_visitors?: number;
    sessions?: number;
    bounce_rate?: number;
    avg_session_duration?: number;
    [key: string]: any;
  }> | undefined;
  isLoading: boolean;
  height?: number;
  title?: string;
  description?: string;
  className?: string;
}

export function MetricsChart({ 
  data, 
  isLoading, 
  height = 300, 
  title = "Traffic Overview",
  description = "Pageviews, visitors and sessions over time",
  className
}: MetricsChartProps) {
  const chartData = useMemo(() => data || [], [data]);

  // Formatter for Y axis values
  const valueFormatter = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  // Formatter for duration values
  const durationFormatter = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  // Loading state
  if (isLoading) {
    return <SkeletonChart height={height} title={title} className="w-full" />;
  }

  // Empty state
  if (!chartData.length) {
    return (
      <Card className="w-full rounded-none border-none">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center p-4">
          <div className="text-center py-6">
            <LineChart className="mx-auto h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-2 text-sm font-medium">No data available</p>
            <p className="text-xs text-muted-foreground mt-1">Data will appear as it's collected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine which metrics are present in the data
  const hasPageviews = chartData.some(item => 'pageviews' in item && item.pageviews !== undefined);
  const hasVisitors = chartData.some(item => 'visitors' in item && item.visitors !== undefined);
  const hasUniqueVisitors = chartData.some(item => 'unique_visitors' in item && item.unique_visitors !== undefined);
  const hasSessions = chartData.some(item => 'sessions' in item && item.sessions !== undefined);
  const hasBounceRate = chartData.some(item => 'bounce_rate' in item && item.bounce_rate !== undefined);
  const hasAvgSessionDuration = chartData.some(item => 'avg_session_duration' in item && item.avg_session_duration !== undefined);

  return (
    <Card className="w-full rounded-none border-none rounded-b-xl">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0 px-0 pb-4">
        <div style={{ width: '100%', height: height - 70 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 8, bottom: 20 }}
            >
              <defs>
                {Object.entries(METRIC_COLORS).map(([key, color]) => (
                  <linearGradient key={key} id={`color${key.charAt(0).toUpperCase() + key.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
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
                dy={8}
              />
              
              <YAxis 
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                width={30}
                tickFormatter={valueFormatter}
                yAxisId="left"
              />
              
              {hasBounceRate && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                  width={35}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
              )}
              
              {hasAvgSessionDuration && (
                <YAxis 
                  yAxisId="duration"
                  orientation="right"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={durationFormatter}
                />
              )}
              
              <Tooltip 
                content={<CustomTooltip />} 
                wrapperStyle={{ outline: 'none' }} 
              />
              
              <Legend 
                wrapperStyle={{ 
                  fontSize: '10px', 
                  paddingTop: '10px',
                  bottom: 0
                }}
                formatter={(value) => (
                  <span className="text-xs">{value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')}</span>
                )}
                iconType="circle"
                iconSize={8}
              />
              
              {hasPageviews && (
                <Area 
                  type="monotone" 
                  dataKey="pageviews" 
                  stroke={METRIC_COLORS.pageviews} 
                  fillOpacity={1} 
                  fill={`url(#colorPageviews)`} 
                  strokeWidth={1.5}
                  activeDot={{ r: 4, strokeWidth: 1 }}
                  name="Pageviews"
                  yAxisId="left"
                />
              )}
              
              {hasVisitors && (
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke={METRIC_COLORS.visitors} 
                  fillOpacity={1} 
                  fill={`url(#colorVisitors)`} 
                  strokeWidth={1.5}
                  activeDot={{ r: 4, strokeWidth: 1 }}
                  name="Visitors"
                  yAxisId="left"
                />
              )}
              
              {hasUniqueVisitors && (
                <Area 
                  type="monotone" 
                  dataKey="unique_visitors" 
                  stroke={METRIC_COLORS.unique_visitors} 
                  fillOpacity={1} 
                  fill={`url(#colorUniqueVisitors)`} 
                  strokeWidth={1.5}
                  activeDot={{ r: 4, strokeWidth: 1 }}
                  name="Unique visitors"
                  yAxisId="left"
                />
              )}
              
              {hasSessions && (
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke={METRIC_COLORS.sessions} 
                  fillOpacity={1} 
                  fill={`url(#colorSessions)`} 
                  strokeWidth={1.5}
                  activeDot={{ r: 4, strokeWidth: 1 }}
                  name="Sessions"
                  yAxisId="left"
                />
              )}
              
              {hasBounceRate && (
                <Area 
                  type="monotone" 
                  dataKey="bounce_rate" 
                  stroke={METRIC_COLORS.bounce_rate} 
                  fillOpacity={1} 
                  fill={`url(#colorBounceRate)`} 
                  strokeWidth={1.5}
                  activeDot={{ r: 4, strokeWidth: 1 }}
                  name="Bounce rate"
                  yAxisId="right"
                />
              )}
              
              {hasAvgSessionDuration && (
                <Area 
                  type="monotone" 
                  dataKey="avg_session_duration" 
                  stroke={METRIC_COLORS.avg_session_duration} 
                  fillOpacity={1} 
                  fill={`url(#colorAvgSessionDuration)`} 
                  strokeWidth={1.5}
                  activeDot={{ r: 4, strokeWidth: 1 }}
                  name="Avg session duration"
                  yAxisId="duration"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 