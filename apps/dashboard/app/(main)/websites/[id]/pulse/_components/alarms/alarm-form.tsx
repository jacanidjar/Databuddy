"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { orpc } from "@/lib/orpc";
import { DiscordLogo, SlackLogo, EnvelopeIcon, GlobeIcon } from "@phosphor-icons/react";

// Icons wrapper
const Icons = {
    Slack: SlackLogo,
    Discord: DiscordLogo,
    Email: EnvelopeIcon,
    Webhook: GlobeIcon,
};

const triggerConditionsSchema = z.object({
	consecutiveFailures: z.coerce.number().min(1).max(10).default(3),
	cooldownMinutes: z.coerce.number().min(1).max(1440).default(5),
});

const formSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	description: z.string().optional(),
	notificationChannels: z
		.array(z.enum(["slack", "discord", "email", "webhook"]))
		.min(1, "Select at least one notification channel"),
	slackWebhookUrl: z.string().optional(),
	discordWebhookUrl: z.string().optional(),
	emailAddressInput: z.string().optional(), // Helper for creating the array
	emailAddresses: z.array(z.string().email()).optional(),
	webhookUrl: z.string().optional(),
	triggerConditions: triggerConditionsSchema,
	enabled: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

type AlarmFormProps = {
	websiteId: string;
	initialData?: any; // Using any to avoid strict type complex matching with DB result
	onSuccess: () => void;
	onCancel: () => void;
};

export function AlarmForm({
	websiteId,
	initialData,
	onSuccess,
	onCancel,
}: AlarmFormProps) {
	const isEditing = !!initialData;

	// Mutations
	const createMutation = useMutation({
		...orpc.alarms.create.mutationOptions(),
		onSuccess: () => {
			toast.success("Alarm created successfully");
			onSuccess();
		},
		onError: (error: any) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to create alarm"
			);
		},
	});

	const updateMutation = useMutation({
		...orpc.alarms.update.mutationOptions(),
		onSuccess: () => {
			toast.success("Alarm updated successfully");
			onSuccess();
		},
		onError: (error: any) => {
			toast.error(
				error instanceof Error ? error.message : "Failed to update alarm"
			);
		},
	});

	// Query for Quick Assign / Copying
	const { data: availableAlarms } = useQuery({
		...orpc.alarms.list.queryOptions({
            // We want global alarms (different website)
			userId: undefined, // Current user implied
		}),
        enabled: !isEditing, // Only fetch for create mode
	});

    // Valid alarms to copy from (not from this website)
    const alarmsToCopy = useMemo(() => {
        if (!availableAlarms) return [];
        return availableAlarms.filter((a: any) => a.websiteId !== websiteId);
    }, [availableAlarms, websiteId]);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			notificationChannels: [],
			slackWebhookUrl: "",
			discordWebhookUrl: "",
			emailAddresses: [],
			emailAddressInput: "",
			webhookUrl: "",
			triggerConditions: {
				consecutiveFailures: 3,
				cooldownMinutes: 5,
			},
			enabled: true,
		},
	});

	// Initialize form with data
	useEffect(() => {
		if (initialData) {
			form.reset({
				name: initialData.name,
				description: initialData.description || "",
				notificationChannels: initialData.notificationChannels,
				slackWebhookUrl: initialData.slackWebhookUrl || "",
				discordWebhookUrl: initialData.discordWebhookUrl || "",
				emailAddresses: initialData.emailAddresses || [],
				// Pre-fill input if there's exactly one email
				emailAddressInput: initialData.emailAddresses?.[0] || "",
				webhookUrl: initialData.webhookUrl || "",
				triggerConditions: {
					consecutiveFailures:
						initialData.triggerConditions?.consecutiveFailures || 3,
					cooldownMinutes: initialData.triggerConditions?.cooldownMinutes || 5,
				},
				enabled: initialData.enabled,
			});
		}
	}, [initialData, form]);

    const handleCopySelect = (alarmId: string) => {
        const template = alarmsToCopy.find((a: any) => a.id === alarmId);
        if (template) {
            form.setValue("name", `${template.name} (Copy)`);
            form.setValue("description", template.description || "");
            form.setValue("notificationChannels", template.notificationChannels as any);
            form.setValue("slackWebhookUrl", template.slackWebhookUrl || "");
            form.setValue("discordWebhookUrl", template.discordWebhookUrl || "");
            form.setValue("emailAddresses", template.emailAddresses || []);
            form.setValue("emailAddressInput", template.emailAddresses?.[0] || "");
            form.setValue("webhookUrl", template.webhookUrl || "");
            if (template.triggerConditions) {
                form.setValue("triggerConditions", {
                    consecutiveFailures: (template.triggerConditions as any).consecutiveFailures,
                    cooldownMinutes: (template.triggerConditions as any).cooldownMinutes,
                });
            }
            toast.info("Settings copied from " + template.name);
        }
    };

	const onSubmit = (values: FormValues) => {
		// Prepare payload
		const payload = {
			name: values.name,
			description: values.description,
			notificationChannels: values.notificationChannels,
			slackWebhookUrl: values.notificationChannels.includes("slack")
				? values.slackWebhookUrl
				: undefined,
			discordWebhookUrl: values.notificationChannels.includes("discord")
				? values.discordWebhookUrl
				: undefined,
			emailAddresses: values.notificationChannels.includes("email")
				? values.emailAddressInput ? [values.emailAddressInput] : [] // Simplification: only taking the input
				: undefined,
			webhookUrl: values.notificationChannels.includes("webhook")
				? values.webhookUrl
				: undefined,
			triggerConditions: values.triggerConditions,
			enabled: values.enabled,
            triggerType: "uptime" as const, // Fixed for this context
		};
        
        // Zod refinement validaton manual check if needed (zod schema does standard types)
        if (payload.emailAddresses && payload.emailAddresses.length === 0 && values.notificationChannels.includes('email')) {
             form.setError("emailAddressInput", { message: "Email address is required" });
             return;
        }

		if (isEditing) {
			updateMutation.mutate({
				id: initialData.id,
				...payload,
			});
		} else {
			createMutation.mutate({
				websiteId,
				...payload,
			});
		}
	};

	const selectedChannels = form.watch("notificationChannels");

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {!isEditing && alarmsToCopy.length > 0 && (
                    <div className="rounded-lg border bg-muted/50 p-4">
                        <FormLabel className="mb-2 block">Quick Assign (Copy from existing)</FormLabel>
                        <Select onValueChange={handleCopySelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an alarm to copy settings from..." />
                            </SelectTrigger>
                            <SelectContent>
                                {alarmsToCopy.map((alarm: any) => (
                                    <SelectItem key={alarm.id} value={alarm.id}>
                                        {alarm.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

				<FormField
					control={form.control}
					name="name"
					render={({ field }: { field: any }) => (
						<FormItem>
							<FormLabel>Alarm Name</FormLabel>
							<FormControl>
								<Input placeholder="e.g. Critical Downtime Alert" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }: { field: any }) => (
						<FormItem>
							<FormLabel>Description (Optional)</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Describe who receives this and when..."
									className="resize-none"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-4 rounded-lg border p-4">
					<h4 className="font-medium text-sm">Notification Channels</h4>
					<FormField
						control={form.control}
						name="notificationChannels"
						render={({ field }: { field: any }) => (
							<FormItem>
								<FormControl>
									<ToggleGroup
										type="multiple"
										variant="outline"
										value={field.value}
										onValueChange={field.onChange}
										className="justify-start"
									>
										<ToggleGroupItem value="slack" aria-label="Toggle Slack">
											<Icons.Slack className="mr-2 size-4" />
											Slack
										</ToggleGroupItem>
										<ToggleGroupItem value="discord" aria-label="Toggle Discord">
											<Icons.Discord className="mr-2 size-4" />
											Discord
										</ToggleGroupItem>
										<ToggleGroupItem value="email" aria-label="Toggle Email">
											<Icons.Email className="mr-2 size-4" />
											Email
										</ToggleGroupItem>
										<ToggleGroupItem value="webhook" aria-label="Toggle Webhook">
											<Icons.Webhook className="mr-2 size-4" />
											Webhook
										</ToggleGroupItem>
									</ToggleGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Channel Specific Configurations */}
					{selectedChannels.includes("slack") && (
						<FormField
							control={form.control}
							name="slackWebhookUrl"
							render={({ field }: { field: any }) => (
								<FormItem>
									<FormLabel>Slack Webhook URL</FormLabel>
									<FormControl>
										<Input placeholder="https://hooks.slack.com/..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					{selectedChannels.includes("discord") && (
						<FormField
							control={form.control}
							name="discordWebhookUrl"
							render={({ field }: { field: any }) => (
								<FormItem>
									<FormLabel>Discord Webhook URL</FormLabel>
									<FormControl>
										<Input
											placeholder="https://discord.com/api/webhooks/..."
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					{selectedChannels.includes("email") && (
						<FormField
							control={form.control}
							name="emailAddressInput"
							render={({ field }: { field: any }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input placeholder="alert@example.com" {...field} />
									</FormControl>
                                    <FormDescription>
                                        Currently supports single email recipient.
                                    </FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					{selectedChannels.includes("webhook") && (
						<FormField
							control={form.control}
							name="webhookUrl"
							render={({ field }: { field: any }) => (
								<FormItem>
									<FormLabel>Webhook URL</FormLabel>
									<FormControl>
										<Input placeholder="https://api.myapp.com/alerts" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}
				</div>

				<div className="space-y-4 rounded-lg border p-4">
					<h4 className="font-medium text-sm">Trigger Conditions</h4>
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="triggerConditions.consecutiveFailures"
							render={({ field }: { field: any }) => (
								<FormItem>
									<FormLabel>Consecutive Failures</FormLabel>
									<FormControl>
										<Input type="number" min={1} max={10} {...field} />
									</FormControl>
									<FormDescription>
										Failures before alarming (1-10)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="triggerConditions.cooldownMinutes"
							render={({ field }: { field: any }) => (
								<FormItem>
									<FormLabel>Cooldown (Minutes)</FormLabel>
									<FormControl>
										<Input type="number" min={1} max={1440} {...field} />
									</FormControl>
									<FormDescription>Minutes between alerts</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className="flex items-center justify-end gap-2 pt-4">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={createMutation.isPending || updateMutation.isPending}
					>
						{isEditing ? "Update Alarm" : "Create Alarm"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
