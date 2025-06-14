"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    Receipt,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { useRevenueAnalytics } from "../hooks/use-revenue-analytics";

interface MetricCardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
    description?: string;
    isLoading?: boolean;
}

function MetricCard({ title, value, change, changeType, icon, description, isLoading }: MetricCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-3 w-32" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        {changeType === 'positive' && <TrendingUp className="h-3 w-3 text-green-500" />}
                        {changeType === 'negative' && <TrendingDown className="h-3 w-3 text-red-500" />}
                        <span className={cn(
                            changeType === 'positive' && 'text-green-500',
                            changeType === 'negative' && 'text-red-500'
                        )}>
                            {change}
                        </span>
                        <span>from last period</span>
                    </div>
                )}
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

interface RevenueSummaryCardsProps {
    className?: string;
    analytics: ReturnType<typeof useRevenueAnalytics>;
}

export function RevenueSummaryCards({ className, analytics }: RevenueSummaryCardsProps) {
    const {
        formattedData,
        isLoading,
        isError,
        error,
    } = analytics;

    const summary = formattedData?.summary;
    const summaryStats = formattedData?.summaryStats;

    if (isError) {
        return (
            <Alert variant="destructive" className={className}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load revenue summary: {error?.message || 'Unknown error'}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
            <MetricCard
                title="Total Revenue"
                value={summary?.total_revenue_formatted ?? '$0.00'}
                change={summaryStats?.revenueGrowth_formatted}
                changeType={summaryStats?.revenueGrowth && summaryStats.revenueGrowth >= 0 ? 'positive' : 'negative'}
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading}
            />
            <MetricCard
                title="Total Transactions"
                value={summary?.total_transactions.toLocaleString() ?? '0'}
                change={summaryStats?.transactionGrowth_formatted}
                changeType={summaryStats?.transactionGrowth && summaryStats.transactionGrowth >= 0 ? 'positive' : 'negative'}
                icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading}
            />
            <MetricCard
                title="Average Order Value"
                value={summary?.avg_order_value_formatted ?? '$0.00'}
                icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading}
            />
            <MetricCard
                title="Success Rate"
                value={summary ? `${summary.success_rate.toFixed(1)}%` : '0%'}
                description={summary ? `${summary.total_refunds} refunds (${summaryStats?.refundRate_formatted})` : undefined}
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading}
            />
        </div>
    );
} 