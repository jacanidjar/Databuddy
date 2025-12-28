"use client";

import {
	CalendarBlankIcon,
	LightningIcon,
	TagIcon,
	UserIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import { use, useMemo } from "react";
import { StatCard } from "@/components/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { useChartPreferences } from "@/hooks/use-chart-preferences";
import { useDateFilters } from "@/hooks/use-date-filters";
import { dynamicQueryFiltersAtom } from "@/stores/jotai/filterAtoms";
import { useCustomEventsData } from "../use-custom-events";
import { EventsTrendChart } from "./events-trend-chart";
import type {
	CustomEventsSummary,
	CustomEventsTrend,
	MiniChartDataPoint,
} from "./types";

interface EventsPageContentProps {
	params: Promise<{ id: string }>;
}

const formatNumber = (value: number | null | undefined): string => {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return "0";
	}
	return Intl.NumberFormat(undefined, {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);
};

const formatDateByGranularity = (
	dateStr: string,
	granularity: "hourly" | "daily"
): string => {
	const date = dayjs(dateStr);
	if (granularity === "hourly") {
		return date.format("MMM D HH:mm");
	}
	return date.format("MMM D");
};

export function EventsPageContent({ params }: EventsPageContentProps) {
	const resolvedParams = use(params);
	const websiteId = resolvedParams.id;

	const { chartType, chartStepType } = useChartPreferences("events");
	const [filters] = useAtom(dynamicQueryFiltersAtom);
	const { dateRange } = useDateFilters();

	const {
		results: eventsResults,
		isLoading,
		error,
	} = useCustomEventsData(websiteId, dateRange, {
		queryKey: ["customEventsData", websiteId, dateRange],
		filters,
	});

	const getRawData = <T,>(id: string): T[] =>
		(eventsResults?.find((r) => r.queryId === id)?.data?.[id] as T[]) ?? [];

	const summaryData = getRawData<CustomEventsSummary>("custom_events_summary");
	const trendsData = getRawData<CustomEventsTrend>("custom_events_trends");

	const summary: CustomEventsSummary = summaryData[0] ?? {
		total_events: 0,
		unique_event_types: 0,
		unique_users: 0,
		unique_sessions: 0,
		unique_pages: 0,
	};

	const miniChartData = useMemo(() => {
		const createChartSeries = (
			field: keyof CustomEventsTrend
		): MiniChartDataPoint[] =>
			trendsData.map((event) => ({
				date:
					dateRange.granularity === "hourly"
						? event.date
						: event.date.slice(0, 10),
				value: (event[field] as number) ?? 0,
			}));

		return {
			total_events: createChartSeries("total_events"),
			unique_users: createChartSeries("unique_users"),
			unique_event_types: createChartSeries("unique_event_types"),
		};
	}, [trendsData, dateRange.granularity]);

	const chartData = useMemo(
		() =>
			trendsData.map((event) => ({
				date: formatDateByGranularity(event.date, dateRange.granularity),
				events: event.total_events ?? 0,
				users: event.unique_users ?? 0,
			})),
		[trendsData, dateRange.granularity]
	);

	const todayDate = dayjs().format("YYYY-MM-DD");
	const todayEvent = trendsData.find(
		(event) => dayjs(event.date).format("YYYY-MM-DD") === todayDate
	);
	const todayEvents = todayEvent?.total_events ?? 0;
	const todayUsers = todayEvent?.unique_users ?? 0;

	if (error) {
		return (
			<div className="p-3 sm:p-4">
				<div className="rounded border border-destructive/20 bg-destructive/5 p-6">
					<div className="flex flex-col items-center text-center">
						<div className="mb-4 flex size-12 items-center justify-center rounded bg-destructive/10">
							<LightningIcon
								className="size-6 text-destructive"
								weight="duotone"
							/>
						</div>
						<h4 className="mb-2 font-semibold text-destructive">
							Error loading data
						</h4>
						<p className="max-w-md text-balance text-destructive/80 text-sm">
							There was an issue loading your events analytics. Please try
							refreshing using the toolbar above.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
			{isLoading ? (
				<EventsLoadingSkeleton />
			) : summary.total_events === 0 ? (
				<div className="rounded border bg-card p-8 text-center">
					<LightningIcon
						className="mx-auto size-12 text-muted-foreground/40"
						weight="duotone"
					/>
					<h3 className="mt-4 font-medium text-foreground">No events yet</h3>
					<p className="mx-auto mt-1 max-w-md text-balance text-muted-foreground text-sm">
						Events will appear here once your tracker starts collecting them.
						Use{" "}
						<code className="rounded bg-muted px-1 py-0.5 text-xs">
							databuddy.track()
						</code>{" "}
						to send custom events.
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
						<StatCard
							chartData={isLoading ? undefined : miniChartData.total_events}
							chartStepType={chartStepType}
							chartType={chartType}
							description={`${formatNumber(todayEvents)} today`}
							icon={LightningIcon}
							id="events-total"
							isLoading={isLoading}
							showChart
							title="Total Events"
							value={formatNumber(summary.total_events)}
						/>
						<StatCard
							chartData={isLoading ? undefined : miniChartData.unique_users}
							chartStepType={chartStepType}
							chartType={chartType}
							description={`${formatNumber(todayUsers)} today`}
							icon={UserIcon}
							id="events-users"
							isLoading={isLoading}
							showChart
							title="Unique Users"
							value={formatNumber(summary.unique_users)}
						/>
						<StatCard
							chartData={
								isLoading ? undefined : miniChartData.unique_event_types
							}
							chartStepType={chartStepType}
							chartType={chartType}
							icon={TagIcon}
							id="events-types"
							isLoading={isLoading}
							showChart
							title="Event Types"
							value={formatNumber(summary.unique_event_types)}
						/>
						<StatCard
							icon={UsersIcon}
							id="events-sessions"
							isLoading={isLoading}
							title="Sessions"
							value={formatNumber(summary.unique_sessions)}
						/>
						<StatCard
							icon={CalendarBlankIcon}
							id="events-pages"
							isLoading={isLoading}
							title="Unique Pages"
							value={formatNumber(summary.unique_pages)}
						/>
					</div>

					<EventsTrendChart chartData={chartData} isLoading={isLoading} />
				</>
			)}
		</div>
	);
}

function EventsLoadingSkeleton() {
	return (
		<div className="space-y-3 sm:space-y-4">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
				{Array.from({ length: 5 }).map((_, i) => (
					<div className="rounded border bg-card" key={`stat-${i + 1}`}>
						<div className="p-3 sm:p-4">
							<div className="flex items-center justify-between">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="size-8 rounded" />
							</div>
							<Skeleton className="mt-2 h-8 w-24" />
							<Skeleton className="mt-1 h-3 w-16" />
							<Skeleton className="mt-3 h-16 w-full" />
						</div>
					</div>
				))}
			</div>

			<div className="rounded border bg-card">
				<div className="flex items-center gap-3 border-b px-3 py-2.5 sm:px-4 sm:py-3">
					<div className="space-y-1">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-3 w-24" />
					</div>
				</div>
				<Skeleton className="h-[350px] w-full" />
			</div>

			<div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
				<div className="rounded border bg-card">
					<div className="border-b px-3 py-2.5 sm:px-4 sm:py-3">
						<Skeleton className="h-5 w-32" />
					</div>
					<div className="p-3 sm:p-4">
						<Skeleton className="h-64 w-full" />
					</div>
				</div>
				<div className="rounded border bg-card">
					<div className="border-b px-3 py-2.5 sm:px-4 sm:py-3">
						<Skeleton className="h-5 w-40" />
					</div>
					<div className="p-3 sm:p-4">
						<Skeleton className="h-64 w-full" />
					</div>
				</div>
			</div>

			<div className="rounded border bg-card">
				<div className="border-b px-3 py-2.5 sm:px-4 sm:py-3">
					<Skeleton className="h-5 w-28" />
				</div>
				<div className="p-3 sm:p-4">
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		</div>
	);
}
