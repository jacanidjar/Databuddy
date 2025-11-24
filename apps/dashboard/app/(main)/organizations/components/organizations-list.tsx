"use client";

import { authClient } from "@databuddy/auth/client";
import { BuildingsIcon, CalendarIcon, CheckIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getOrganizationInitials } from "@/lib/utils";
import { EmptyState } from "./empty-state";

dayjs.extend(relativeTime);

interface OrganizationsListProps {
	organizations: ReturnType<typeof authClient.useListOrganizations>["data"];
	activeOrganization: ReturnType<
		typeof authClient.useActiveOrganization
	>["data"];
	isLoading: boolean;
}

function OrganizationSkeleton() {
	return (
		<Card className="group relative overflow-hidden">
			<CardContent className="p-4">
				<div className="space-y-3">
					<div className="flex items-start gap-3">
						<Skeleton className="h-10 w-10 shrink-0 rounded-full" />
						<div className="min-w-0 flex-1 space-y-1.5">
							<Skeleton className="h-3 w-32" />
							<Skeleton className="h-3 w-24" />
							<Skeleton className="h-3 w-28" />
						</div>
					</div>
					<Skeleton className="h-3 w-40" />
				</div>
			</CardContent>
		</Card>
	);
}

function OrganizationsEmptyState() {
	return (
		<EmptyState
			description="Organizations help you collaborate with your team and manage projects more effectively. Create your first organization to get started."
			features={[
				{ label: "Team collaboration" },
				{ label: "Project management" },
				{ label: "Shared resources" },
			]}
			icon={BuildingsIcon}
			title="Start Building Together"
		/>
	);
}

export function OrganizationsList({
	organizations,
	activeOrganization,
	isLoading,
}: OrganizationsListProps) {
	const router = useRouter();
	const [processingId, setProcessingId] = useState<string | null>(null);

	const handleCardClick = async (orgId: string) => {
		const isCurrentlyActive = activeOrganization?.id === orgId;

		if (isCurrentlyActive) {
			router.push("/organizations/settings");
			return;
		}

		setProcessingId(orgId);
		try {
			const { error } = await authClient.organization.setActive({
				organizationId: orgId,
			});
			if (error) {
				toast.error(error.message || "Failed to switch workspace");
			} else {
				toast.success("Workspace updated");
				await new Promise((resolve) => setTimeout(resolve, 300));
				router.push("/organizations/settings");
			}
		} catch (_error) {
			toast.error("Failed to switch workspace");
		} finally {
			setProcessingId(null);
		}
	};

	if (isLoading) {
		return (
			<div className="p-4 sm:p-6">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<OrganizationSkeleton key={i.toString()} />
					))}
				</div>
			</div>
		);
	}

	if (!organizations || organizations.length === 0) {
		return <OrganizationsEmptyState />;
	}

	return (
		<div className="p-4 sm:p-6">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
				{organizations?.map((org) => {
					const isActive = activeOrganization?.id === org.id;
					const isProcessing = processingId === org.id;

					return (
						<Card
							className={cn(
								"group relative cursor-pointer overflow-hidden transition-all duration-200",
								isActive
									? "cursor-default"
									: isProcessing && "pointer-events-none opacity-70"
							)}
							key={org.id}
							onClick={() => handleCardClick(org.id)}
						>
							{isProcessing && (
								<div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
									<div className="h-6 w-6 animate-spin rounded-full border border-primary/30 border-t-primary" />
								</div>
							)}

							<CardContent className="flex flex-col flex-wrap items-start justify-between gap-6 sm:flex-row">
								{isActive && (
									<Badge
										className="order-first xl:order-last"
										variant="secondary"
									>
										<CheckIcon className="size-3" />
										Active
									</Badge>
								)}
								<div className="flex flex-col items-start gap-3 space-y-3 md:flex-row">
									<Avatar className="size-9 shrink-0">
										<AvatarImage alt={org.name} src={org.logo || undefined} />
										<AvatarFallback className="bg-secondary font-medium text-xs">
											{getOrganizationInitials(org.name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1">
										<h3 className="mb-2 truncate font-semibold text-base">
											{org.name}
										</h3>
										<p className="truncate text-muted-foreground text-sm">
											@{org.slug}
										</p>
										<div className="mt-1 flex items-center gap-1">
											<CalendarIcon
												className="size-3 text-accent-foreground"
												weight="duotone"
											/>
											<span className="text-muted-foreground text-xs">
												Created {dayjs(org.createdAt).fromNow()}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
