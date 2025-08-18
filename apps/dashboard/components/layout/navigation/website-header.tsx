import type { Website } from '@databuddy/shared';
import { CaretLeftIcon, PlanetIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { FaviconImage } from '@/components/analytics/favicon-image';
import { Skeleton } from '@/components/ui/skeleton';

interface WebsiteHeaderProps {
	website: Website | null | undefined;
}

export function WebsiteHeader({ website }: WebsiteHeaderProps) {
	return (
		<div className="flex h-16 flex-col border-border border-b bg-accent/20">
			{/* Back navigation */}
			<button
				className="flex w-full items-center gap-3 px-5 py-1.5 text-left font-medium text-foreground text-sm transition-colors hover:bg-muted/50"
				type="button"
			>
				<Link className="flex w-full items-center gap-3" href="/websites">
					<CaretLeftIcon
						className="hover:-translate-x-0.5 size-4 flex-shrink-0 transition-transform"
						weight="fill"
					/>
					<span className="flex-1 text-muted-foreground text-xs">
						Back to Websites
					</span>
				</Link>
			</button>

			{/* Website info - enhanced with background and better spacing */}
			<div className="flex flex-1 items-center border-border border-t bg-gradient-to-r from-accent/30 to-accent/10 px-5 py-1.5">
				<div className="flex w-full items-center gap-3">
					<div className="rounded-lg bg-background/80 p-1.5 shadow-sm ring-1 ring-border/50">
						<FaviconImage
							altText={`${website?.name || website?.domain || 'Website'} favicon`}
							className="size-5 flex-shrink-0"
							domain={website?.domain || ''}
							fallbackIcon={
								<PlanetIcon
									className="text-primary/70"
									size={20}
									weight="duotone"
								/>
							}
							size={20}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<h2 className="truncate font-semibold text-foreground text-sm">
							{website?.name || website?.domain || (
								<Skeleton className="h-4 w-32" />
							)}
						</h2>
						{website?.domain ? (
							<p className="truncate text-muted-foreground/80 text-xs">
								{website.domain}
							</p>
						) : (
							<div className="h-3 w-24">
								<Skeleton className="h-3 w-24" />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
