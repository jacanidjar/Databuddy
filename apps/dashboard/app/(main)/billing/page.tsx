"use client";

import { CreditCardIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillingData } from "./hooks/use-billing";

const OverviewTab = lazy(() =>
	import("./components/overview-tab").then((m) => ({ default: m.OverviewTab }))
);
const PlansTab = lazy(() =>
	import("./components/plans-tab").then((m) => ({ default: m.PlansTab }))
);
const HistoryTab = lazy(() =>
	import("./components/history-tab").then((m) => ({ default: m.HistoryTab }))
);

function ComponentSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-32 w-full rounded" />
			<Skeleton className="h-64 w-full rounded" />
			<Skeleton className="h-48 w-full rounded" />
		</div>
	);
}

const PAGE_TITLES = {
	overview: {
		title: "Usage & Metrics",
		description: "Monitor your usage and billing metrics",
	},
	plans: {
		title: "Plans & Pricing",
		description: "Manage your subscription and billing plan",
	},
	history: {
		title: "Payment History",
		description: "View your billing history and invoices",
	},
	default: {
		title: "Billing & Subscription",
		description: "Manage your subscription, usage, and billing preferences",
	},
} as const;

export default function BillingPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") || "overview";
	const selectedPlan = searchParams.get("plan");

	const navigateToPlans = () => {
		router.push("/billing?tab=plans");
	};

	const { customerData, isLoading } = useBillingData();

	const { title, description } =
		PAGE_TITLES[activeTab as keyof typeof PAGE_TITLES] ?? PAGE_TITLES.default;

	return (
		<div className="flex h-full flex-col">
			<div className="border-b bg-linear-to-r from-background via-background to-muted/20">
				<div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:gap-0 sm:px-6 sm:py-6">
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-4">
							<div className="rounded-xl border border-primary/20 bg-primary/10 p-3">
								<CreditCardIcon
									className="h-6 w-6 text-primary"
									size={24}
									weight="duotone"
								/>
							</div>
							<div>
								<h1 className="truncate font-bold text-2xl text-foreground tracking-tight sm:text-3xl">
									{title}
								</h1>
								<p className="mt-1 text-muted-foreground text-sm sm:text-base">
									{description}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

		<main
			className={
				activeTab === "overview"
					? "min-h-0 flex-1 overflow-hidden"
					: "flex-1 overflow-y-auto p-4 sm:p-6"
			}
		>
			{activeTab === "overview" && (
				<Suspense fallback={<ComponentSkeleton />}>
					<OverviewTab onNavigateToPlans={navigateToPlans} />
				</Suspense>
			)}
			{activeTab === "plans" && (
				<Suspense fallback={<ComponentSkeleton />}>
					<PlansTab selectedPlan={selectedPlan} />
				</Suspense>
			)}
			{activeTab === "history" && (
				<Suspense fallback={<ComponentSkeleton />}>
					<HistoryTab
						customerData={customerData}
						invoices={customerData?.invoices ?? []}
						isLoading={isLoading}
					/>
				</Suspense>
			)}
		</main>
		</div>
	);
}
