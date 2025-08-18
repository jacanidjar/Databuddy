import { CaretLeftIcon, TestTubeIcon } from '@phosphor-icons/react';
import Link from 'next/link';

export function SandboxHeader() {
	return (
		<div className="flex h-16 flex-col border-border border-b bg-accent/20">
			{/* Back navigation */}
			<button
				className="flex w-full items-center gap-3 px-5 py-1.5 text-left font-medium text-foreground text-sm transition-colors hover:bg-muted/50"
				type="button"
			>
				<Link className="flex w-full items-center gap-3" href="/">
					<CaretLeftIcon
						className="hover:-translate-x-0.5 size-4 flex-shrink-0 transition-transform"
						weight="fill"
					/>
					<span className="flex-1 text-muted-foreground text-xs">
						Back to Dashboard
					</span>
				</Link>
			</button>

			{/* Sandbox info */}
			<div className="flex flex-1 items-center border-border border-t bg-gradient-to-r from-accent/30 to-accent/10 px-5 py-1.5">
				<div className="flex w-full items-center gap-3">
					<div className="rounded-lg bg-background/80 p-1.5 shadow-sm ring-1 ring-border/50">
						<TestTubeIcon
							className="size-5 flex-shrink-0 text-primary/70"
							weight="duotone"
						/>
					</div>
					<div className="min-w-0 flex-1">
						<h2 className="truncate font-semibold text-foreground text-sm">
							Sandbox
						</h2>
						<p className="truncate text-muted-foreground/80 text-xs">
							Test & Experiment
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
