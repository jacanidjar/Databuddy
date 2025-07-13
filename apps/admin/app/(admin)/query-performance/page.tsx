import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Zap,
    Clock,
    Database,
    TrendingUp,
    AlertTriangle,
    HardDrive,
    Download,
    Trash2,
    Info,
    Table as TableIcon
} from "lucide-react";
import {
    getQueryPerformanceSummary,
    getSlowQueries,
    getQueryPerformanceByDatabase,
    getMostFrequentSlowQueries,
    getSystemTables,
    getClickhouseDisks,
    getMemoryIntensiveQueries,
    getActualDatabaseTables
} from "./actions";
import { format } from 'date-fns';
import { DataTableToolbar } from "@/components/admin/data-table-toolbar";
import { formatNumber } from "@/components/website-event-metrics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemTables } from "./system-tables";
import { ActualTables } from "./actual-tables";
import React from "react"; // Added for React.useState

// Helper function to format duration
const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
};

// Helper function to format bytes
const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`;
};

// Helper function to truncate SQL queries
const truncateQuery = (query: string, maxLength = 100) => {
    if (query.length <= maxLength) return query;
    return `${query.substring(0, maxLength)}...`;
};

// Helper function to get performance badge color
const getPerformanceBadge = (durationMs: number) => {
    if (durationMs < 1000) return { variant: "default" as const, label: "Fast" };
    if (durationMs < 5000) return { variant: "secondary" as const, label: "Medium" };
    if (durationMs < 30000) return { variant: "destructive" as const, label: "Slow" };
    return { variant: "destructive" as const, label: "Critical" };
};

export default async function QueryPerformancePage({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
        threshold?: string;
        timeRange?: string;
    }>;
}) {
    const { search, threshold = "1000", timeRange = "24" } = await searchParams;

    const durationThreshold = Number.parseInt(threshold, 10);
    const timeRangeHours = Number.parseInt(timeRange, 10);

    // Fetch all performance data in parallel
    const [
        { summary, error: summaryError },
        { queries: slowQueries, error: slowQueriesError },
        { databases, error: databasesError },
        { frequentQueries, error: frequentQueriesError },
        { tables: systemTables, error: systemTablesError },
        { disks: clickhouseDisks, error: disksError },
        { queries: memoryIntensive, error: memoryIntensiveError },
        { tables: actualTables, error: actualTablesError }
    ] = await Promise.all([
        getQueryPerformanceSummary(timeRangeHours, durationThreshold),
        getSlowQueries({
            duration_threshold_ms: durationThreshold,
            time_range_hours: timeRangeHours
        }),
        getQueryPerformanceByDatabase(timeRangeHours),
        getMostFrequentSlowQueries(timeRangeHours, durationThreshold),
        getSystemTables(),
        getClickhouseDisks(),
        getMemoryIntensiveQueries(timeRangeHours),
        getActualDatabaseTables()
    ]);

    // Filter slow queries based on search
    const filteredSlowQueries = slowQueries?.filter((query) => {
        if (!search) return true;
        return (
            query.query?.toLowerCase().includes(search.toLowerCase()) ||
            query.query_id?.toLowerCase().includes(search.toLowerCase()) ||
            query.user?.toLowerCase().includes(search.toLowerCase()) ||
            query.databases?.some(db => db.toLowerCase().includes(search.toLowerCase()))
        );
    });

    if (summaryError || slowQueriesError || databasesError || frequentQueriesError || actualTablesError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Error Loading Query Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-destructive">
                        {summaryError && <p>Summary: {summaryError}</p>}
                        {slowQueriesError && <p>Slow Queries: {slowQueriesError}</p>}
                        {databasesError && <p>Database Performance: {databasesError}</p>}
                        {frequentQueriesError && <p>Frequent Queries: {frequentQueriesError}</p>}
                        {actualTablesError && <p>Actual Tables: {actualTablesError}</p>}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Zap className="h-6 w-6" />
                        Query Performance
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Monitor and optimize ClickHouse query performance • Last {timeRangeHours}h • Threshold: {durationThreshold}ms
                    </p>
                </div>
                <DataTableToolbar
                    placeholder="Search queries, users, databases..."
                />
            </div>

            {/* Disk Storage Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-muted-foreground" />
                        ClickHouse Storage
                    </CardTitle>
                    <CardDescription>Physical disk space available to ClickHouse</CardDescription>
                </CardHeader>
                <CardContent>
                    {disksError ? (
                        <div className="text-destructive text-sm">{disksError}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr>
                                        <th className="text-left font-semibold">Disk</th>
                                        <th className="text-left font-semibold">Path</th>
                                        <th className="text-right font-semibold">Total</th>
                                        <th className="text-right font-semibold">Used</th>
                                        <th className="text-right font-semibold">Free</th>
                                        <th className="text-right font-semibold">Keep Free</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clickhouseDisks.map((disk) => (
                                        <tr key={disk.name}>
                                            <td>{disk.name}</td>
                                            <td className="font-mono text-xs">{disk.path}</td>
                                            <td className="text-right">{disk.total_space}</td>
                                            <td className="text-right">{disk.used_space}</td>
                                            <td className="text-right">{disk.free_space}</td>
                                            <td className="text-right">{disk.keep_free_space}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Performance Summary Cards */}
            {summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(summary.total_queries)}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.slow_queries_count} slow queries
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatDuration(summary.avg_duration_ms)}</div>
                            <p className="text-xs text-muted-foreground">
                                Average execution time
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Memory</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.avg_memory_mb.toFixed(1)} MB</div>
                            <p className="text-xs text-muted-foreground">
                                Average memory usage
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Data Processed</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(summary.total_rows_read)}</div>
                            <p className="text-xs text-muted-foreground">
                                Total rows processed
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="slow-queries" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="slow-queries">Slow Queries</TabsTrigger>
                    <TabsTrigger value="frequent-queries">Frequent Slow Queries</TabsTrigger>
                    <TabsTrigger value="database-performance">Database Performance</TabsTrigger>
                    <TabsTrigger value="memory-intensive">Memory Intensive</TabsTrigger>
                    <TabsTrigger value="actual-tables">Actual Tables</TabsTrigger>
                    <TabsTrigger value="system-tables">System Tables</TabsTrigger>
                </TabsList>

                <TabsContent value="slow-queries" className="space-y-2">
                    {/* TL;DR summary */}
                    <Card className="bg-muted/50 border-0 shadow-none">
                        <CardContent className="p-3 text-xs text-muted-foreground">
                            <span className="font-semibold">TL;DR:</span> The slowest queries in the last 24 hours, sorted by duration. Truncated for quick review.
                        </CardContent>
                    </Card>
                    {(!filteredSlowQueries || filteredSlowQueries.length === 0) ? (
                        <Card><CardContent className="p-6 text-center text-muted-foreground text-xs">No slow queries found</CardContent></Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {filteredSlowQueries.map((query, idx) => (
                                <Card key={query.query_id} className={`border p-2 ${idx === 0 ? "border-destructive/60" : ""}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-[10px] text-muted-foreground">{query.query_id.slice(-6)}</span>
                                        {query.exception && <Badge variant="destructive" className="text-[10px] px-1 py-0">Error</Badge>}
                                        {idx === 0 && <Badge variant="destructive" className="text-[10px] px-1 py-0">Slowest</Badge>}
                                        <span className="ml-auto text-[10px] text-muted-foreground">{format(new Date(query.event_time), 'MMM d, HH:mm')}</span>
                                    </div>
                                    <div className="font-mono text-xs bg-muted rounded px-2 py-1 mb-1 max-w-full overflow-x-auto whitespace-pre-wrap" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                        {truncateQuery(query.query, 200)}
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                                        <span><b>Dur:</b> <span className="text-foreground font-semibold">{formatDuration(query.query_duration_ms)}</span></span>
                                        <span><b>Rows:</b> <span className="text-foreground font-semibold">{formatNumber(query.read_rows)}</span></span>
                                        <span><b>Mem:</b> <span className="text-foreground font-semibold">{(query.peak_memory_usage / 1024 / 1024).toFixed(1)}MB</span></span>
                                        <span><b>User:</b> {query.user || 'Unknown'}</span>
                                        <span><b>DB:</b> {query.databases?.join(', ') || 'N/A'}</span>
                                        {query.exception && <span className="text-destructive"><b>Err:</b> {truncateQuery(query.exception, 40)}</span>}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="frequent-queries" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Most Frequent Slow Queries</CardTitle>
                            <CardDescription>
                                Queries that appear frequently in slow query logs (grouped by normalized hash)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(!frequentQueries || frequentQueries.length === 0) ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No frequent slow queries found
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Query Pattern</TableHead>
                                            <TableHead className="text-center">Frequency</TableHead>
                                            <TableHead className="text-center">Avg Duration</TableHead>
                                            <TableHead className="text-center">Max Duration</TableHead>
                                            <TableHead className="hidden lg:table-cell">Databases</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {frequentQueries.map((query) => {
                                            const perfBadge = getPerformanceBadge(query.avg_duration_ms);
                                            return (
                                                <TableRow key={query.normalized_query_hash}>
                                                    <TableCell className="max-w-[400px]">
                                                        <div className="space-y-2">
                                                            <code className="text-xs bg-muted px-2 py-1 rounded text-wrap break-all">
                                                                {truncateQuery(query.sample_query, 200)}
                                                            </code>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={perfBadge.variant} className="text-xs h-4">
                                                                    {perfBadge.label}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground font-mono">
                                                                    {query.normalized_query_hash.slice(-12)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">
                                                                {query.frequency}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                times
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="font-semibold text-sm">
                                                            {formatDuration(query.avg_duration_ms)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="font-semibold text-sm">
                                                            {formatDuration(query.max_duration_ms)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        <div className="flex flex-wrap gap-1">
                                                            {query.databases?.slice(0, 2).map((db) => (
                                                                <Badge key={db} variant="outline" className="text-xs">
                                                                    {db}
                                                                </Badge>
                                                            ))}
                                                            {query.databases?.length > 2 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{query.databases.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="database-performance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Database Performance</CardTitle>
                            <CardDescription>
                                Performance breakdown by database in the last {timeRangeHours} hours
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(!databases || databases.length === 0) ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No database performance data found
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Database</TableHead>
                                            <TableHead className="text-center">Queries</TableHead>
                                            <TableHead className="text-center">Slow Queries</TableHead>
                                            <TableHead className="text-center">Errors</TableHead>
                                            <TableHead className="text-center">Avg Duration</TableHead>
                                            <TableHead className="text-center">Max Duration</TableHead>
                                            <TableHead className="hidden lg:table-cell">Most Active User</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {databases.map((db) => {
                                            const perfBadge = getPerformanceBadge(db.avg_duration_ms);
                                            return (
                                                <TableRow key={db.database}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Database className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">{db.database}</span>
                                                            <Badge variant={perfBadge.variant} className="text-xs h-4">
                                                                {perfBadge.label}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="font-semibold">
                                                            {formatNumber(db.query_count)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">
                                                                {db.slow_queries_count} slow
                                                            </span>
                                                            {db.very_slow_queries_count > 0 && (
                                                                <span className="text-xs text-destructive">
                                                                    {db.very_slow_queries_count} very slow
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {db.error_count > 0 ? (
                                                            <Badge variant="destructive" className="text-xs">
                                                                {db.error_count}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">0</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="font-semibold">
                                                            {formatDuration(db.avg_duration_ms)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="font-semibold">
                                                            {formatDuration(db.max_duration_ms)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        <span className="text-sm">{db.most_active_user || 'Unknown'}</span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="memory-intensive" className="space-y-2">
                    <Card className="bg-muted/50 border-0 shadow-none">
                        <CardContent className="p-3 text-xs text-muted-foreground">
                            <span className="font-semibold">TL;DR:</span> The queries that used the most memory in the last 24 hours. Useful for finding memory hogs and optimization opportunities.
                        </CardContent>
                    </Card>
                    {(!memoryIntensive || memoryIntensive.length === 0) ? (
                        <Card><CardContent className="p-6 text-center text-muted-foreground text-xs">No memory intensive queries found</CardContent></Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {memoryIntensive.map((query, idx) => (
                                <Card key={query.query_id} className={`border p-2 ${idx === 0 ? "border-destructive/60" : ""}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-[10px] text-muted-foreground">{query.query_id.slice(-6)}</span>
                                        {query.exception && <Badge variant="destructive" className="text-[10px] px-1 py-0">Error</Badge>}
                                        {idx === 0 && <Badge variant="destructive" className="text-[10px] px-1 py-0">Most Memory</Badge>}
                                        <span className="ml-auto text-[10px] text-muted-foreground">{format(new Date(query.event_time), 'MMM d, HH:mm')}</span>
                                    </div>
                                    <div className="font-mono text-xs bg-muted rounded px-2 py-1 mb-1 max-w-full overflow-x-auto whitespace-pre-wrap" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                        {truncateQuery(query.query, 200)}
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                                        <span><b>Peak Mem:</b> <span className="text-foreground font-semibold">{(query.memory_usage / 1024 / 1024).toFixed(1)}MB</span></span>
                                        <span><b>Dur:</b> <span className="text-foreground font-semibold">{formatDuration(query.query_duration_ms)}</span></span>
                                        <span><b>Rows:</b> <span className="text-foreground font-semibold">{formatNumber(query.read_rows)}</span></span>
                                        <span><b>User:</b> {query.user || 'Unknown'}</span>
                                        <span><b>DB:</b> {query.databases?.join(', ') || 'N/A'}</span>
                                        {query.exception && <span className="text-destructive"><b>Err:</b> {truncateQuery(query.exception, 40)}</span>}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="actual-tables" className="space-y-4">
                    <ActualTables tables={actualTables || []} />
                </TabsContent>

                <TabsContent value="system-tables" className="space-y-4">
                    <SystemTables tables={systemTables || []} />
                </TabsContent>
            </Tabs>
        </div>
    );
} 