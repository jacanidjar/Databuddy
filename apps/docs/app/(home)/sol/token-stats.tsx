"use client";

import type { IconWeight } from "@phosphor-icons/react";
import {
	ChartBarIcon,
	ChartLineUpIcon,
	CoinsIcon,
	DropIcon,
	UsersIcon,
} from "@phosphor-icons/react";

interface TokenStatsProps {
	marketCap: number;
	volume24h: number;
	volumeChange24h: number;
	liquidity: number;
	supply: number;
	holders: number;
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
	if (num >= 1_000_000_000) {
		return `${(num / 1_000_000_000).toFixed(2)}B`;
	}
	if (num >= 1_000_000) {
		return `${(num / 1_000_000).toFixed(2)}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toLocaleString();
}

function StatCard({
	icon: Icon,
	label,
	value,
	description,
	change,
	color = "text-muted-foreground",
}: {
	icon: React.ComponentType<{ className?: string; weight?: IconWeight }>;
	label: string;
	value: string;
	description: string;
	change?: number;
	color?: string;
}) {
	const cardContent = (
		<div className="relative flex h-28 flex-col justify-center rounded border border-border bg-card/50 px-6 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/70">
			<div className="flex items-center gap-4">
				<Icon className={`size-8 ${color}`} weight="duotone" />
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<div className="font-bold text-xl">{value}</div>
						{change !== undefined && change !== 0 && (
							<span
								className={`font-medium text-xs ${change > 0 ? "text-green-500" : "text-red-500"}`}
							>
								{change > 0 ? "+" : ""}
								{change.toFixed(1)}%
							</span>
						)}
					</div>
					<div className="font-medium text-foreground text-sm">{label}</div>
					<div className="text-muted-foreground text-xs">{description}</div>
				</div>
			</div>
		</div>
	);

	const corners = (
		<div className="pointer-events-none absolute inset-0">
			<div className="absolute top-0 left-0 size-2 group-hover:animate-[cornerGlitch_0.6s_ease-in-out]">
				<div className="absolute top-0 left-0.5 h-0.5 w-1.5 origin-left bg-foreground" />
				<div className="absolute top-0 left-0 h-2 w-0.5 origin-top bg-foreground" />
			</div>
			<div className="absolute top-0 right-0 size-2 -scale-x-[1] group-hover:animate-[cornerGlitch_0.6s_ease-in-out]">
				<div className="absolute top-0 left-0.5 h-0.5 w-1.5 origin-left bg-foreground" />
				<div className="absolute top-0 left-0 h-2 w-0.5 origin-top bg-foreground" />
			</div>
			<div className="absolute bottom-0 left-0 size-2 -scale-y-[1] group-hover:animate-[cornerGlitch_0.6s_ease-in-out]">
				<div className="absolute top-0 left-0.5 h-0.5 w-1.5 origin-left bg-foreground" />
				<div className="absolute top-0 left-0 h-2 w-0.5 origin-top bg-foreground" />
			</div>
			<div className="absolute right-0 bottom-0 size-2 -scale-[1] group-hover:animate-[cornerGlitch_0.6s_ease-in-out]">
				<div className="absolute top-0 left-0.5 h-0.5 w-1.5 origin-left bg-foreground" />
				<div className="absolute top-0 left-0 h-2 w-0.5 origin-top bg-foreground" />
			</div>
		</div>
	);

	return (
		<div className="group relative">
			{cardContent}
			{corners}
		</div>
	);
}

export default function TokenStats({
	marketCap,
	volume24h,
	volumeChange24h,
	liquidity,
	supply,
	holders,
}: TokenStatsProps) {
	return (
		<div>
			<div className="mb-8">
				<h3 className="mb-2 font-semibold text-2xl sm:text-3xl lg:text-4xl">
					Token Metrics
				</h3>
				<p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
					Key statistics and market data
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<StatCard
					color="text-purple-500"
					description="Fully diluted valuation"
					icon={ChartLineUpIcon}
					label="Market Cap"
					value={formatCurrency(marketCap)}
				/>
				<StatCard
					change={volumeChange24h}
					color="text-blue-500"
					description="Trading volume"
					icon={ChartBarIcon}
					label="24h Volume"
					value={formatCurrency(volume24h)}
				/>
				<StatCard
					color="text-cyan-500"
					description="Total DEX liquidity"
					icon={DropIcon}
					label="Liquidity"
					value={formatCurrency(liquidity)}
				/>
				<StatCard
					color="text-orange-500"
					description="Total token supply"
					icon={CoinsIcon}
					label="Supply"
					value={formatNumber(supply)}
				/>
				<StatCard
					color="text-green-500"
					description="Unique wallet holders"
					icon={UsersIcon}
					label="Holders"
					value={formatNumber(holders)}
				/>
				<StatCard
					color="text-yellow-500"
					description="Volume to market cap"
					icon={ChartBarIcon}
					label="Vol/MCap Ratio"
					value={
						marketCap > 0
							? `${((volume24h / marketCap) * 100).toFixed(2)}%`
							: "N/A"
					}
				/>
			</div>
		</div>
	);
}
