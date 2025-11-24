"use client";

import { GlobeIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { FaviconImage } from "@/components/analytics/favicon-image";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WebsiteDialog } from "@/components/website-dialog";
import type { Organization } from "@/hooks/use-organizations";
import { orpc } from "@/lib/orpc";

type WebsiteSettingsProps = {
	organization: Organization;
};

function WebsiteLoadingSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{[1, 2, 3].map((num) => (
				<Card
					className="group relative overflow-hidden"
					key={`website-skeleton-${num}`}
				>
					<CardContent className="p-4">
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<Skeleton className="h-10 w-10 shrink-0 rounded-full" />
								<div className="min-w-0 flex-1 space-y-1.5">
									<Skeleton className="h-3 w-32" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export function WebsiteSettings({ organization }: WebsiteSettingsProps) {
	const { data: websites, isLoading: isLoadingWebsites } = useQuery({
		...orpc.websites.list.queryOptions({
			input: { organizationId: organization.id },
		}),
	});
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="h-full p-4 sm:p-6">
			<WebsiteDialog onOpenChange={setDialogOpen} open={dialogOpen} />
			<div className="h-full space-y-4 sm:space-y-6">
				{/* Website count indicator */}
				{!isLoadingWebsites && websites && websites.length > 0 && (
					<div className="flex items-center gap-2 rounded-lg border border-muted bg-muted/30 px-3 py-2 text-muted-foreground text-sm">
						<GlobeIcon
							aria-hidden="true"
							className="h-4 w-4 shrink-0"
							size={16}
							weight="duotone"
						/>
						<span>
							Managing{" "}
							<span className="font-medium text-foreground">
								{websites.length}
							</span>{" "}
							website{websites.length !== 1 ? "s" : ""}
						</span>
					</div>
				)}

				{/* Loading state */}
				{isLoadingWebsites && <WebsiteLoadingSkeleton />}

				{/* Empty state */}
				{!isLoadingWebsites && websites && websites.length === 0 && (
					<EmptyState
						action={{
							label: "Create Your First Website",
							onClick: () => setDialogOpen(true),
						}}
						description="Start tracking your website analytics by adding your first website. Get insights into visitors, pageviews, and performance."
						icon={<GlobeIcon weight="duotone" />}
						title="No websites yet"
						variant="minimal"
					/>
				)}

				{/* Website grid */}
				{!isLoadingWebsites && websites && websites.length > 0 && (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{websites.map((website) => (
							<Link
								aria-label={`View ${website.name} settings`}
								className="group block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								href={`/websites/${website.id}`}
								key={website.id}
							>
								<Card className="group relative cursor-pointer overflow-hidden transition-all duration-200 hover:border-border/60 hover:bg-muted/30">
									<CardContent className="p-4">
										<div className="space-y-3">
											{/* Website Info */}
											<div className="flex items-start gap-3">
												<FaviconImage
													altText={`${website.name} favicon`}
													className="h-10 w-10 shrink-0 rounded border border-border/30"
													domain={website.domain}
													fallbackIcon={
														<div className="flex h-10 w-10 items-center justify-center rounded border border-border/30 bg-accent">
															<GlobeIcon
																className="h-5 w-5 text-muted-foreground"
																size={20}
																weight="duotone"
															/>
														</div>
													}
													size={40}
												/>
												<div className="min-w-0 flex-1">
													<h3 className="truncate font-semibold text-sm">
														{website.name}
													</h3>
													<p className="truncate text-muted-foreground text-xs">
														{website.domain}
													</p>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
