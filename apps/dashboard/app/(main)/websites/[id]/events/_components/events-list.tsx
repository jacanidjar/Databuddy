"use client";

import dayjs from "dayjs";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import type { CustomEventItem } from "./types";

interface EventsListProps {
	data: CustomEventItem[];
	isLoading: boolean;
	onAddFilter: (field: string, value: string) => void;
}

const formatNumber = (value: number): string => {
	if (value == null || Number.isNaN(value)) {
		return "0";
	}
	return Intl.NumberFormat(undefined, {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);
};

export function EventsList({ data, isLoading, onAddFilter }: EventsListProps) {
	const columns = useMemo(
		() => [
			{
				id: "name",
				accessorKey: "name",
				header: "Event Name",
				cell: (info: { getValue: () => unknown }) => (
					<div className="flex items-center gap-2">
						<div className="size-2 shrink-0 rounded bg-primary" />
						<span className="font-medium text-foreground">
							{String(info.getValue())}
						</span>
					</div>
				),
			},
			{
				id: "total_events",
				accessorKey: "total_events",
				header: "Total",
				cell: (info: { getValue: () => unknown }) => (
					<span className="font-medium text-foreground tabular-nums">
						{formatNumber(Number(info.getValue()))}
					</span>
				),
			},
			{
				id: "unique_users",
				accessorKey: "unique_users",
				header: "Users",
				cell: (info: { getValue: () => unknown }) => (
					<span className="text-muted-foreground tabular-nums">
						{formatNumber(Number(info.getValue()))}
					</span>
				),
			},
			{
				id: "unique_sessions",
				accessorKey: "unique_sessions",
				header: "Sessions",
				cell: (info: { getValue: () => unknown }) => (
					<span className="text-muted-foreground tabular-nums">
						{formatNumber(Number(info.getValue()))}
					</span>
				),
			},
			{
				id: "events_with_properties",
				accessorKey: "events_with_properties",
				header: "With Props",
				cell: (info: { getValue: () => unknown }) => (
					<span className="text-muted-foreground tabular-nums">
						{formatNumber(Number(info.getValue()))}
					</span>
				),
			},
			{
				id: "last_occurrence",
				accessorKey: "last_occurrence",
				header: "Last Seen",
				cell: (info: { getValue: () => unknown }) => {
					const timestamp = String(info.getValue());
					if (!timestamp || timestamp === "undefined" || timestamp === "null") {
						return <span className="text-muted-foreground">-</span>;
					}
					return (
						<span
							className="text-muted-foreground text-sm"
							title={dayjs(timestamp).format("MMM D, YYYY h:mm A")}
						>
							{dayjs(timestamp).format("MMM D")}
						</span>
					);
				},
			},
			{
				id: "percentage",
				accessorKey: "percentage",
				header: "Share",
				cell: (info: { getValue: () => unknown }) => (
					<div className="inline-flex items-center rounded bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
						{Number(info.getValue()).toFixed(1)}%
					</div>
				),
			},
		],
		[]
	);

	return (
		<DataTable
			description="All custom events tracked on your website"
			emptyMessage="No custom events found"
			isLoading={isLoading}
			minHeight="350px"
			onAddFilter={onAddFilter}
			tabs={[
				{
					id: "events",
					label: "Events",
					data,
					columns,
					getFilter: (row: CustomEventItem) => ({
						field: "event_name",
						value: row.name,
					}),
				},
			]}
			title="Custom Events"
		/>
	);
}
