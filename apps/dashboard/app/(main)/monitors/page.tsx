"use client";

import {
	ArrowClockwiseIcon,
	HeartbeatIcon,
	PlusIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { MonitorRow } from "@/components/monitors/monitor-row";
import { MonitorSheet } from "@/components/monitors/monitor-sheet";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { PageHeader } from "./_components/page-header";

export default function MonitorsPage() {
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [editingSchedule, setEditingSchedule] = useState<{
		id: string;
		url: string;
		name?: string | null;
		granularity: string;
		jsonParsingConfig?: {
			enabled: boolean;
			mode: "auto" | "manual";
			fields?: string[];
		} | null;
	} | null>(null);

	const {
		data: schedules,
		isLoading,
		refetch,
		isFetching,
		isError,
	} = useQuery({
		...orpc.uptime.listSchedules.queryOptions({ input: {} }),
	});

	const handleCreate = () => {
		setEditingSchedule(null);
		setIsSheetOpen(true);
	};

	const handleEdit = (schedule: any) => {
		setEditingSchedule({
			id: schedule.id,
			url: schedule.url,
			name: schedule.name,
			granularity: schedule.granularity,
			jsonParsingConfig: schedule.jsonParsingConfig,
		});
		setIsSheetOpen(true);
	};

	return (
		<div className="flex h-full flex-col">
			<PageHeader
				description="View and manage all your uptime monitors."
				icon={<HeartbeatIcon />}
				right={
					<>
						<Button
							disabled={isLoading || isFetching}
							onClick={() => refetch()}
							size="icon"
							variant="secondary"
						>
							<ArrowClockwiseIcon
								className={cn(
									"size-4",
									(isLoading || isFetching) && "animate-spin"
								)}
							/>
						</Button>
						<Button onClick={handleCreate}>
							<PlusIcon className="mr-2 size-4" />
							Create Monitor
						</Button>
					</>
				}
				title="Monitors"
			/>

			<div className="flex-1 overflow-y-auto p-6">
				{isLoading ? (
					<div className="flex h-full items-center justify-center">
						<span className="text-muted-foreground text-sm">
							Loading monitors...
						</span>
					</div>
				) : isError ? (
					<div className="flex h-full items-center justify-center">
						<EmptyState
							action={{ label: "Retry", onClick: () => refetch() }}
							description="Something went wrong while fetching monitors."
							icon={<HeartbeatIcon />}
							title="Failed to load monitors"
						/>
					</div>
				) : schedules && schedules.length > 0 ? (
					<div className="rounded-md border bg-card">
						{schedules.map((schedule) => (
							<MonitorRow
								key={schedule.id}
								onDeleteAction={() => refetch()}
								onEditAction={() => handleEdit(schedule)}
								onRefetchAction={() => refetch()}
								schedule={schedule}
							/>
						))}
					</div>
				) : (
					<div className="flex h-full items-center justify-center">
						<EmptyState
							action={{ label: "Create Monitor", onClick: handleCreate }}
							description="Create your first uptime monitor to start tracking."
							icon={<HeartbeatIcon />}
							title="No monitors found"
						/>
					</div>
				)}
			</div>

			<MonitorSheet
				onCloseAction={setIsSheetOpen}
				onSaveAction={refetch}
				open={isSheetOpen}
				schedule={editingSchedule}
			/>
		</div>
	);
}
