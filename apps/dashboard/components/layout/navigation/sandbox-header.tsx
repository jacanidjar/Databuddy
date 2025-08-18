import { CaretLeftIcon, TestTubeIcon } from '@phosphor-icons/react';
import Link from 'next/link';

export function SandboxHeader() {
	return (
		<div className="border-border border-b bg-accent/20">
			{/* Sandbox info - aligned with logo section */}
			<div className="flex h-16 items-center justify-center border-border border-b bg-gradient-to-r from-accent/30 to-accent/10 px-5">
				<div className="flex w-full items-center gap-3">
					<div className="rounded-lg bg-background/80 p-1.5 shadow-sm ring-1 ring-border/50">
						<TestTubeIcon
							className="size-5 flex-shrink-0 text-primary/70"
							weight="duotone"
						/>
					</div>
					<div className="flex min-w-0 flex-1 flex-col items-start">
						<h2 className="truncate text-left font-semibold text-foreground text-sm">
							Sandbox
						</h2>
						<p className="truncate text-left text-muted-foreground/80 text-xs">
							Test & Experiment
						</p>
					</div>
				</div>
			</div>

			{/* Back navigation - aligned with category buttons */}
			<button
				className="flex items-center justify-center p-2 transition-colors hover:bg-muted/50"
				type="button"
			>
				<Link className="flex items-center gap-2" href="/">
					<CaretLeftIcon
						className="hover:-translate-x-0.5 h-5 w-5 flex-shrink-0 transition-transform"
						weight="fill"
					/>
					<span className="text-muted-foreground text-xs">
						Back to Dashboard
					</span>
				</Link>
			</button>
		</div>
	);
}
