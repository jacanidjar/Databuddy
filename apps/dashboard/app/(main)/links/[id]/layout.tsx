"use client";

import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { useDateFilters } from "@/hooks/use-date-filters";

interface QuickRange {
	label: string;
	fullLabel: string;
	hours?: number;
	days?: number;
}

const QUICK_RANGES: QuickRange[] = [
	{ label: "24h", fullLabel: "Last 24 hours", hours: 24 },
	{ label: "7d", fullLabel: "Last 7 days", days: 7 },
	{ label: "30d", fullLabel: "Last 30 days", days: 30 },
	{ label: "90d", fullLabel: "Last 90 days", days: 90 },
];

const getStartDateForRange = (range: QuickRange) => {
	const now = new Date();
	return range.hours
		? dayjs(now).subtract(range.hours, "hour").toDate()
		: dayjs(now)
				.subtract(range.days ?? 7, "day")
				.toDate();
};

interface LinkStatsLayoutProps {
	children: React.ReactNode;
}

export default function LinkStatsLayout({ children }: LinkStatsLayoutProps) {
	const { id } = useParams();
	const linkId = id as string;
	const queryClient = useQueryClient();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const { currentDateRange, setDateRangeAction } = useDateFilters();

	const selectedRange: DayPickerRange | undefined = useMemo(
		() => ({
			from: currentDateRange.startDate,
			to: currentDateRange.endDate,
		}),
		[currentDateRange]
	);

	const handleQuickRangeSelect = useCallback(
		(range: QuickRange) => {
			const start = getStartDateForRange(range);
			setDateRangeAction({ startDate: start, endDate: new Date() });
		},
		[setDateRangeAction]
	);

	const isQuickRangeActive = useCallback(
		(range: QuickRange) => {
			if (!(selectedRange?.from && selectedRange?.to)) {
				return false;
			}

			const now = new Date();
			const start = getStartDateForRange(range);

			return (
				dayjs(selectedRange.from).isSame(start, "day") &&
				dayjs(selectedRange.to).isSame(now, "day")
			);
		},
		[selectedRange]
	);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await queryClient.invalidateQueries({
				predicate: (query) =>
					query.queryKey[0] === "batch-dynamic-query" &&
					query.queryKey.includes(linkId),
			});
			toast.success("Data refreshed");
		} catch {
			toast.error("Failed to refresh data");
		} finally {
			setIsRefreshing(false);
		}
	};

	useHotkeys(
		["1", "2", "3", "4"],
		(e) => {
			const index = Number.parseInt(e.key, 10) - 1;
			if (index >= 0 && index < QUICK_RANGES.length) {
				e.preventDefault();
				handleQuickRangeSelect(QUICK_RANGES[index]);
			}
		},
		{ preventDefault: true },
		[handleQuickRangeSelect]
	);

	return (
		<div className="flex h-full flex-col overflow-hidden">
			{/* Toolbar */}
			<div className="sticky top-0 right-0 left-0 z-50 shrink-0 overscroll-contain bg-background md:top-0 md:left-84">
				<div className="flex h-12 items-center justify-between border-b pr-4">
					<div className="flex h-full items-center">
						{QUICK_RANGES.map((range) => {
							const isActive = isQuickRangeActive(range);
							return (
								<Button
									className={clsx(
										"h-full w-14 cursor-pointer touch-manipulation whitespace-nowrap rounded-none border-r px-0 font-medium text-xs",
										isActive
											? "bg-accent text-accent-foreground hover:bg-accent"
											: "hover:bg-accent!"
									)}
									key={range.label}
									onClick={() => handleQuickRangeSelect(range)}
									title={range.fullLabel}
									variant={isActive ? "secondary" : "ghost"}
								>
									{range.label}
								</Button>
							);
						})}

						<div className="flex h-full items-center pl-1">
							<DateRangePicker
								className="w-auto"
								maxDate={new Date()}
								minDate={new Date(2020, 0, 1)}
								onChange={(range) => {
									if (range?.from && range?.to) {
										setDateRangeAction({
											startDate: range.from,
											endDate: range.to,
										});
									}
								}}
								value={selectedRange}
							/>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button
							aria-label="Refresh data"
							className="size-8"
							disabled={isRefreshing}
							onClick={handleRefresh}
							variant="secondary"
						>
							<ArrowClockwiseIcon
								aria-hidden="true"
								className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
							/>
						</Button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
				{children}
			</div>
		</div>
	);
}
