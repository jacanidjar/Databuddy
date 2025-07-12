"use client";

import { useEffect, useState } from "react";
import { fetchRealTimeStats } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";

interface EventsPerSecondData {
    timestamp: number;
    count: number;
}

export function RealTimeEventsWidget() {
    const [eventsData, setEventsData] = useState<EventsPerSecondData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stats = await fetchRealTimeStats();
                const now = Date.now();

                setEventsData(prev => {
                    const newData = [...prev, { timestamp: now, count: stats.events_last_minute }];
                    // Keep only last 60 seconds of data
                    return newData.filter(item => now - item.timestamp < 60000);
                });
            } catch (error) {
                console.error("Error fetching real-time stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Initial fetch
        fetchData();

        // Update every second
        const interval = setInterval(fetchData, 1000);

        return () => clearInterval(interval);
    }, []);

    const currentEventsPerSecond = eventsData.length > 1
        ? Math.max(0, eventsData[eventsData.length - 1].count - eventsData[eventsData.length - 2].count)
        : 0;

    const averageEventsPerSecond = eventsData.length > 1
        ? Math.round(eventsData.reduce((sum, item) => sum + item.count, 0) / eventsData.length)
        : 0;

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Current Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <div className="text-2xl font-bold text-primary">{currentEventsPerSecond}</div>
                    <div className="text-xs text-muted-foreground">Current/Second</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <div className="text-2xl font-bold text-primary">{averageEventsPerSecond}</div>
                    <div className="text-xs text-muted-foreground">Average/Second</div>
                </div>
            </div>

            {/* Live Chart */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Live Activity</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">Live</span>
                    </div>
                </div>

                <div className="h-48 bg-background border rounded-lg p-3">
                    {eventsData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <p className="text-sm">No data yet...</p>
                        </div>
                    ) : (
                        <div className="h-full flex items-end justify-between gap-1">
                            {eventsData.slice(-30).map((data, index) => {
                                const maxCount = Math.max(...eventsData.map(d => d.count), 1);
                                const height = Math.max(4, (data.count / maxCount) * 100);
                                const isRecent = index >= eventsData.length - 5;

                                return (
                                    <div
                                        key={data.timestamp}
                                        className={`flex-1 rounded-sm transition-all duration-300 ${isRecent ? 'bg-primary' : 'bg-muted-foreground/30'
                                            }`}
                                        style={{ height: `${height}%` }}
                                        title={`${data.count} events at ${new Date(data.timestamp).toLocaleTimeString()}`}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        Last 30 seconds • Updates every second
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded bg-muted/30">
                    <div className="text-sm font-bold text-primary">{eventsData.length}</div>
                    <div className="text-xs text-muted-foreground">Points</div>
                </div>
                <div className="p-2 rounded bg-muted/30">
                    <div className="text-sm font-bold text-primary">
                        {eventsData.length > 0 ? Math.max(...eventsData.map(d => d.count)) : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Peak</div>
                </div>
                <div className="p-2 rounded bg-muted/30">
                    <div className="text-sm font-bold text-primary">
                        {eventsData.length > 0 ? Math.min(...eventsData.map(d => d.count)) : 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Min</div>
                </div>
            </div>
        </div>
    );
} 