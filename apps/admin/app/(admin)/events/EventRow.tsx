"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  Globe,
  User,
  Clock,
  Copy as CopyIcon,
  Monitor,
  Smartphone,
  Tablet,
  Zap,
  MousePointer,
  Eye,
  TrendingUp,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ClickhouseEvent } from "./actions";

function tryParseJSON(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

function copyToClipboard(text: string) {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "-";
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatMs(ms: number | null | undefined): string {
  if (!ms) return "-";
  return `${ms}ms`;
}

function getDeviceIcon(deviceType: string | null) {
  switch (deviceType?.toLowerCase()) {
    case 'mobile': return <Smartphone className="h-3 w-3" />;
    case 'tablet': return <Tablet className="h-3 w-3" />;
    default: return <Monitor className="h-3 w-3" />;
  }
}

export function EventRow({ event }: { event: ClickhouseEvent }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const properties = tryParseJSON(event.properties || "{}");
  const date = new Date(event.time);
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });
  const formattedTime = date.toLocaleString();

  const getEventBadgeVariant = (eventName: string) => {
    switch (eventName) {
      case "screen_view":
      case "page_view": return "default";
      case "click":
      case "link_out": return "secondary";
      case "error": return "destructive";
      case "page_exit": return "outline";
      default: return "outline";
    }
  };

  function handleCopy() {
    const fullEventData = {
      ...event,
      properties: properties
    };
    copyToClipboard(JSON.stringify(fullEventData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className={cn(
          "flex items-center gap-3 px-4 py-3 w-full text-left cursor-pointer hover:bg-muted/50 transition-colors",
          open && "bg-muted/30"
        )}>
          <Badge variant={getEventBadgeVariant(event.event_name)} className="min-w-[80px] justify-center text-xs">
            {event.event_name}
          </Badge>

          <div className="flex items-center gap-1 min-w-0">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {timeAgo}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{event.path || "/"}</div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
              <div className="hidden md:flex items-center gap-1">
                {getDeviceIcon(event.device_type)}
                <span className="truncate max-w-[100px]">
                  {event.browser_name || "Unknown"}
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span className="truncate max-w-[80px]">
                  {event.country || "Unknown"}
                </span>
              </div>
              <div className="hidden xl:flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[120px]" title={event.session_id}>
                  {event.session_id.slice(-8)}
                </span>
              </div>
              <div className="md:hidden">
                {event.browser_name || "Unknown"}
              </div>
            </div>
          </div>

          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )} />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 py-4 border-t bg-muted/20">
          <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
            {/* Event Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Event Details
              </h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs truncate max-w-[160px]" title={event.id}>
                    {event.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="text-xs">{formattedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">URL:</span>
                  <span className="text-xs truncate max-w-[160px]" title={event.url}>
                    {event.url || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="text-xs truncate max-w-[160px]" title={event.title || "-"}>
                    {event.title || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referrer:</span>
                  <span className="text-xs truncate max-w-[160px]" title={event.referrer || "-"}>
                    {event.referrer || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* User & Device */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                User & Device
              </h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP:</span>
                  <span className="text-xs font-mono">{event.ip || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Browser:</span>
                  <span className="text-xs">
                    {[event.browser_name, event.browser_version].filter(Boolean).join(" ") || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OS:</span>
                  <span className="text-xs">
                    {[event.os_name, event.os_version].filter(Boolean).join(" ") || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device:</span>
                  <span className="text-xs flex items-center gap-1">
                    {getDeviceIcon(event.device_type)}
                    {event.device_type || "Desktop"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-xs">
                    {[event.city, event.region, event.country].filter(Boolean).join(", ") || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Screen:</span>
                  <span className="text-xs">{event.screen_resolution || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="text-xs">{event.language || "-"}</span>
                </div>
              </div>
            </div>

            {/* Performance & Engagement */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance & Engagement
              </h4>
              <div className="grid gap-2 text-sm">
                {(event as any).load_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Load Time:</span>
                    <span className="text-xs">{formatMs((event as any).load_time)}</span>
                  </div>
                )}
                {(event as any).ttfb && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TTFB:</span>
                    <span className="text-xs">{formatMs((event as any).ttfb)}</span>
                  </div>
                )}
                {(event as any).fcp && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FCP:</span>
                    <span className="text-xs">{formatMs((event as any).fcp)}</span>
                  </div>
                )}
                {(event as any).lcp && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LCP:</span>
                    <span className="text-xs">{formatMs((event as any).lcp)}</span>
                  </div>
                )}
                {(event as any).cls !== undefined && (event as any).cls !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CLS:</span>
                    <span className="text-xs">{((event as any).cls).toFixed(4)}</span>
                  </div>
                )}
                {(event as any).time_on_page && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time on Page:</span>
                    <span className="text-xs">{(event as any).time_on_page}s</span>
                  </div>
                )}
                {(event as any).scroll_depth !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scroll Depth:</span>
                    <span className="text-xs">{(event as any).scroll_depth}%</span>
                  </div>
                )}
                {(event as any).interaction_count !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interactions:</span>
                    <span className="text-xs">{(event as any).interaction_count}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* UTM Parameters */}
          {((event as any).utm_source || (event as any).utm_medium || (event as any).utm_campaign) && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Campaign Data
              </h4>
              <div className="grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
                {(event as any).utm_source && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="text-xs">{(event as any).utm_source}</span>
                  </div>
                )}
                {(event as any).utm_medium && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medium:</span>
                    <span className="text-xs">{(event as any).utm_medium}</span>
                  </div>
                )}
                {(event as any).utm_campaign && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Campaign:</span>
                    <span className="text-xs">{(event as any).utm_campaign}</span>
                  </div>
                )}
                {(event as any).utm_term && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Term:</span>
                    <span className="text-xs">{(event as any).utm_term}</span>
                  </div>
                )}
                {(event as any).utm_content && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Content:</span>
                    <span className="text-xs">{(event as any).utm_content}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Connection Info */}
          {((event as any).connection_type || (event as any).rtt || (event as any).downlink) && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Connection
              </h4>
              <div className="grid gap-2 text-sm md:grid-cols-3">
                {(event as any).connection_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="text-xs">{(event as any).connection_type}</span>
                  </div>
                )}
                {(event as any).rtt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RTT:</span>
                    <span className="text-xs">{(event as any).rtt}ms</span>
                  </div>
                )}
                {(event as any).downlink && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Downlink:</span>
                    <span className="text-xs">{(event as any).downlink} Mbps</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Properties */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-foreground">Raw Event Data</h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="h-7 text-xs"
              >
                <CopyIcon className="h-3 w-3 mr-1" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <pre className="bg-muted text-foreground rounded-md p-3 text-xs font-mono overflow-auto max-h-[200px] border">
              {JSON.stringify({ ...event, properties }, null, 2)}
            </pre>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function EventRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-6 w-20 rounded" />
      <Skeleton className="h-4 w-16 rounded" />
      <div className="flex-1">
        <Skeleton className="h-4 w-48 rounded mb-1" />
        <Skeleton className="h-3 w-32 rounded" />
      </div>
      <Skeleton className="h-4 w-4 rounded" />
    </div>
  );
} 