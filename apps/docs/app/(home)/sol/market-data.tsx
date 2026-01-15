"use client";

import { SciFiCard } from "@/components/scifi-card";

interface MarketDataProps {
	marketCap: number;
	volume24h: number;
	liquidity: number;
	price: number;
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

function ProgressBar({
	label,
	value,
	maxValue,
	color,
}: {
	label: string;
	value: number;
	maxValue: number;
	color: string;
}) {
	const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<span className="font-medium text-foreground text-sm">{label}</span>
				<span className="text-muted-foreground text-sm">
					{formatCurrency(value)}
				</span>
			</div>
			<div className="h-2 w-full overflow-hidden rounded bg-border/50">
				<div
					className="h-full rounded transition-all duration-500"
					style={{
						width: `${percentage}%`,
						backgroundColor: color,
					}}
				/>
			</div>
		</div>
	);
}

function MetricCard({
	title,
	value,
	subtitle,
	color,
}: {
	title: string;
	value: string;
	subtitle: string;
	color: string;
}) {
	return (
		<div className="flex items-center gap-4 rounded border border-border bg-card/30 p-4 backdrop-blur-sm">
			<div className="size-3 rounded-full" style={{ backgroundColor: color }} />
			<div className="flex-1">
				<div className="text-muted-foreground text-xs">{title}</div>
				<div className="font-bold text-lg">{value}</div>
				<div className="text-muted-foreground text-xs">{subtitle}</div>
			</div>
		</div>
	);
}

export default function MarketData({
	marketCap,
	volume24h,
	liquidity,
	price,
}: MarketDataProps) {
	// Calculate derived metrics
	const liquidityRatio =
		marketCap > 0 ? ((liquidity / marketCap) * 100).toFixed(2) : "0";
	const volumeToLiquidity =
		liquidity > 0 ? ((volume24h / liquidity) * 100).toFixed(2) : "0";

	// Find max for relative scaling
	const maxValue = Math.max(marketCap, volume24h, liquidity);

	return (
		<div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
			{/* Market Overview */}
			<div>
				<div className="mb-6">
					<h3 className="mb-2 font-semibold text-xl sm:text-2xl">
						Market Overview
					</h3>
					<p className="text-muted-foreground text-sm sm:text-base">
						Comparative view of key market metrics
					</p>
				</div>

				<SciFiCard className="rounded border border-border bg-card/50 p-6 backdrop-blur-sm">
					<div className="space-y-6">
						<ProgressBar
							color="#a855f7"
							label="Market Cap"
							maxValue={maxValue}
							value={marketCap}
						/>
						<ProgressBar
							color="#3b82f6"
							label="24h Volume"
							maxValue={maxValue}
							value={volume24h}
						/>
						<ProgressBar
							color="#06b6d4"
							label="Liquidity"
							maxValue={maxValue}
							value={liquidity}
						/>
					</div>
				</SciFiCard>
			</div>

			{/* Health Metrics */}
			<div>
				<div className="mb-6">
					<h3 className="mb-2 font-semibold text-xl sm:text-2xl">
						Health Metrics
					</h3>
					<p className="text-muted-foreground text-sm sm:text-base">
						Key ratios and indicators
					</p>
				</div>

				<div className="space-y-4">
					<MetricCard
						color="#22c55e"
						subtitle="Liquidity as % of market cap"
						title="Liquidity Ratio"
						value={`${liquidityRatio}%`}
					/>
					<MetricCard
						color="#f59e0b"
						subtitle="Daily volume vs liquidity"
						title="Volume/Liquidity"
						value={`${volumeToLiquidity}%`}
					/>
					<MetricCard
						color="#8b5cf6"
						subtitle={`At ${formatCurrency(price)} per token`}
						title="Current Price"
						value={
							price < 0.01 ? `$${price.toFixed(8)}` : formatCurrency(price)
						}
					/>
				</div>

				{/* Status Indicators */}
				<div className="mt-6 rounded border border-border bg-card/30 p-4 backdrop-blur-sm">
					<div className="mb-3 font-medium text-foreground text-sm">
						Market Status
					</div>
					<div className="grid grid-cols-2 gap-3">
						<StatusIndicator
							isPositive={Number(liquidityRatio) >= 5}
							label="Liquidity"
						/>
						<StatusIndicator
							isPositive={Number(volumeToLiquidity) >= 10}
							label="Activity"
						/>
						<StatusIndicator isPositive={marketCap > 0} label="Market Cap" />
						<StatusIndicator isPositive={volume24h > 0} label="Volume" />
					</div>
				</div>
			</div>
		</div>
	);
}

function StatusIndicator({
	label,
	isPositive,
}: {
	label: string;
	isPositive: boolean;
}) {
	return (
		<div className="flex items-center gap-2">
			<div
				className={`size-2 rounded-full ${isPositive ? "bg-green-500" : "bg-yellow-500"}`}
			/>
			<span className="text-muted-foreground text-xs">{label}</span>
		</div>
	);
}
