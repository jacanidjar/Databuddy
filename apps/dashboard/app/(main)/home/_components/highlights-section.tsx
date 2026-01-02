"use client";

import type { ProcessedMiniChartData } from "@databuddy/shared/types/website";
import { CheckCircleIcon, CodeIcon, TrendUpIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Highlight {
	id: string;
	type: "success" | "warning" | "info";
	icon: React.ReactNode;
	title: string;
	description: string;
	link?: string;
	badge?: string;
}

interface HighlightsSectionProps {
	topPerformers: Array<{
		id: string;
		name: string | null;
		domain: string;
		views: number;
		trend: ProcessedMiniChartData["trend"];
	}>;
	needsSetup: Array<{
		id: string;
		name: string | null;
		domain: string;
	}>;
	isLoading?: boolean;
}

function HighlightRow({ highlight }: { highlight: Highlight }) {
	const content = (
		<div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50">
			<div className="shrink-0">{highlight.icon}</div>
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-foreground text-sm">
					{highlight.title}
				</p>
				<p className="truncate text-muted-foreground text-xs">
					{highlight.description}
				</p>
			</div>
			{highlight.badge && (
				<Badge
					className="shrink-0"
					variant={highlight.type === "success" ? "green" : "amber"}
				>
					{highlight.badge}
				</Badge>
			)}
		</div>
	);

	if (highlight.link) {
		return (
			<Link className="block" href={highlight.link}>
				{content}
			</Link>
		);
	}

	return content;
}

function HighlightSkeleton() {
	return (
		<div className="flex items-center gap-3 px-4 py-3">
			<Skeleton className="size-5 shrink-0 rounded" />
			<div className="min-w-0 flex-1 space-y-1">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-3 w-48" />
			</div>
		</div>
	);
}

export function HighlightsSection({
	topPerformers,
	needsSetup,
	isLoading,
}: HighlightsSectionProps) {
	const highlights = useMemo<Highlight[]>(() => {
		const items: Highlight[] = [];

		// Add top growing websites
		for (const performer of topPerformers.slice(0, 3)) {
			if (performer.trend?.type === "up" && performer.trend.value > 5) {
				items.push({
					id: `trend-${performer.id}`,
					type: "success",
					icon: <TrendUpIcon className="size-5 text-success" weight="fill" />,
					title: performer.name || performer.domain,
					description: "Traffic increased this period",
					link: `/websites/${performer.id}`,
					badge: `+${performer.trend.value.toFixed(0)}%`,
				});
			}
		}

		// Add websites needing setup
		for (const site of needsSetup.slice(0, 2)) {
			items.push({
				id: `setup-${site.id}`,
				type: "warning",
				icon: <CodeIcon className="size-5 text-amber-500" weight="duotone" />,
				title: site.name || site.domain,
				description: "Tracking not configured",
				link: `/websites/${site.id}?tab=tracking-setup`,
			});
		}

		// If no highlights, show all good message
		if (items.length === 0 && topPerformers.length > 0) {
			items.push({
				id: "all-good",
				type: "success",
				icon: <CheckCircleIcon className="size-5 text-success" weight="fill" />,
				title: "All systems operational",
				description: `${topPerformers.length} website${topPerformers.length !== 1 ? "s" : ""} tracking normally`,
			});
		}

		return items;
	}, [topPerformers, needsSetup]);

	if (isLoading) {
		return (
			<div className="divide-y rounded border bg-card">
				<div className="border-b px-4 py-3">
					<Skeleton className="h-4 w-20" />
				</div>
				<HighlightSkeleton />
				<HighlightSkeleton />
			</div>
		);
	}

	if (highlights.length === 0) {
		return null;
	}

	return (
		<div className="divide-y rounded border bg-card">
			<div className="px-4 py-3">
				<h3 className="font-semibold text-foreground text-sm">Highlights</h3>
			</div>
			{highlights.map((highlight) => (
				<HighlightRow highlight={highlight} key={highlight.id} />
			))}
		</div>
	);
}
