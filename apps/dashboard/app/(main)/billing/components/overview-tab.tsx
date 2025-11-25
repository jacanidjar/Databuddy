"use client";

import {
	ArrowSquareOutIcon,
	CalendarIcon,
	ChartBarIcon,
	ClockIcon,
	CreditCardIcon,
	CrownIcon,
	DatabaseIcon,
	GiftIcon,
	LightningIcon,
	TrendUpIcon,
	UsersIcon,
	WarningIcon,
	WifiHighIcon,
} from "@phosphor-icons/react";
import type { Customer, Product } from "autumn-js";
import dayjs from "dayjs";
import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { cn } from "@/lib/utils";
import {
	type FeatureUsage,
	useBilling,
	useBillingData,
} from "../hooks/use-billing";
import { formatCompactNumber, getResetText } from "../utils/feature-usage";
import { CancelSubscriptionDialog } from "./cancel-subscription-dialog";

type OverviewTabProps = {
	onNavigateToPlans: () => void;
};

export const OverviewTab = memo(function OverviewTabComponent({
	onNavigateToPlans,
}: OverviewTabProps) {
	const { products, usage, customer, isLoading, error, refetch } =
		useBillingData();
	const {
		onCancelClick,
		onCancelConfirm,
		onCancelDialogClose,
		onManageBilling,
		showCancelDialog,
		cancelTarget,
		getSubscriptionStatusDetails,
	} = useBilling(refetch);

	const { currentPlan, currentProduct, usageStats, statusDetails } =
		useMemo(() => {
			const activeCustomerProduct = customer?.products?.find((p) => {
				if (p.canceled_at && p.current_period_end) {
					return dayjs(p.current_period_end).isAfter(dayjs());
				}
				return !p.canceled_at || p.status === "scheduled";
			});

			const activePlan = activeCustomerProduct
				? products?.find((p: Product) => p.id === activeCustomerProduct.id)
				: products?.find(
						(p: Product) =>
							!p.scenario ||
							(p.scenario !== "upgrade" && p.scenario !== "downgrade")
					);

			const planStatusDetails = activeCustomerProduct
				? getSubscriptionStatusDetails(
						activeCustomerProduct as unknown as Parameters<
							typeof getSubscriptionStatusDetails
						>[0]
					)
				: "";

			return {
				currentPlan: activePlan,
				currentProduct: activeCustomerProduct,
				usageStats: usage?.features ?? [],
				statusDetails: planStatusDetails,
			};
		}, [
			products,
			usage?.features,
			customer?.products,
			getSubscriptionStatusDetails,
		]);

	if (isLoading) {
		return <OverviewSkeleton />;
	}
	if (error) {
		return <ErrorState error={error} onRetry={refetch} />;
	}

	const isFree = currentPlan?.id === "free" || currentPlan?.properties?.is_free;
	const isCanceled = currentPlan?.scenario === "cancel";

	return (
		<>
			<CancelSubscriptionDialog
				currentPeriodEnd={cancelTarget?.currentPeriodEnd}
				isLoading={isLoading}
				onCancel={onCancelConfirm}
				onOpenChange={(open) => {
					if (!open) {
						onCancelDialogClose();
					}
				}}
				open={showCancelDialog}
				planName={cancelTarget?.name ?? ""}
			/>

			<div className="flex h-full flex-col lg:flex-row">
				{/* Main Content */}
				<div className="flex-1 overflow-y-auto">
					<div className="border-b px-5 py-4">
						<h2 className="font-semibold">Usage</h2>
						<p className="text-muted-foreground text-sm">
							Track your feature consumption
						</p>
					</div>

					{usageStats.length === 0 ? (
						<EmptyUsageState />
					) : (
						<div className="divide-y">
							{usageStats.map((feature) => (
								<UsageRow
									feature={feature}
									key={feature.id}
									onUpgrade={onNavigateToPlans}
								/>
							))}
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="w-full shrink-0 border-l bg-muted/30 lg:w-80">
					{/* Plan */}
					<div className="border-b p-5">
						<div className="mb-3 flex items-center justify-between">
							<h3 className="font-semibold">Current Plan</h3>
							<PlanStatusBadge
								isCanceled={!!currentProduct?.canceled_at}
								isScheduled={currentProduct?.status === "scheduled"}
							/>
						</div>
						<div className="flex items-center gap-3">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded border bg-background">
								<CrownIcon
									className="text-primary"
									size={20}
									weight="duotone"
								/>
							</div>
							<div>
								<div className="font-medium">
									{currentPlan?.display?.name || currentPlan?.name || "Free"}
								</div>
								{!isFree && currentPlan?.items[0]?.display?.primary_text && (
									<div className="text-muted-foreground text-sm">
										{currentPlan.items[0].display.primary_text}
									</div>
								)}
							</div>
						</div>
						{statusDetails && (
							<div className="mt-3 flex items-center gap-2 text-muted-foreground text-sm">
								<CalendarIcon size={14} weight="duotone" />
								{statusDetails}
							</div>
						)}
					</div>

					{/* Payment Method */}
					<div className="border-b p-5">
						<h3 className="mb-3 font-semibold">Payment Method</h3>
						<CreditCardDisplay customer={customer} />
					</div>

					{/* Actions */}
					<div className="space-y-2 p-5">
						{isCanceled ? (
							<Button className="w-full" onClick={onNavigateToPlans}>
								Reactivate Plan
							</Button>
						) : isFree ? (
							<Button className="w-full" onClick={onNavigateToPlans}>
								Upgrade Plan
							</Button>
						) : (
							<>
								<Button
									className="w-full"
									onClick={onNavigateToPlans}
									variant="outline"
								>
									Change Plan
								</Button>
								<Button
									className="w-full"
									onClick={() =>
										currentPlan &&
										onCancelClick(
											currentPlan.id,
											currentPlan.display?.name || currentPlan.name,
											currentProduct?.current_period_end ?? undefined
										)
									}
									variant="outline"
								>
									Cancel Plan
								</Button>
							</>
						)}
						<Button
							className="w-full"
							onClick={onManageBilling}
							variant="outline"
						>
							Billing Portal
							<ArrowSquareOutIcon className="ml-2" size={14} />
						</Button>
					</div>
				</div>
			</div>
		</>
	);
});

function CreditCardDisplay({ customer }: { customer: Customer | null }) {
	const [showCardDetails, setShowCardDetails] = usePersistentState<boolean>(
		"billing-card-details-visible",
		true
	);

	const paymentMethod = (customer as any)?.payment_method;
	const card = paymentMethod?.card;

	if (!card) {
		return (
			<div className="flex aspect-[1.586/1] w-full flex-col items-center justify-center rounded-xl border border-dashed bg-background">
				<CreditCardIcon
					className="mb-2 text-muted-foreground"
					size={28}
					weight="duotone"
				/>
				<span className="text-muted-foreground text-sm">No payment method</span>
			</div>
		);
	}

	const cardHolder =
		paymentMethod.billing_details?.name || customer?.name || "CARD HOLDER";
	const cardNumber = `•••• •••• •••• ${card.last4 || "****"}`;
	const expiration = `${card.exp_month?.toString().padStart(2, "0") || "00"}/${card.exp_year?.toString().slice(-2) || "00"}`;
	const brand = card.brand?.toLowerCase() || "card";

	return (
		<div className="relative aspect-[1.586/1] w-full">
			<div
				className={cn(
					"absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl p-4",
					"bg-linear-to-tr from-foreground to-foreground/80",
					"before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:ring-1 before:ring-white/20 before:ring-inset"
				)}
			>
				{/* Header */}
				<div className="relative z-2 flex items-start justify-between">
					<WifiHighIcon
						className="rotate-90 text-white/80"
						size={20}
						weight="bold"
					/>
					<span className="font-semibold text-white/60 text-xs uppercase tracking-wider">
						{brand}
					</span>
				</div>

				{/* Footer */}
				<div className="relative z-2 flex flex-col gap-2">
					{showCardDetails ? (
						<>
							<div className="flex items-end gap-2">
								<p className="font-semibold text-white/80 text-xs uppercase tracking-wide">
									{cardHolder}
								</p>
								<p className="ml-auto font-semibold text-white/80 text-xs tabular-nums">
									{expiration}
								</p>
							</div>
							<div className="flex items-end justify-between gap-3">
								<button
									aria-label="Hide card details"
									className="cursor-pointer font-semibold text-white tabular-nums tracking-wider transition-opacity hover:opacity-80"
									onClick={() => {
										setShowCardDetails(false);
									}}
									type="button"
								>
									{cardNumber}
								</button>
								<CardBrandLogo brand={brand} />
							</div>
						</>
					) : (
						<>
							<div className="flex items-end gap-2">
								<p className="font-semibold text-white/40 text-xs uppercase tracking-wide">
									•••• ••••
								</p>
								<p className="ml-auto font-semibold text-white/40 text-xs tabular-nums">
									••/••
								</p>
							</div>
							<div className="flex items-end justify-between gap-3">
								<button
									aria-label="Show card details"
									className="cursor-pointer font-semibold text-white/40 tabular-nums tracking-wider transition-opacity hover:opacity-80"
									onClick={() => {
										setShowCardDetails(true);
									}}
									type="button"
								>
									•••• •••• •••• ••••
								</button>
								<CardBrandLogo brand={brand} />
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

function CardBrandLogo({ brand }: { brand: string }) {
	if (brand === "visa") {
		return (
			<div className="flex h-6 w-10 items-center justify-center rounded bg-white/10 font-bold text-white text-xs italic">
				VISA
			</div>
		);
	}
	if (brand === "mastercard") {
		return (
			<div className="flex h-6 w-10 items-center justify-center">
				<div className="relative flex">
					<div className="h-5 w-5 rounded-full bg-red-500/90" />
					<div className="-ml-2 h-5 w-5 rounded-full bg-yellow-500/90" />
				</div>
			</div>
		);
	}
	if (brand === "amex") {
		return (
			<div className="flex h-6 w-10 items-center justify-center rounded bg-white/10 font-bold text-[8px] text-white">
				AMEX
			</div>
		);
	}
	return (
		<div className="flex h-6 w-10 items-center justify-center rounded bg-white/10">
			<CreditCardIcon className="text-white/80" size={16} weight="duotone" />
		</div>
	);
}

function PlanStatusBadge({
	isCanceled,
	isScheduled,
}: {
	isCanceled: boolean;
	isScheduled: boolean;
}) {
	if (isCanceled) {
		return (
			<Badge className="bg-destructive/10 text-destructive" variant="secondary">
				Cancelling
			</Badge>
		);
	}
	if (isScheduled) {
		return <Badge variant="secondary">Scheduled</Badge>;
	}
	return (
		<Badge className="bg-primary/10 text-primary" variant="secondary">
			Active
		</Badge>
	);
}

const FEATURE_ICONS: Record<string, typeof ChartBarIcon> = {
	event: ChartBarIcon,
	storage: DatabaseIcon,
	user: UsersIcon,
	member: UsersIcon,
	message: ChartBarIcon,
	website: ChartBarIcon,
};

function getFeatureIcon(name: string): typeof ChartBarIcon {
	const lowercaseName = name.toLowerCase();
	for (const [key, Icon] of Object.entries(FEATURE_ICONS)) {
		if (lowercaseName.includes(key)) {
			return Icon;
		}
	}
	return ChartBarIcon;
}

const UsageRow = memo(function UsageRowComponent({
	feature,
	onUpgrade,
}: {
	feature: FeatureUsage;
	onUpgrade: () => void;
}) {
	const percentage = feature.unlimited
		? 0
		: feature.limit > 0
			? Math.min((feature.used / feature.limit) * 100, 100)
			: 0;

	const isNearLimit =
		!(feature.unlimited || feature.hasExtraCredits) &&
		(percentage > 80 || feature.balance < feature.limit * 0.2);

	const isOverLimit =
		!feature.unlimited && (percentage >= 100 || feature.balance <= 0);

	const Icon = getFeatureIcon(feature.name);
	const resetText = getResetText(feature);

	return (
		<div className="px-5 py-4">
			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-background">
						<Icon
							className="text-muted-foreground"
							size={18}
							weight="duotone"
						/>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-medium">{feature.name}</span>
							{feature.hasExtraCredits && (
								<Badge
									className="bg-primary/10 text-primary"
									variant="secondary"
								>
									<GiftIcon className="mr-1" size={10} />
									Bonus
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-1 text-muted-foreground text-sm">
							<ClockIcon size={12} />
							{resetText}
						</div>
					</div>
				</div>
				{feature.unlimited ? (
					<Badge variant="secondary">
						<LightningIcon className="mr-1" size={12} />
						Unlimited
					</Badge>
				) : (
					<span
						className={cn(
							"font-mono text-base",
							isOverLimit
								? "text-destructive"
								: isNearLimit
									? "text-warning"
									: "text-foreground"
						)}
					>
						{formatCompactNumber(feature.used)} /{" "}
						{formatCompactNumber(feature.limit)}
					</span>
				)}
			</div>

			{!feature.unlimited && (
				<div className="flex items-center gap-3">
					<div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
						<div
							className={cn(
								"h-full transition-all",
								feature.hasExtraCredits
									? "bg-primary"
									: isOverLimit
										? "bg-destructive"
										: isNearLimit
											? "bg-warning"
											: "bg-primary"
							)}
							style={{ width: `${percentage}%` }}
						/>
					</div>
					{isNearLimit && (
						<button
							className="shrink-0 font-medium text-primary text-sm hover:underline"
							onClick={onUpgrade}
							type="button"
						>
							Upgrade
						</button>
					)}
				</div>
			)}
		</div>
	);
});

function EmptyUsageState() {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<TrendUpIcon
				className="mb-3 text-muted-foreground"
				size={32}
				weight="duotone"
			/>
			<p className="font-medium">No usage data yet</p>
			<p className="text-muted-foreground text-sm">
				Start using features to see your stats
			</p>
		</div>
	);
}

function ErrorState({
	error,
	onRetry,
}: {
	error: Error | unknown;
	onRetry: () => void;
}) {
	return (
		<div className="flex h-full flex-col items-center justify-center p-8">
			<WarningIcon
				className="mb-3 text-destructive"
				size={32}
				weight="duotone"
			/>
			<p className="mb-1 font-medium">Error Loading Billing</p>
			<p className="mb-4 text-muted-foreground text-sm">
				{error instanceof Error ? error.message : "Failed to load billing data"}
			</p>
			<Button onClick={onRetry} variant="outline">
				Retry
			</Button>
		</div>
	);
}

function OverviewSkeleton() {
	return (
		<div className="flex h-full flex-col lg:flex-row">
			<div className="flex-1">
				<div className="border-b px-5 py-4">
					<Skeleton className="mb-1 h-5 w-20" />
					<Skeleton className="h-4 w-40" />
				</div>
				<div className="divide-y">
					{[1, 2, 3].map((i) => (
						<div className="px-5 py-4" key={i}>
							<div className="mb-3 flex items-center gap-3">
								<Skeleton className="h-10 w-10 rounded" />
								<div>
									<Skeleton className="mb-1 h-4 w-24" />
									<Skeleton className="h-3 w-32" />
								</div>
							</div>
							<Skeleton className="h-2 w-full rounded-full" />
						</div>
					))}
				</div>
			</div>
			<div className="w-full shrink-0 border-l bg-muted/30 lg:w-80">
				<div className="border-b p-5">
					<Skeleton className="mb-3 h-5 w-28" />
					<div className="flex items-center gap-3">
						<Skeleton className="h-11 w-11 rounded" />
						<div>
							<Skeleton className="mb-1 h-4 w-20" />
							<Skeleton className="h-3 w-28" />
						</div>
					</div>
				</div>
				<div className="border-b p-5">
					<Skeleton className="mb-3 h-5 w-32" />
					<Skeleton className="aspect-[1.586/1] w-full rounded-xl" />
				</div>
				<div className="space-y-2 p-5">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		</div>
	);
}
