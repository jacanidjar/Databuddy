"use client";

import {
	ArrowSquareOutIcon,
	CalendarIcon,
	CheckIcon,
	CreditCardIcon,
	FileTextIcon,
} from "@phosphor-icons/react";
import type { CustomerInvoice } from "autumn-js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { memo, useMemo } from "react";
import { useBilling } from "@/app/(main)/billing/hooks/use-billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "../hooks/use-billing";

dayjs.extend(relativeTime);

const INVOICE_STATUS_CONFIG = {
	paid: {
		variant: "default" as const,
		className: "bg-emerald-500 hover:bg-emerald-600",
		text: "Paid",
	},
	open: { variant: "secondary" as const, className: "", text: "Pending" },
	pending: { variant: "secondary" as const, className: "", text: "Pending" },
	failed: { variant: "destructive" as const, className: "", text: "Failed" },
	draft: { variant: "outline" as const, className: "", text: "Draft" },
	void: { variant: "outline" as const, className: "", text: "Void" },
} as const;

const PRODUCT_DISPLAY_NAMES: Record<string, string> = {
	free: "Free",
	pro: "Pro",
	buddy: "Buddy",
	hobby: "Hobby",
	scale: "Scale",
};

function formatCurrency(amount: number, currency: string): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency.toUpperCase(),
	}).format(amount);
}

function getProductDisplayName(id: string): string {
	return PRODUCT_DISPLAY_NAMES[id] ?? id;
}

const InvoiceCard = memo(function InvoiceCardComponent({
	invoice,
}: {
	invoice: CustomerInvoice;
}) {
	const statusConfig =
		INVOICE_STATUS_CONFIG[invoice.status as keyof typeof INVOICE_STATUS_CONFIG];
	const productNames = invoice.product_ids
		.map(getProductDisplayName)
		.join(", ");

	return (
		<Card className="transition-shadow hover:shadow-sm">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex min-w-0 flex-1 items-center gap-3">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border bg-muted">
							<FileTextIcon
								className="not-dark:text-primary text-muted-foreground"
								size={16}
								weight="duotone"
							/>
						</div>
						<div className="min-w-0 flex-1">
							<div className="mb-1 flex items-center gap-2">
								<h4 className="font-medium text-sm">
									#{invoice.stripe_id.slice(-8)}
								</h4>
								{statusConfig && (
									<Badge
										className={`text-xs ${statusConfig.className}`}
										variant={statusConfig.variant}
									>
										{statusConfig.text}
									</Badge>
								)}
							</div>
							<div className="flex items-center gap-4 text-muted-foreground text-xs">
								<span
									title={dayjs(invoice.created_at).format("MMM D, YYYY h:mm A")}
								>
									{dayjs(invoice.created_at).fromNow()}
								</span>
								<span>{productNames}</span>
							</div>
						</div>
					</div>

					<div className="flex shrink-0 items-center gap-3">
						<div className="text-right font-semibold">
							{formatCurrency(invoice.total, invoice.currency)}
						</div>
						{invoice.hosted_invoice_url && (
							<Button
								aria-label="View invoice details"
								className="h-8 px-2"
								onClick={() =>
									window.open(invoice.hosted_invoice_url, "_blank")
								}
								size="sm"
								type="button"
								variant="ghost"
							>
								<ArrowSquareOutIcon
									className="not-dark:text-primary"
									size={14}
									weight="duotone"
								/>
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
});

const SubscriptionHistoryCard = memo(function SubscriptionHistoryCardComponent({
	customerData,
}: {
	customerData: Customer;
}) {
	if (!customerData?.products?.length) {
		return null;
	}

	return (
		<Card>
			<CardContent className="p-4">
				<div className="space-y-2">
					{customerData.products.map((product) => {
						const renewalDate = product.current_period_end
							? dayjs(product.current_period_end)
							: null;
						const isCanceled = !!product.canceled_at;

						return (
							<div
								className="flex items-start gap-2 rounded border p-2 text-sm"
								key={product.id}
							>
								<div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
									<CheckIcon className="not-dark:text-primary" size={10} />
								</div>
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center justify-between">
										<h4 className="truncate font-medium text-sm">
											{product.name || product.id}
										</h4>
										<Badge
											className="ml-2 text-xs"
											variant={
												product.status === "active" ? "default" : "secondary"
											}
										>
											{product.status}
										</Badge>
									</div>
									<div className="space-y-0.5 text-muted-foreground text-xs">
										<div>Started {dayjs(product.started_at).fromNow()}</div>
										{renewalDate && (
											<div title={renewalDate.format("MMM D, YYYY h:mm A")}>
												{isCanceled ? "Ends" : "Renews"} {renewalDate.fromNow()}
											</div>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
});

type HistoryTabProps = {
	invoices: CustomerInvoice[];
	customerData: Customer | null | undefined;
	isLoading: boolean;
};

export const HistoryTab = memo(function HistoryTabComponent({
	invoices,
	customerData,
	isLoading,
}: HistoryTabProps) {
	const { onManageBilling } = useBilling();

	const sortedInvoices = useMemo(
		() => [...invoices].sort((a, b) => b.created_at - a.created_at),
		[invoices]
	);

	if (isLoading) {
		return <HistoryTabSkeleton />;
	}

	return (
		<div className="space-y-6">
			<HistoryHeader onManageBilling={onManageBilling} />

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					{sortedInvoices.length > 0 ? (
						<div className="space-y-3">
							{sortedInvoices.map((invoice) => (
								<InvoiceCard invoice={invoice} key={invoice.stripe_id} />
							))}
						</div>
					) : (
						<EmptyState
							description="Your invoices will appear here once you start using paid features."
							icon={FileTextIcon}
							title="No Invoices Yet"
						/>
					)}
				</div>

				<div className="lg:col-span-1">
					{customerData ? (
						<SubscriptionHistoryCard customerData={customerData} />
					) : (
						<EmptyState
							description="Your subscription history will appear here."
							icon={CalendarIcon}
							title="No History"
						/>
					)}
				</div>
			</div>
		</div>
	);
});

function HistoryTabSkeleton() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-96" />
			</div>
			<div className="grid gap-6">
				{[1, 2, 3].map((i) => (
					<Skeleton className="h-20 w-full" key={i} />
				))}
			</div>
		</div>
	);
}

function HistoryHeader({ onManageBilling }: { onManageBilling: () => void }) {
	return (
		<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<h1 className="font-bold text-2xl tracking-tight">Billing History</h1>
				<p className="mt-1 text-muted-foreground">
					View your invoices and subscription changes
				</p>
			</div>
			<Button
				className="w-full sm:w-auto"
				onClick={onManageBilling}
				size="sm"
				type="button"
				variant="outline"
			>
				<CreditCardIcon
					className="mr-2 not-dark:text-primary"
					size={16}
					weight="duotone"
				/>
				Manage Billing
				<ArrowSquareOutIcon
					className="ml-2 not-dark:text-primary"
					size={12}
					weight="duotone"
				/>
			</Button>
		</div>
	);
}

function EmptyState({
	icon: Icon,
	title,
	description,
}: {
	icon: typeof FileTextIcon;
	title: string;
	description: string;
}) {
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center py-12">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded border bg-muted">
					<Icon
						className="not-dark:text-primary text-muted-foreground"
						size={24}
						weight="duotone"
					/>
				</div>
				<h3 className="mb-2 font-semibold text-lg">{title}</h3>
				<p className="text-center text-muted-foreground text-sm">
					{description}
				</p>
			</CardContent>
		</Card>
	);
}
