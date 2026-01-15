"use client";

import type { IconWeight } from "@phosphor-icons/react";
import {
	ArrowDownIcon,
	ArrowsCounterClockwiseIcon,
	ArrowUpIcon,
	ChartBarIcon,
	LightningIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { SciFiCard } from "@/components/scifi-card";

interface TransactionActivityProps {
	trades24h: number;
	volume24h: number;
	buyVolume24h: number;
	sellVolume24h: number;
	organicBuyVolume24h: number;
	organicSellVolume24h: number;
	numTraders24h: number;
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

function formatNumber(num: number): string {
	if (num >= 1_000_000) {
		return `${(num / 1_000_000).toFixed(2)}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toLocaleString();
}

function ActivityCard({
	icon: Icon,
	title,
	value,
	subtitle,
}: {
	icon: React.ComponentType<{ className?: string; weight?: IconWeight }>;
	title: string;
	value: string;
	subtitle: string;
}) {
	return (
		<SciFiCard className="rounded border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/70">
			<div className="flex items-start gap-4">
				<div className="flex size-12 items-center justify-center rounded border border-border bg-card/50">
					<Icon className="size-6" weight="duotone" />
				</div>
				<div className="flex-1">
					<div className="text-muted-foreground text-sm">{title}</div>
					<div className="font-bold text-2xl">{value}</div>
					<div className="text-muted-foreground text-xs">{subtitle}</div>
				</div>
			</div>
		</SciFiCard>
	);
}

function VolumeBar({
	label,
	value,
	total,
	color,
	icon: Icon,
}: {
	label: string;
	value: number;
	total: number;
	color: string;
	icon: React.ComponentType<{ className?: string }>;
}) {
	const percentage = total > 0 ? (value / total) * 100 : 0;

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Icon className={`size-4 ${color}`} />
					<span className="font-medium text-foreground text-sm">{label}</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground text-sm">
						{formatCurrency(value)}
					</span>
					<span className="text-muted-foreground text-xs">
						({percentage.toFixed(1)}%)
					</span>
				</div>
			</div>
			<div className="h-2 w-full overflow-hidden rounded bg-border/50">
				<div
					className="h-full rounded transition-all duration-500"
					style={{
						width: `${percentage}%`,
						backgroundColor:
							color === "text-green-500"
								? "#22c55e"
								: color === "text-red-500"
									? "#ef4444"
									: "#3b82f6",
					}}
				/>
			</div>
		</div>
	);
}

export default function TransactionActivity({
	trades24h,
	volume24h,
	buyVolume24h,
	sellVolume24h,
	organicBuyVolume24h,
	organicSellVolume24h,
	numTraders24h,
}: TransactionActivityProps) {
	const avgTradeSize = trades24h > 0 ? volume24h / trades24h : 0;
	const organicVolume = organicBuyVolume24h + organicSellVolume24h;
	const organicPercentage =
		volume24h > 0 ? (organicVolume / volume24h) * 100 : 0;

	if (trades24h === 0 && volume24h === 0) {
		return (
			<div>
				<div className="mb-8">
					<h3 className="mb-2 font-semibold text-2xl sm:text-3xl lg:text-4xl">
						Trading Activity
					</h3>
					<p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
						24-hour transaction metrics
					</p>
				</div>
				<SciFiCard className="rounded border border-border bg-card/50 p-8 backdrop-blur-sm">
					<div className="py-8 text-center text-muted-foreground">
						No trading activity data available
					</div>
				</SciFiCard>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-8">
				<h3 className="mb-2 font-semibold text-2xl sm:text-3xl lg:text-4xl">
					Trading Activity
				</h3>
				<p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
					24-hour transaction metrics
				</p>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<ActivityCard
					icon={ArrowsCounterClockwiseIcon}
					subtitle="Total DEX trades"
					title="24h Trades"
					value={formatNumber(trades24h)}
				/>
				<ActivityCard
					icon={ChartBarIcon}
					subtitle="Total volume"
					title="24h Volume"
					value={formatCurrency(volume24h)}
				/>
				<ActivityCard
					icon={UsersIcon}
					subtitle="Unique traders"
					title="Traders"
					value={formatNumber(numTraders24h)}
				/>
				<ActivityCard
					icon={LightningIcon}
					subtitle="Per trade"
					title="Avg Size"
					value={formatCurrency(avgTradeSize)}
				/>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				{/* Buy/Sell Breakdown */}
				<SciFiCard className="rounded border border-border bg-card/50 p-6 backdrop-blur-sm">
					<h4 className="mb-4 font-medium text-foreground text-lg">
						Volume Breakdown
					</h4>
					<div className="space-y-4">
						<VolumeBar
							color="text-green-500"
							icon={ArrowUpIcon}
							label="Buy Volume"
							total={volume24h}
							value={buyVolume24h}
						/>
						<VolumeBar
							color="text-red-500"
							icon={ArrowDownIcon}
							label="Sell Volume"
							total={volume24h}
							value={sellVolume24h}
						/>
					</div>
					<div className="mt-4 border-border border-t pt-4">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Buy/Sell Ratio</span>
							<span
								className={`font-medium ${
									buyVolume24h >= sellVolume24h
										? "text-green-500"
										: "text-red-500"
								}`}
							>
								{sellVolume24h > 0
									? (buyVolume24h / sellVolume24h).toFixed(2)
									: "N/A"}
							</span>
						</div>
					</div>
				</SciFiCard>

				{/* Organic Volume */}
				<SciFiCard className="rounded border border-border bg-card/50 p-6 backdrop-blur-sm">
					<h4 className="mb-4 font-medium text-foreground text-lg">
						Organic Volume
					</h4>
					<div className="space-y-4">
						<VolumeBar
							color="text-green-500"
							icon={ArrowUpIcon}
							label="Organic Buys"
							total={buyVolume24h}
							value={organicBuyVolume24h}
						/>
						<VolumeBar
							color="text-red-500"
							icon={ArrowDownIcon}
							label="Organic Sells"
							total={sellVolume24h}
							value={organicSellVolume24h}
						/>
					</div>
					<div className="mt-4 border-border border-t pt-4">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Organic %</span>
							<span
								className={`font-medium ${
									organicPercentage >= 50 ? "text-green-500" : "text-yellow-500"
								}`}
							>
								{organicPercentage.toFixed(1)}%
							</span>
						</div>
						<div className="mt-1 text-muted-foreground text-xs">
							Percentage of volume from organic traders vs bots
						</div>
					</div>
				</SciFiCard>
			</div>
		</div>
	);
}
