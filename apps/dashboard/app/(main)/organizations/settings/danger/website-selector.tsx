"use client";

import type { Website } from "@databuddy/shared/types/website";
import { GlobeIcon } from "@phosphor-icons/react";
import { FaviconImage } from "@/components/analytics/favicon-image";
import { cn } from "@/lib/utils";

function WebsiteCard({
	website,
	selected,
	onClick,
}: {
	website: Website;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			className={cn(
				"flex w-full items-center gap-2 rounded border bg-secondary-brightest p-2 text-left transition-all duration-200",
				selected ? "border-primary" : "border-border"
			)}
			onClick={onClick}
			type="button"
		>
			<FaviconImage
				altText={`${website.name} favicon`}
				className="shrink-0 rounded"
				domain={website.domain}
				fallbackIcon={
					<div className="flex size-6 shrink-0 items-center justify-center rounded bg-accent">
						<GlobeIcon className="size-3 text-accent-foreground" size={12} />
					</div>
				}
				size={24}
			/>
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-foreground text-xs">
					{website.name}
				</p>
				<p className="truncate text-muted-foreground text-xs">
					{website.domain}
				</p>
			</div>
		</button>
	);
}

export function WebsiteSelector({
	websites,
	selectedWebsite,
	onSelectWebsiteAction,
}: {
	websites: Website[];
	selectedWebsite: string | null;
	onSelectWebsiteAction: (id: string | null) => void;
}) {
	return (
		<div className="max-h-48 space-y-1 overflow-y-auto p-1">
			{websites.length > 0 ? (
				websites.map((website) => (
					<WebsiteCard
						key={website.id}
						onClick={() =>
							onSelectWebsiteAction(
								website.id === selectedWebsite ? null : website.id
							)
						}
						selected={selectedWebsite === website.id}
						website={website}
					/>
				))
			) : (
				<div className="flex flex-col items-center justify-center py-6 text-center">
					<GlobeIcon
						className="mx-auto mb-2 text-accent-foreground"
						size={20}
						weight="duotone"
					/>
					<p className="text-muted-foreground text-xs">No websites found</p>
				</div>
			)}
		</div>
	);
}
