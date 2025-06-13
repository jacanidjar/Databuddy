"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    RefreshCw,
    AlertCircle,
    Globe,
    Banknote,
    Receipt,
    Users,
    BarChart3,
    PieChart,
    LineChart,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Eye,
    EyeOff,
    Calendar,
    Filter,
    type LucideIcon
} from "lucide-react";
import { useRevenueAnalytics } from "../../hooks/use-revenue-analytics";
import { useAtom } from 'jotai';
import { formattedDateRangeAtom } from '@/stores/jotai/filterAtoms';
import { cn } from "@/lib/utils";
import { MetricsChart } from "@/components/charts/metrics-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { VersatileAIChart } from "@/components/charts/versatile-ai-chart";
import { DataTable } from "@/components/analytics/data-table";
import { StatCard } from "@/components/analytics/stat-card";

// Enhanced metric card with mini charts
interface EnhancedMetricCardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: LucideIcon;
    description?: string;
    trend?: number;
    chartData?: Array<{ date: string; value: number }>;
    className?: string;
}

function EnhancedMetricCard({
    title,
    value,
    change,
    changeType,
    icon,
    description,
    trend,
    chartData,
    className
}: EnhancedMetricCardProps) {
    return (
        <StatCard
            title={title}
            value={value}
            icon={icon as any}
            description={description}
            isLoading={false}
            variant="default"
            trend={trend}
            trendLabel={change ? "vs previous period" : undefined}
            className={cn("h-full", className)}
            chartData={chartData}
            showChart={!!chartData}
            id={`${title.toLowerCase().replace(/\s+/g, '-')}-chart`}
        />
    );
}

// Revenue trend chart data processor
function processRevenueChartData(trends: any[]) {
    if (!trends || trends.length === 0) return [];

    return trends.map(item => ({
        date: item.date,
        revenue: item.total_revenue || 0,
        transactions: item.total_transactions || 0,
        avg_order_value: item.avg_order_value || 0,
        success_rate: item.success_rate || 0
    }));
}

// Distribution chart data processor
function processDistributionData(data: any[], valueKey: string = 'total_revenue', nameKey: string = 'name') {
    if (!data || data.length === 0) return [];

    return data.slice(0, 6).map(item => ({
        name: item[nameKey] || 'Unknown',
        value: item[valueKey] || 0
    }));
}

// Metric toggles component
interface MetricTogglesProps {
    metrics: Record<string, boolean>;
    onToggle: (metric: string) => void;
    colors: Record<string, string>;
}

function MetricToggles({ metrics, onToggle, colors }: MetricTogglesProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {Object.entries(metrics).map(([metric, visible]) => (
                <Button
                    key={metric}
                    variant={visible ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggle(metric)}
                    className="h-7 px-2 text-xs"
                >
                    <div
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: visible ? colors[metric] : 'transparent' }}
                    />
                    {metric.charAt(0).toUpperCase() + metric.slice(1).replace(/_/g, ' ')}
                    {visible ? <Eye className="ml-1 h-3 w-3" /> : <EyeOff className="ml-1 h-3 w-3" />}
                </Button>
            ))}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {/* Metrics skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-80 w-full" />
                </CardContent>
            </Card>

            {/* Distribution charts skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tables skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <div key={j} className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export function RevenueAnalyticsTab() {
    const [formattedDateRange] = useAtom(formattedDateRangeAtom);

    // Chart visibility toggles
    const [visibleMetrics, setVisibleMetrics] = useState<Record<string, boolean>>({
        revenue: true,
        transactions: true,
        avg_order_value: false,
        success_rate: false,
    });

    const toggleMetric = useCallback((metric: string) => {
        setVisibleMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
    }, []);

    // Metric colors
    const metricColors = {
        revenue: '#3b82f6',
        transactions: '#10b981',
        avg_order_value: '#f59e0b',
        success_rate: '#8b5cf6'
    };

    // Convert the formatted date range to the expected format
    const dateRange = useMemo(() => ({
        start_date: formattedDateRange.startDate,
        end_date: formattedDateRange.endDate,
        granularity: 'daily' as const,
        timezone: 'UTC'
    }), [formattedDateRange]);

    const {
        formattedData,
        summaryStats,
        isLoading,
        isError,
        error,
        hasAnyData,
        isEmpty
    } = useRevenueAnalytics(dateRange);

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load revenue analytics: {error?.message || 'Unknown error'}
                </AlertDescription>
            </Alert>
        );
    }

    if (isEmpty) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Revenue Analytics
                    </CardTitle>
                    <CardDescription>
                        Comprehensive revenue insights and trends
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <div className="relative">
                            <BarChart3 className="h-16 w-16 text-muted-foreground/20 mx-auto" strokeWidth={1.5} />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-xl" />
                        </div>
                        <h3 className="text-lg font-semibold mt-6 mb-2">No revenue data yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Revenue analytics will appear here once you start receiving payments through your Stripe integration
                        </p>
                        <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
                            <p className="text-sm text-muted-foreground">
                                Make sure your Stripe webhook is properly configured to start tracking revenue data
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const summary = formattedData?.summary;
    const trends = formattedData?.trends || [];
    const stats = formattedData?.summaryStats;

    // Process chart data
    const chartData = processRevenueChartData(trends);
    const filteredChartData = chartData.map(item => {
        const filtered: any = { date: item.date };
        if (visibleMetrics.revenue) filtered.revenue = item.revenue;
        if (visibleMetrics.transactions) filtered.transactions = item.transactions;
        if (visibleMetrics.avg_order_value) filtered.avg_order_value = item.avg_order_value;
        if (visibleMetrics.success_rate) filtered.success_rate = item.success_rate;
        return filtered;
    });

    // Mini chart data for metric cards
    const miniChartData = {
        revenue: trends.map(item => ({ date: item.date, value: item.revenue || 0 })),
        transactions: trends.map(item => ({ date: item.date, value: item.transactions || 0 })),
        avgOrderValue: trends.map(item => ({ date: item.date, value: item.avg_order_value || 0 })),
        successRate: trends.map(item => ({ date: item.date, value: item.success_rate || 0 }))
    };

    // Distribution chart data
    const countryDistribution = processDistributionData(formattedData?.byCountry || []);
    const currencyDistribution = processDistributionData(formattedData?.byCurrency || []);
    const cardBrandDistribution = processDistributionData(formattedData?.byCardBrand || []);

    // Custom table components for transactions and refunds
    function TransactionsTable() {
        const transactions = formattedData?.recentTransactions || [];

        if (transactions.length === 0) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                        <CardDescription>Latest successful transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            No recent transactions
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <CardDescription>Latest successful transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {transactions.slice(0, 8).map((transaction, index) => (
                            <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                <div className="flex-1">
                                    <div className="font-mono text-xs text-muted-foreground">
                                        {transaction.id.substring(0, 12)}...
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {transaction.created_formatted}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-green-600">
                                        {transaction.amount_formatted}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {transaction.currency?.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    function RefundsTable() {
        const refunds = formattedData?.recentRefunds || [];

        if (refunds.length === 0) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Recent Refunds
                        </CardTitle>
                        <CardDescription>Latest refund activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <div className="relative">
                                <RefreshCw className="h-12 w-12 text-muted-foreground/20 mx-auto" strokeWidth={1.5} />
                                <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent rounded-full blur-xl" />
                            </div>
                            <p className="text-sm font-medium mt-4 text-green-600">No refunds yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Great! All transactions have been successful
                            </p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Refunds</CardTitle>
                    <CardDescription>Latest refund activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {refunds.slice(0, 8).map((refund, index) => (
                            <div key={refund.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                <div className="flex-1">
                                    <div className="font-mono text-xs text-muted-foreground">
                                        {refund.id.substring(0, 12)}...
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {refund.created_formatted}
                                    </div>
                                    <Badge variant="destructive" className="text-xs mt-1">
                                        {refund.reason || 'No reason'}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-red-600">
                                        -{refund.amount_formatted}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <EnhancedMetricCard
                    title="TOTAL REVENUE"
                    value={summary?.total_revenue_formatted || '$0.00'}
                    change={stats?.revenueGrowth_formatted}
                    changeType={summaryStats?.revenueGrowth && summaryStats.revenueGrowth >= 0 ? 'positive' : 'negative'}
                    icon={DollarSign}
                    trend={summaryStats?.revenueGrowth}
                    chartData={miniChartData.revenue}
                />
                <EnhancedMetricCard
                    title="TOTAL TRANSACTIONS"
                    value={summary?.total_transactions?.toLocaleString() || '0'}
                    change={stats?.transactionGrowth_formatted}
                    changeType={summaryStats?.transactionGrowth && summaryStats.transactionGrowth >= 0 ? 'positive' : 'negative'}
                    icon={Receipt}
                    trend={summaryStats?.transactionGrowth}
                    chartData={miniChartData.transactions}
                />
                <EnhancedMetricCard
                    title="AVERAGE ORDER VALUE"
                    value={summary?.avg_order_value_formatted || '$0.00'}
                    icon={CreditCard}
                    description="Per successful transaction"
                    chartData={miniChartData.avgOrderValue}
                />
                <EnhancedMetricCard
                    title="SUCCESS RATE"
                    value={summary?.success_rate_formatted || '0%'}
                    description={`${summary?.total_refunds || 0} refunds (${stats?.refundRate_formatted || '0%'})`}
                    icon={TrendingUp}
                    chartData={miniChartData.successRate}
                />
            </div>

            {/* Revenue Trends Chart */}
            <div className="rounded border shadow-sm">
                <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                            <LineChart className="h-5 w-5" />
                            Revenue Trends
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Daily revenue performance and transaction metrics
                        </p>
                    </div>
                    <MetricToggles
                        metrics={visibleMetrics}
                        onToggle={toggleMetric}
                        colors={metricColors}
                    />
                </div>
                <div>
                    <MetricsChart
                        data={filteredChartData}
                        isLoading={false}
                        height={400}
                    />
                </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <DistributionChart
                    data={countryDistribution}
                    isLoading={false}
                    title="Revenue by Country"
                    description="Geographic revenue distribution"
                    height={280}
                />
                <DistributionChart
                    data={currencyDistribution}
                    isLoading={false}
                    title="Revenue by Currency"
                    description="Currency breakdown"
                    height={280}
                />
                <DistributionChart
                    data={cardBrandDistribution}
                    isLoading={false}
                    title="Revenue by Card Brand"
                    description="Payment method performance"
                    height={280}
                />
            </div>

            {/* Transaction Tables */}
            <div className="grid gap-4 md:grid-cols-2">
                <TransactionsTable />
                <RefundsTable />
            </div>

            {/* Additional Insights */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Top Countries
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {(formattedData?.byCountry || []).slice(0, 5).map((country, index) => (
                            <div key={country.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-sm font-medium">{country.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{country.total_revenue_formatted}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {country.total_transactions} transactions
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!formattedData?.byCountry || formattedData.byCountry.length === 0) && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                No country data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Top Currencies
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {(formattedData?.byCurrency || []).slice(0, 5).map((currency, index) => (
                            <div key={currency.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-sm font-medium">{currency.name?.toUpperCase()}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{currency.total_revenue_formatted}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {currency.total_transactions} transactions
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!formattedData?.byCurrency || formattedData.byCurrency.length === 0) && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                No currency data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment Methods
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {(formattedData?.byCardBrand || []).slice(0, 5).map((brand, index) => (
                            <div key={brand.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                    <span className="text-sm font-medium capitalize">{brand.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium">{brand.total_revenue_formatted}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {brand.total_transactions} transactions
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!formattedData?.byCardBrand || formattedData.byCardBrand.length === 0) && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                No payment method data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}