"use client";

import {
	BellIcon,
	CheckCircleIcon,
	DotsThreeIcon,
	EnvelopeIcon,
	GlobeIcon,
	PencilIcon,
	SlackLogo,
	TrashIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/lib/orpc";

// Type definition based on what we see in alarms.ts router
type Alarm = {
	id: string;
	name: string;
	description?: string | null;
	enabled: boolean;
	notificationChannels: string[];
	triggerConditions?: {
		consecutiveFailures: number;
		cooldownMinutes: number;
	} | null;
	createdAt: Date | string;
};

type AlarmCardProps = {
	alarm: Alarm;
	onEdit: () => void;
	onDelete: () => void;
	onRefetch: () => void;
};

export function AlarmCard({
	alarm,
	onEdit,
	onDelete,
	onRefetch,
}: AlarmCardProps) {
	const updateMutation = useMutation({
		...orpc.alarms.update.mutationOptions(),
	});

	const testMutation = useMutation({
		...orpc.alarms.test.mutationOptions(),
	});

	const handleToggleEnabled = async (checked: boolean) => {
		try {
			await updateMutation.mutateAsync({
				id: alarm.id,
				enabled: checked,
			});
			toast.success(checked ? "Alarm enabled" : "Alarm disabled");
			onRefetch();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update alarm"
			);
		}
	};

	const handleTestAlarm = async () => {
		try {
			const promise = testMutation.mutateAsync({ id: alarm.id });
			toast.promise(promise, {
				loading: "Sending test notification...",
				success: "Test notification sent!",
				error: (err: unknown) =>
					err instanceof Error ? err.message : "Failed to send test notification",
			});
		} catch (error) {
			// Handled by toast.promise
		}
	};

	const getChannelIcon = (channel: string) => {
		switch (channel) {
			case "slack":
				return <SlackLogo weight="duotone" className="text-pink-500" />;
			case "discord":
				// Using Globe as fallback if DiscordLogo isn't exported, but mostly likely it is
				return <GlobeIcon weight="duotone" className="text-indigo-500" />;
			case "email":
				return <EnvelopeIcon weight="duotone" className="text-blue-500" />;
			case "webhook":
				return <GlobeIcon weight="duotone" className="text-emerald-500" />;
			default:
				return <BellIcon weight="duotone" />;
		}
	};

	return (
		<Card className="rounded-md border bg-card text-card-foreground shadow-sm transition-all hover:border-border/80">
			<CardContent className="p-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 space-y-1">
						<div className="flex items-center gap-2">
							<h4 className="font-semibold text-sm leading-none">{alarm.name}</h4>
							{!alarm.enabled && (
								<Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
									Disabled
								</Badge>
							)}
						</div>

						{alarm.description && (
							<p className="line-clamp-1 text-muted-foreground text-xs">
								{alarm.description}
							</p>
						)}

						<div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs">
							{alarm.triggerConditions && (
								<div className="flex items-center gap-1 text-muted-foreground">
									<WarningCircleIcon weight="duotone" className="size-3.5" />
									<span>
										Triggers after {alarm.triggerConditions.consecutiveFailures}{" "}
										failures
									</span>
								</div>
							)}
							<div className="flex items-center gap-2">
								{alarm.notificationChannels.map((channel) => (
									<TooltipProvider key={channel}>
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="flex items-center gap-1 text-muted-foreground capitalize">
													<div className="size-3.5 [&>svg]:size-full">
														{getChannelIcon(channel)}
													</div>
												</div>
											</TooltipTrigger>
											<TooltipContent>
												<p>Notifies via {channel}</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								))}
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Switch
							checked={alarm.enabled}
							onCheckedChange={handleToggleEnabled}
							disabled={updateMutation.isPending}
							className="scale-75"
						/>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="size-8 p-0">
									<DotsThreeIcon className="size-4" />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={handleTestAlarm}>
									<CheckCircleIcon className="mr-2 size-4" />
									Test Notification
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onEdit}>
									<PencilIcon className="mr-2 size-4" />
									Edit
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={onDelete}
									className="text-destructive focus:text-destructive"
								>
									<TrashIcon className="mr-2 size-4" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
