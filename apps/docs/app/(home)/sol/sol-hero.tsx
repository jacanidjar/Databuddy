"use client";

import type { IconWeight } from "@phosphor-icons/react";
import {
	ArrowSquareOutIcon,
	ChartLineUpIcon,
	CurrencyDollarIcon,
	DropIcon,
	UsersIcon,
} from "@phosphor-icons/react";

interface SolHeroProps {
	price: number;
	priceChange24h: number;
	marketCap: number;
	liquidity: number;
	holders: number;
	symbol: string;
	name: string;
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
		return `${(num / 1_000_000).toFixed(1)}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}K`;
	}
	return num.toLocaleString();
}

function formatPrice(num: number): string {
	if (num < 0.01) {
		return `$${num.toFixed(6)}`;
	}
	if (num < 1) {
		return `$${num.toFixed(4)}`;
	}
	return `$${num.toFixed(2)}`;
}

function StatCard({
	icon: Icon,
	label,
	value,
	description,
	change,
}: {
	icon: React.ComponentType<{ className?: string; weight?: IconWeight }>;
	label: string;
	value: string;
	description: string;
	change?: number;
}) {
	const cardContent = (
		<div className="relative flex h-32 w-full flex-col items-center justify-center rounded border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border/80 hover:bg-card/70 sm:h-36 lg:h-40">
			<Icon
				className="mb-2 size-6 text-muted-foreground duration-300 group-hover:text-foreground sm:h-7 sm:w-7 lg:h-8 lg:w-8"
				weight="duotone"
			/>
			<div className="text-center">
				<div className="flex items-center justify-center gap-2">
					<div className="font-bold text-2xl sm:text-3xl lg:text-4xl">
						{value}
					</div>
					{change !== undefined && change !== 0 && (
						<span
							className={`font-medium text-xs ${change > 0 ? "text-green-500" : "text-red-500"}`}
						>
							{change > 0 ? "+" : ""}
							{change.toFixed(2)}%
						</span>
					)}
				</div>
				<div className="font-medium text-foreground text-sm sm:text-base lg:text-lg">
					{label}
				</div>
				<div className="mt-1 text-muted-foreground text-xs sm:text-sm">
					{description}
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

export default function SolHero({
	price,
	priceChange24h,
	marketCap,
	liquidity,
	holders,
	symbol,
	name,
}: SolHeroProps) {
	return (
		<section className="relative w-full pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-12 text-center lg:mb-16">
					<h1 className="mb-4 font-semibold text-3xl leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-[72px]">
						<span className="block">${symbol}</span>
						<span className="block text-muted-foreground">Token Analytics</span>
					</h1>
					<p className="mx-auto max-w-3xl text-balance font-medium text-muted-foreground text-sm leading-relaxed tracking-tight sm:text-base lg:text-lg">
						Real-time market data for {name} on Solana
					</p>

					{/* Contract Address */}
					<div className="mt-4 flex items-center justify-center">
						<a
							className="group flex items-center gap-2 rounded border border-border bg-card/30 px-3 py-2 font-mono text-muted-foreground text-xs transition-colors hover:border-border/80 hover:text-foreground sm:text-sm"
							href="https://bags.fm/9XzKDJ9wP9yqi9G5okp9UFNxFuhqyk5GNyUnnBaRBAGS"
							rel="noopener noreferrer"
							target="_blank"
						>
							<span className="hidden sm:inline">CA:</span>
							<span className="max-w-[180px] truncate sm:max-w-none">
								9XzKDJ9wP9yqi9G5okp9UFNxFuhqyk5GNyUnnBaRBAGS
							</span>
							<ArrowSquareOutIcon className="size-4 opacity-50 transition-opacity group-hover:opacity-100" />
						</a>
					</div>

					{/* Live Price Display */}
					<div className="mt-8 flex items-center justify-center gap-4">
						<div className="rounded border border-border bg-card/50 px-6 py-4 backdrop-blur-sm">
							<div className="flex items-center gap-3">
								<span className="font-bold text-3xl sm:text-4xl lg:text-5xl">
									{formatPrice(price)}
								</span>
								<span
									className={`rounded px-2 py-1 font-medium text-sm ${
										priceChange24h >= 0
											? "bg-green-500/10 text-green-500"
											: "bg-red-500/10 text-red-500"
									}`}
								>
									{priceChange24h >= 0 ? "+" : ""}
									{priceChange24h.toFixed(2)}%
								</span>
							</div>
							<div className="mt-1 text-muted-foreground text-sm">
								24h Change
							</div>
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
					<StatCard
						change={priceChange24h}
						description="Current price"
						icon={CurrencyDollarIcon}
						label="Price"
						value={formatPrice(price)}
					/>
					<StatCard
						description="Fully diluted"
						icon={ChartLineUpIcon}
						label="Market Cap"
						value={formatCurrency(marketCap)}
					/>
					<StatCard
						description="DEX liquidity"
						icon={DropIcon}
						label="Liquidity"
						value={formatCurrency(liquidity)}
					/>
					<StatCard
						description="Token holders"
						icon={UsersIcon}
						label="Holders"
						value={formatNumber(holders)}
					/>
				</div>
			</div>
		</section>
	);
}
