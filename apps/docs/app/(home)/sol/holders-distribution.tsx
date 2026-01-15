"use client";

import type { IconWeight } from "@phosphor-icons/react";
import {
	CheckCircleIcon,
	ShieldCheckIcon,
	UsersIcon,
	WalletIcon,
	WarningIcon,
} from "@phosphor-icons/react";
import { SciFiCard } from "@/components/scifi-card";

interface HoldersDistributionProps {
	holders: number;
	holderChange24h: number;
	marketCap: number;
	topHoldersPercentage: number | null;
	devBalancePercentage: number | null;
	mintAuthorityDisabled: boolean | null;
	freezeAuthorityDisabled: boolean | null;
	organicScore: number;
	organicScoreLabel: "high" | "medium" | "low";
}

function formatNumber(num: number): string {
	if (num >= 1_000_000) {
		return `${(num / 1_000_000).toFixed(2)}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toLocaleString();
}

function formatCurrency(num: number): string {
	if (num >= 1_000_000_000) {
		return `$${(num / 1_000_000_000).toFixed(2)}B`;
	}
	if (num >= 1_000_000) {
		return `$${(num / 1_000_000).toFixed(2)}M`;
	}
	if (num >= 1000) {
		return `$${(num / 1000).toFixed(2)}K`;
	}
	return `$${num.toFixed(2)}`;
}

function StatCard({
	icon: Icon,
	title,
	value,
	subtitle,
	change,
}: {
	icon: React.ComponentType<{ className?: string; weight?: IconWeight }>;
	title: string;
	value: string;
	subtitle: string;
	change?: number;
}) {
	return (
		<SciFiCard className="rounded border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/70">
			<div className="flex items-center gap-4">
				<div className="flex size-12 items-center justify-center rounded border border-border bg-card/50">
					<Icon className="size-6" weight="duotone" />
				</div>
				<div>
					<div className="text-muted-foreground text-sm">{title}</div>
					<div className="flex items-center gap-2">
						<div className="font-bold text-2xl">{value}</div>
						{change !== undefined && change !== 0 && (
							<span
								className={`font-medium text-xs ${change > 0 ? "text-green-500" : "text-red-500"}`}
							>
								{change > 0 ? "+" : ""}
								{change.toFixed(1)}%
							</span>
						)}
					</div>
					<div className="text-muted-foreground text-xs">{subtitle}</div>
				</div>
			</div>
		</SciFiCard>
	);
}

function AuditItem({
	label,
	value,
	isGood,
}: {
	label: string;
	value: string;
	isGood: boolean | null;
}) {
	return (
		<div className="flex items-center justify-between py-2">
			<span className="text-muted-foreground text-sm">{label}</span>
			<div className="flex items-center gap-2">
				<span className="font-medium text-foreground text-sm">{value}</span>
				{isGood === true && (
					<CheckCircleIcon className="size-4 text-green-500" weight="fill" />
				)}
				{isGood === false && (
					<WarningIcon className="size-4 text-yellow-500" weight="fill" />
				)}
			</div>
		</div>
	);
}

export default function HoldersDistribution({
	holders,
	holderChange24h,
	marketCap,
	topHoldersPercentage,
	devBalancePercentage,
	mintAuthorityDisabled,
	freezeAuthorityDisabled,
	organicScore,
	organicScoreLabel,
}: HoldersDistributionProps) {
	const avgHolding = holders > 0 ? marketCap / holders : 0;
	const hasAuditData =
		topHoldersPercentage !== null ||
		devBalancePercentage !== null ||
		mintAuthorityDisabled !== null ||
		freezeAuthorityDisabled !== null;

	if (holders === 0 && !hasAuditData) {
		return (
			<div>
				<div className="mb-8">
					<h3 className="mb-2 font-semibold text-2xl sm:text-3xl lg:text-4xl">
						Holder Analytics
					</h3>
					<p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
						Token holder metrics and security audit
					</p>
				</div>
				<SciFiCard className="rounded border border-border bg-card/50 p-8 backdrop-blur-sm">
					<div className="py-8 text-center text-muted-foreground">
						No holder data available
					</div>
				</SciFiCard>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-8">
				<h3 className="mb-2 font-semibold text-2xl sm:text-3xl lg:text-4xl">
					Holder Analytics
				</h3>
				<p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
					Token holder metrics and security audit
				</p>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<StatCard
					change={holderChange24h}
					icon={UsersIcon}
					subtitle="Unique wallet addresses"
					title="Total Holders"
					value={formatNumber(holders)}
				/>
				<StatCard
					icon={WalletIcon}
					subtitle="Market cap / holders"
					title="Average Holding"
					value={formatCurrency(avgHolding)}
				/>
			</div>

			{hasAuditData && (
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					{/* Concentration Data */}
					<SciFiCard className="rounded border border-border bg-card/50 p-6 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-2">
							<ShieldCheckIcon className="size-5" weight="duotone" />
							<h4 className="font-medium text-foreground text-lg">
								Token Audit
							</h4>
						</div>
						<div className="space-y-1 divide-y divide-border/50">
							{topHoldersPercentage !== null && (
								<AuditItem
									isGood={topHoldersPercentage < 50}
									label="Top Holders %"
									value={`${topHoldersPercentage.toFixed(1)}%`}
								/>
							)}
							{devBalancePercentage !== null && (
								<AuditItem
									isGood={devBalancePercentage < 10}
									label="Dev Balance %"
									value={`${devBalancePercentage.toFixed(1)}%`}
								/>
							)}
							{mintAuthorityDisabled !== null && (
								<AuditItem
									isGood={mintAuthorityDisabled}
									label="Mint Authority"
									value={mintAuthorityDisabled ? "Disabled" : "Enabled"}
								/>
							)}
							{freezeAuthorityDisabled !== null && (
								<AuditItem
									isGood={freezeAuthorityDisabled}
									label="Freeze Authority"
									value={freezeAuthorityDisabled ? "Disabled" : "Enabled"}
								/>
							)}
						</div>
					</SciFiCard>

					{/* Organic Score */}
					<SciFiCard className="rounded border border-border bg-card/50 p-6 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-2">
							<CheckCircleIcon className="size-5" weight="duotone" />
							<h4 className="font-medium text-foreground text-lg">
								Organic Score
							</h4>
						</div>
						<div className="flex items-center gap-6">
							<div
								className={`flex size-20 items-center justify-center rounded-full border-4 ${
									organicScoreLabel === "high"
										? "border-green-500 text-green-500"
										: organicScoreLabel === "medium"
											? "border-yellow-500 text-yellow-500"
											: "border-red-500 text-red-500"
								}`}
							>
								<span className="font-bold text-2xl">
									{organicScore.toFixed(0)}
								</span>
							</div>
							<div>
								<div
									className={`font-semibold text-lg capitalize ${
										organicScoreLabel === "high"
											? "text-green-500"
											: organicScoreLabel === "medium"
												? "text-yellow-500"
												: "text-red-500"
									}`}
								>
									{organicScoreLabel}
								</div>
								<div className="text-muted-foreground text-sm">
									Organic trading activity score
								</div>
							</div>
						</div>
						<div className="mt-4 text-muted-foreground text-xs">
							Higher scores indicate more genuine trading activity vs bot/wash
							trading
						</div>
					</SciFiCard>
				</div>
			)}
		</div>
	);
}
