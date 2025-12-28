"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { RecentCustomEvent } from "./types";

dayjs.extend(relativeTime);

interface RecentEventsTableProps {
	data: RecentCustomEvent[];
	isLoading: boolean;
}

export function RecentEventsTable({ data, isLoading }: RecentEventsTableProps) {
	const [selectedEvent, setSelectedEvent] = useState<RecentCustomEvent | null>(
		null
	);

	const columns = useMemo(
		() => [
			{
				id: "event_name",
				accessorKey: "event_name",
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
				id: "path",
				accessorKey: "path",
				header: "Page",
				cell: (info: { getValue: () => unknown }) => {
					const value = String(info.getValue());
					return (
						<span
							className="max-w-[200px] truncate text-muted-foreground text-sm"
							title={value}
						>
							{value}
						</span>
					);
				},
			},
			{
				id: "properties",
				accessorKey: "properties",
				header: "Properties",
				cell: (info: { row: { original: RecentCustomEvent } }) => {
					const props = info.row.original.properties;
					const keys = Object.keys(props);

					if (keys.length === 0) {
						return (
							<span className="text-muted-foreground text-xs italic">
								No properties
							</span>
						);
					}

					return (
						<Button
							className="h-6 px-2 text-xs"
							onClick={() => setSelectedEvent(info.row.original)}
							size="sm"
							variant="outline"
						>
							{keys.length} {keys.length === 1 ? "property" : "properties"}
						</Button>
					);
				},
			},
			{
				id: "timestamp",
				accessorKey: "timestamp",
				header: "Time",
				cell: (info: { getValue: () => unknown }) => {
					const timestamp = String(info.getValue());
					return (
						<span
							className="text-muted-foreground text-sm"
							title={dayjs(timestamp).format("MMM D, YYYY h:mm:ss A")}
						>
							{dayjs(timestamp).fromNow()}
						</span>
					);
				},
			},
		],
		[]
	);

	const selectedProps = selectedEvent ? selectedEvent.properties : {};

	return (
		<>
			<DataTable
				columns={columns}
				data={data}
				description="Most recent custom events tracked on your website"
				emptyMessage="No recent custom events"
				isLoading={isLoading}
				minHeight="400px"
				title="Recent Events"
			/>

			<Dialog
				onOpenChange={(open) => {
					if (!open) {
						setSelectedEvent(null);
					}
				}}
				open={selectedEvent !== null}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<div className="size-2 shrink-0 rounded bg-primary" />
							{selectedEvent?.event_name}
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-3">
						<div className="text-muted-foreground text-sm">
							<span className="font-medium text-foreground">Path:</span>{" "}
							{selectedEvent?.path}
						</div>
						<div className="text-muted-foreground text-sm">
							<span className="font-medium text-foreground">Time:</span>{" "}
							{selectedEvent?.timestamp
								? dayjs(selectedEvent.timestamp).format("MMM D, YYYY h:mm:ss A")
								: ""}
						</div>
						<div>
							<div className="mb-2 font-medium text-foreground text-sm">
								Properties:
							</div>
							<pre className="max-h-64 overflow-auto rounded bg-muted p-3 font-mono text-xs">
								{JSON.stringify(selectedProps, null, 2)}
							</pre>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
