'use client';

import type { ErrorEvent, ErrorSummary } from '@databuddy/shared';
import { ArrowClockwiseIcon, BugIcon } from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import { use, useCallback } from 'react';
import { toast } from 'sonner';
import { AnimatedLoading } from '@/components/analytics/animated-loading';
import { Button } from '@/components/ui/button';
import { useDateFilters } from '@/hooks/use-date-filters';
import { useEnhancedErrorData } from '@/hooks/use-dynamic-query';
import { isAnalyticsRefreshingAtom } from '@/stores/jotai/filterAtoms';
import { ErrorDataTable } from './error-data-table';
import { ErrorSummaryStats } from './error-summary-stats';
import { ErrorTrendsChart } from './error-trends-chart';
import { RecentErrorsTable } from './recent-errors-table';
import { TopErrorCard } from './top-error-card';
import { safeFormatDate } from './utils';

interface ErrorsPageContentProps {
	params: Promise<{ id: string }>;
}

export const ErrorsPageContent = ({ params }: ErrorsPageContentProps) => {
	const resolvedParams = use(params);
	const websiteId = resolvedParams.id;

	const [isRefreshing, setIsRefreshing] = useAtom(isAnalyticsRefreshingAtom);
	const { dateRange } = useDateFilters();

	const {
		results: errorResults,
		isLoading,
		refetch,
		error,
	} = useEnhancedErrorData(websiteId, dateRange, {
		queryKey: ['enhancedErrorData', websiteId, dateRange],
	});

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		try {
			await refetch();
			toast.success('Error data refreshed');
		} catch (err) {
			console.error('Failed to refresh data:', err);
			toast.error('Failed to refresh error data.');
		} finally {
			setIsRefreshing(false);
		}
	}, [refetch, setIsRefreshing]);

	const getData = (id: string): unknown[] =>
		(errorResults?.find((r) => r.queryId === id)?.data?.[id] as unknown[]) ||
		[];

	const recentErrors = getData('recent_errors') as ErrorEvent[];
	const errorTypes = getData('error_types');
	const errorsByPage = getData('errors_by_page');
	const errorTrends = getData('error_trends');

	const totalErrors = (errorTypes as Record<string, unknown>[]).reduce(
		(sum: number, type: Record<string, unknown>) =>
			sum + ((type.count as number) || 0),
		0
	);
	const totalUsers = (errorTypes as Record<string, unknown>[]).reduce(
		(sum: number, type: Record<string, unknown>) =>
			sum + ((type.users as number) || 0),
		0
	);

	const errorSummary: ErrorSummary = {
		totalErrors,
		uniqueErrorTypes: errorTypes.length,
		affectedUsers: totalUsers,
		affectedSessions: recentErrors.length,
		errorRate: 0,
	};

	const topError = (errorTypes as Record<string, unknown>[])[0] || null;
	const errorChartData = (errorTrends as Record<string, unknown>[]).map(
		(point: Record<string, unknown>) => ({
			date: safeFormatDate(point.date as string, 'MMM d'),
			'Total Errors': (point.errors as number) || 0,
			'Affected Users': (point.users as number) || 0,
		})
	);

	if (error) {
		return (
			<div className="mx-auto max-w-[1600px] p-6 text-center">
				<div className="rounded border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
					<div className="mx-auto mb-4 w-fit rounded-full border border-destructive/20 bg-destructive/10 p-3">
						<BugIcon className="h-6 w-6 text-destructive" weight="duotone" />
					</div>
					<h4 className="mb-2 font-semibold text-destructive">
						Error loading data
					</h4>
					<p className="mb-4 text-destructive/80 text-sm">
						There was an issue loading your error analytics. Please try
						refreshing.
					</p>
					<Button
						className="gap-2 rounded"
						onClick={handleRefresh}
						size="sm"
						variant="outline"
					>
						<ArrowClockwiseIcon className="h-4 w-4" weight="fill" />
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-[1600px] space-y-6 py-6">
			{isLoading ? (
				<AnimatedLoading progress={90} type="errors" />
			) : (
				<div className="space-y-6">
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<div className="lg:col-span-2">
							<ErrorTrendsChart errorChartData={errorChartData} />
						</div>
						<div className="space-y-4">
							<ErrorSummaryStats
								errorSummary={errorSummary}
								isLoading={isLoading}
							/>
							<TopErrorCard topError={topError as any} />
						</div>
					</div>
					<RecentErrorsTable
						isLoading={isLoading}
						recentErrors={recentErrors}
					/>
					<ErrorDataTable
						isLoading={isLoading}
						isRefreshing={isRefreshing}
						processedData={{
							error_types: errorTypes as Record<string, unknown>[],
							errors_by_page: errorsByPage as Record<string, unknown>[],
						}}
					/>
				</div>
			)}
		</div>
	);
};
