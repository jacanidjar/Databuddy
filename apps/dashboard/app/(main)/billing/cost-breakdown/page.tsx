'use client';

import { ChartLineUpIcon, FlaskIcon } from '@phosphor-icons/react';
import { Suspense, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrganizations } from '@/hooks/use-organizations';
import { trpc } from '@/lib/trpc';
import { ConsumptionChart } from './components/consumption-chart';
import { UsageBreakdownTable } from './components/usage-breakdown-table';

const getDefaultDateRange = () => {
	const endDate = new Date().toISOString().split('T')[0];
	const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split('T')[0];
	return { startDate, endDate };
};

export default function CostBreakdownPage() {
	const [dateRange, setDateRange] = useState(() => getDefaultDateRange());
	const { activeOrganization } = useOrganizations();

	const usageQueryInput = useMemo(() => ({
		startDate: dateRange.startDate,
		endDate: dateRange.endDate,
		organizationId: activeOrganization?.id || null,
	}), [dateRange, activeOrganization?.id]);

	const { data: organizationUsage } = trpc.organizations.getUsage.useQuery();
	const { data: usageData, isLoading } = trpc.billing.getUsage.useQuery(usageQueryInput);

	const handleDateRangeChange = (startDate: string, endDate: string) => {
		setDateRange({ startDate, endDate });
	};

	const overageInfo = useMemo(() => {
		if (!organizationUsage || !usageData) return null;

		const includedUsage = organizationUsage.includedUsage || 0;
		const totalEvents = usageData.totalEvents;
		
		if (organizationUsage.unlimited || totalEvents <= includedUsage) {
			return { hasOverage: false, overageEvents: 0, includedEvents: totalEvents };
		}

		const overageEvents = totalEvents - includedUsage;
		return { hasOverage: true, overageEvents, includedEvents: includedUsage };
	}, [organizationUsage, usageData]);

	return (
		<div className="h-full flex flex-col">
			<div className="border-b bg-gradient-to-r from-background to-muted/20 px-6 py-6">
				<div className="flex items-center gap-4">
					<div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
						<ChartLineUpIcon className="h-6 w-6 text-primary" weight="duotone" />
					</div>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold tracking-tight">Cost Breakdown</h1>
							<Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
								<FlaskIcon className="mr-1" size={12} weight="duotone" />
								Experimental
							</Badge>
						</div>
						<p className="text-muted-foreground text-sm">
							Detailed analytics usage breakdown and consumption patterns
						</p>
					</div>
				</div>
			</div>

			<div className="flex-1 flex flex-col min-h-0">
				<div className="flex-[3]">
					<Suspense fallback={<Skeleton className="h-full w-full" />}>
						<ConsumptionChart 
							usageData={usageData} 
							isLoading={isLoading} 
							onDateRangeChange={handleDateRangeChange}
							overageInfo={overageInfo}
						/>
					</Suspense>
				</div>
				<div className="flex-[2]">
					<Suspense fallback={<Skeleton className="h-full w-full" />}>
						<UsageBreakdownTable 
							usageData={usageData} 
							isLoading={isLoading} 
							overageInfo={overageInfo}
						/>
					</Suspense>
				</div>
			</div>
		</div>
	);
}
