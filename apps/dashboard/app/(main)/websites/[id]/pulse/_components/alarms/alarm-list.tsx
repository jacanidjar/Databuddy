"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { PlusIcon, TrashIcon, BellIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/empty-state";
import { orpc } from "@/lib/orpc";
import { AlarmCard } from "./alarm-card";
import { AlarmForm } from "./alarm-form";

type AlarmListProps = {
	websiteId: string;
};

export function AlarmList({ websiteId }: AlarmListProps) {
	const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [deletingAlarmId, setDeletingAlarmId] = useState<string | null>(null);

	// Fetch alarms
	const {
		data: alarms,
		isLoading,
		refetch,
	} = useQuery({
		...orpc.alarms.listByWebsite.queryOptions({
			input: {
				websiteId,
				triggerType: "uptime",
				enabledOnly: false, // We want to see disabled ones too
			},
		}),
	});

	// Delete mutation
	const deleteMutation = useMutation({
		...orpc.alarms.delete.mutationOptions(),
		onSuccess: () => {
			toast.success("Alarm deleted");
			setDeletingAlarmId(null);
			refetch();
		},
		onError: (error) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete alarm"
			);
		},
	});

	const editingAlarm = alarms?.find((alarm) => alarm.id === editingAlarmId);

	const handleCreate = () => {
		setEditingAlarmId(null);
		setIsSheetOpen(true);
	};

	const handleEdit = (alarmId: string) => {
		setEditingAlarmId(alarmId);
		setIsSheetOpen(true);
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
					<SheetTrigger asChild>
						<Button onClick={handleCreate}>
							<PlusIcon className="mr-2 h-4 w-4" />
							Create Alarm
						</Button>
					</SheetTrigger>
					<SheetContent className="sm:max-w-md">
						<SheetHeader>
							<SheetTitle>
								{editingAlarm ? "Edit Alarm" : "Create Alarm"}
							</SheetTitle>
							<SheetDescription>
								{editingAlarm
									? "Make changes to your alarm here. Click save when you're done."
									: "Create a new alarm to monitor your website."}
							</SheetDescription>
						</SheetHeader>
						<AlarmForm
							websiteId={websiteId}
							initialData={editingAlarm as any} // Cast specific DB type to Form type
							onSuccess={() => {
								setIsSheetOpen(false);
								refetch();
							}}
							onCancel={() => setIsSheetOpen(false)}
						/>
					</SheetContent>
				</Sheet>
			</div>

			{isLoading ? (
				<div className="py-8 text-center text-muted-foreground text-sm">
					Loading alarms...
				</div>
			) : !alarms || alarms.length === 0 ? (
				<EmptyState
					title="No alarms configured"
					description="Create an alarm to get notified via Slack, Discord, Email, or Webhooks when your site goes down."
					variant="minimal"
					icon={BellIcon}
					action={{
						label: "Create Alarm",
						onClick: handleCreate,
					}}
				/>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{alarms.map((alarm) => (
						<AlarmCard
							key={alarm.id}
							alarm={alarm as any} // Cast to handle JSON type inference mismatch
							onEdit={() => handleEdit(alarm.id)}
							onDelete={() => setDeletingAlarmId(alarm.id)}
							onRefetch={refetch}
						/>
					))}
				</div>
			)}

			<AlertDialog
				open={!!deletingAlarmId}
				onOpenChange={(open) => !open && setDeletingAlarmId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Alarm</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this alarm? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deletingAlarmId && deleteMutation.mutate({ id: deletingAlarmId })}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
