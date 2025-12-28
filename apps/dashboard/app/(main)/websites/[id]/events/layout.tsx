"use client";

import { ChartBarIcon, ListBulletsIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function EventsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { id } = useParams();
	const websiteId = id as string;
	const pathname = usePathname();

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="box-border flex h-10 shrink-0 border-border border-b bg-accent/30">
				<Link
					className={cn(
						"flex cursor-pointer items-center gap-2 border-b-2 px-3 py-2.5 font-medium text-sm transition-all",
						pathname === `/websites/${websiteId}/events`
							? "border-primary text-foreground"
							: "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
					)}
					href={`/websites/${websiteId}/events`}
				>
					<ChartBarIcon
						className={cn(
							"size-4",
							pathname === `/websites/${websiteId}/events` && "text-primary"
						)}
						weight={
							pathname === `/websites/${websiteId}/events` ? "fill" : "duotone"
						}
					/>
					Summary
				</Link>
				<Link
					className={cn(
						"flex cursor-pointer items-center gap-2 border-b-2 px-3 py-2.5 font-medium text-sm transition-all",
						pathname === `/websites/${websiteId}/events/stream`
							? "border-primary text-foreground"
							: "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
					)}
					href={`/websites/${websiteId}/events/stream`}
				>
					<ListBulletsIcon
						className={cn(
							"size-4",
							pathname === `/websites/${websiteId}/events/stream` &&
								"text-primary"
						)}
						weight={
							pathname === `/websites/${websiteId}/events/stream`
								? "fill"
								: "duotone"
						}
					/>
					Stream
				</Link>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
		</div>
	);
}
