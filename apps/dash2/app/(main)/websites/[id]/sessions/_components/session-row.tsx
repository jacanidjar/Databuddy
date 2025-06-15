"use client";

import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon, ChevronRightIcon, ClockIcon, EyeIcon, MousePointerClickIcon, AlertTriangleIcon, SparklesIcon } from "lucide-react";
import { getCountryFlag, getDeviceIcon, getBrowserIconComponent, getOSIconComponent } from "./session-utils";
import { SessionEventTimeline } from "./session-event-timeline";

interface SessionRowProps {
    session: any;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
}

export function SessionRow({ session, index, isExpanded, onToggle }: SessionRowProps) {
    const errorCount = session.events?.filter((e: any) => e.error_message).length || 0;
    const customEventCount = session.events?.filter((e: any) =>
        e.properties && Object.keys(e.properties).length > 0
    ).length || 0;

    return (
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-5 hover:bg-muted/30 cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-primary/20">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Expand/Collapse and Session Number */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {isExpanded ? (
                                <ChevronDownIcon className="w-4 h-4 text-muted-foreground transition-transform" />
                            ) : (
                                <ChevronRightIcon className="w-4 h-4 text-muted-foreground transition-transform" />
                            )}
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                                {index + 1}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {getCountryFlag(session.country)}
                            {getDeviceIcon(session.device)}
                            {getBrowserIconComponent(session.browser)}
                            {getOSIconComponent(session.os)}
                        </div>

                        {/* Session Info */}
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-foreground truncate text-base">
                                {session.session_name}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>{session.browser}</span>
                                <span className="text-muted-foreground/60">•</span>
                                <span>{session.country || 'Unknown'}</span>
                                {session.is_returning_visitor && (
                                    <>
                                        <span className="text-muted-foreground/60">•</span>
                                        <span className="text-blue-600 font-medium">Returning</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm flex-shrink-0 ml-4">
                        <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
                            <ClockIcon className="w-4 h-4" />
                            <span>{session.duration_formatted}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
                            <EyeIcon className="w-4 h-4" />
                            <span>{session.page_views}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {session.events?.length || 0}
                            </Badge>

                            {/* Custom Events */}
                            {customEventCount > 0 && (
                                <Badge className="text-xs bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-sm">
                                    <SparklesIcon className="w-3 h-3 mr-1" />
                                    {customEventCount}
                                </Badge>
                            )}

                            {/* Errors */}
                            {errorCount > 0 && (
                                <Badge className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">
                                    <AlertTriangleIcon className="w-3 h-3 mr-1" />
                                    {errorCount}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <div className="px-4 pb-4 bg-muted/20 border-t border-border">
                    {/* Session Info Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 text-sm border-b border-border/50">
                        <div>
                            <span className="text-muted-foreground block mb-1">Duration</span>
                            <div className="font-medium text-foreground">{session.duration_formatted}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Page Views</span>
                            <div className="font-medium text-foreground">{session.page_views}</div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Visitor Type</span>
                            <div className="font-medium text-foreground">
                                {session.is_returning_visitor ? (
                                    <span className="text-blue-600 font-semibold">Returning Visitor</span>
                                ) : (
                                    <span className="text-green-600 font-semibold">New Visitor</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Session Count</span>
                            <div className="font-medium text-foreground">
                                Session #{session.visitor_session_count || 1}
                            </div>
                        </div>
                    </div>

                    {/* Events Timeline */}
                    <div className="pt-6">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-semibold text-lg text-foreground">Event Timeline</h4>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                                    <span className="text-sm font-medium text-slate-700">{session.events?.length || 0} total</span>
                                </div>
                                {customEventCount > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-100 to-purple-100 rounded-lg">
                                        <SparklesIcon className="w-4 h-4 text-violet-600" />
                                        <span className="text-sm font-medium text-violet-700">{customEventCount} custom</span>
                                    </div>
                                )}
                                {errorCount > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-100 to-red-100 rounded-lg">
                                        <AlertTriangleIcon className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-medium text-red-700">{errorCount} errors</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <SessionEventTimeline events={session.events || []} />
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
} 