"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LinkIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useOrganizationsContext } from "@/components/providers/organizations-provider";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { type Link, useCreateLink, useUpdateLink } from "@/hooks/use-links";

const formSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Name is required")
		.max(255, "Name must be less than 255 characters"),
	targetUrl: z
		.string()
		.min(1, "Target URL is required")
		.refine(
			(val) => {
				const urlToTest =
					val.startsWith("http://") || val.startsWith("https://")
						? val
						: `https://${val}`;
				try {
					const url = new URL(urlToTest);
					return url.protocol === "http:" || url.protocol === "https:";
				} catch {
					return false;
				}
			},
			{ message: "Please enter a valid URL" }
		),
});

type FormData = z.infer<typeof formSchema>;

interface LinkDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	link?: Link | null;
	onSave?: (link: Link) => void;
}

export function LinkDialog({
	open,
	onOpenChange,
	link,
	onSave,
}: LinkDialogProps) {
	const isEditing = !!link;
	const { activeOrganization } = useOrganizationsContext();

	const createLinkMutation = useCreateLink();
	const updateLinkMutation = useUpdateLink();

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			targetUrl: "",
		},
	});

	useEffect(() => {
		if (link) {
			form.reset({ name: link.name, targetUrl: link.targetUrl });
		} else {
			form.reset({ name: "", targetUrl: "" });
		}
	}, [link, form]);

	const getErrorMessage = (error: unknown, isEditingMode: boolean): string => {
		const defaultMessage = `Failed to ${isEditingMode ? "update" : "create"} link.`;

		const rpcError = error as {
			data?: { code?: string };
			message?: string;
		};

		if (rpcError?.data?.code) {
			switch (rpcError.data.code) {
				case "CONFLICT":
					return "A link with this slug already exists.";
				case "FORBIDDEN":
					return (
						rpcError.message ||
						"You do not have permission to perform this action."
					);
				case "UNAUTHORIZED":
					return "You must be logged in to perform this action.";
				case "BAD_REQUEST":
					return (
						rpcError.message || "Invalid request. Please check your input."
					);
				default:
					return rpcError.message || defaultMessage;
			}
		}

		return rpcError?.message || defaultMessage;
	};

	const handleSubmit: SubmitHandler<FormData> = async (formData) => {
		if (!activeOrganization?.id) {
			toast.error("No organization selected");
			return;
		}

		let targetUrl = formData.targetUrl.trim();
		const hasProtocol =
			targetUrl.startsWith("http://") || targetUrl.startsWith("https://");
		if (!hasProtocol) {
			targetUrl = `https://${targetUrl}`;
		}

		try {
			if (link?.id) {
				const result = await updateLinkMutation.mutateAsync({
					id: link.id,
					name: formData.name,
					targetUrl,
				});
				if (onSave) {
					onSave(result);
				}
				toast.success("Link updated successfully!");
			} else {
				const result = await createLinkMutation.mutateAsync({
					organizationId: activeOrganization.id,
					name: formData.name,
					targetUrl,
				});
				if (onSave) {
					onSave(result);
				}
				toast.success("Link created successfully!");
			}
			onOpenChange(false);
		} catch (error: unknown) {
			const message = getErrorMessage(error, !!link?.id);
			toast.error(message);
		}
	};

	const isPending =
		createLinkMutation.isPending || updateLinkMutation.isPending;

	const { isValid, isDirty } = form.formState;
	const isSubmitDisabled = !(isValid && isDirty);

	return (
		<FormDialog
			description={
				isEditing
					? "Update the details of your existing link."
					: "Create a short link to track clicks and analytics."
			}
			icon={<LinkIcon className="size-5" weight="duotone" />}
			isSubmitting={isPending}
			onOpenChange={onOpenChange}
			onSubmit={form.handleSubmit(handleSubmit)}
			open={open}
			submitDisabled={isSubmitDisabled}
			submitLabel={isEditing ? "Save changes" : "Create link"}
			title={isEditing ? "Edit Link" : "Create a new link"}
		>
			<Form {...form}>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Marketing Campaign" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="targetUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Target URL</FormLabel>
							<FormControl>
								<div className="flex items-center">
									<span className="inline-flex h-9 items-center rounded-l border border-r-0 bg-muted px-3 text-muted-foreground text-sm">
										https://
									</span>
									<Input
										placeholder="example.com/landing-page"
										{...field}
										className="rounded-l-none"
										onChange={(e) => {
											let url = e.target.value.trim();
											if (
												url.startsWith("http://") ||
												url.startsWith("https://")
											) {
												try {
													const parsed = new URL(url);
													url =
														parsed.host +
														parsed.pathname +
														parsed.search +
														parsed.hash;
												} catch {
													// Keep as is
												}
											}
											field.onChange(url);
										}}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</Form>
		</FormDialog>
	);
}
