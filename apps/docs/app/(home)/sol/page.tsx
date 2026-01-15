import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { Footer } from "@/components/footer";
import Section from "@/components/landing/section";
import { Spotlight } from "@/components/landing/spotlight";
import { StructuredData } from "@/components/structured-data";
import HoldersDistribution from "./holders-distribution";
import MarketData from "./market-data";
import SolHero from "./sol-hero";
import TokenStats from "./token-stats";
import TransactionActivity from "./transaction-activity";

const DATABUDDY_MINT = "9XzKDJ9wP9yqi9G5okp9UFNxFuhqyk5GNyUnnBaRBAGS";
const JUP_API_KEY = process.env.JUP_KEY || "";
const CACHE_REVALIDATE_SECONDS = 300;

function getJupiterHeaders(): HeadersInit {
	const headers: HeadersInit = { accept: "application/json" };
	if (JUP_API_KEY) {
		headers["x-api-key"] = JUP_API_KEY;
	}
	return headers;
}

export const metadata: Metadata = {
	title: "$DATABUDDY Token | Databuddy",
	description:
		"Live analytics and market data for the $DATABUDDY token on Solana",
	alternates: {
		canonical: "https://www.databuddy.cc/sol",
	},
	openGraph: {
		title: "$DATABUDDY Token | Databuddy",
		description:
			"Live analytics and market data for the $DATABUDDY token on Solana",
		url: "https://www.databuddy.cc/sol",
		images: ["/og-image.png"],
	},
};

interface SwapStats {
	priceChange: number | null;
	holderChange: number | null;
	liquidityChange: number | null;
	volumeChange: number | null;
	buyVolume: number | null;
	sellVolume: number | null;
	buyOrganicVolume: number | null;
	sellOrganicVolume: number | null;
	numBuys: number | null;
	numSells: number | null;
	numTraders: number | null;
	numOrganicBuyers: number | null;
	numNetBuyers: number | null;
}

interface JupiterTokenInfo {
	id: string;
	name: string;
	symbol: string;
	icon: string | null;
	decimals: number;
	twitter: string | null;
	telegram: string | null;
	website: string | null;
	dev: string | null;
	circSupply: number | null;
	totalSupply: number | null;
	holderCount: number | null;
	fdv: number | null;
	mcap: number | null;
	usdPrice: number | null;
	liquidity: number | null;
	stats5m: SwapStats | null;
	stats1h: SwapStats | null;
	stats6h: SwapStats | null;
	stats24h: SwapStats | null;
	firstPool: {
		id: string;
		createdAt: string;
	} | null;
	audit: {
		isSus: boolean | null;
		mintAuthorityDisabled: boolean | null;
		freezeAuthorityDisabled: boolean | null;
		topHoldersPercentage: number | null;
		devBalancePercentage: number | null;
		devMigrations: number | null;
	} | null;
	organicScore: number;
	organicScoreLabel: "high" | "medium" | "low";
	isVerified: boolean | null;
	cexes: string[] | null;
	tags: string[] | null;
}

interface JupiterPriceResponse {
	[mint: string]: {
		decimals: number;
		usdPrice: number;
		priceChange24h: number | null;
	};
}

export interface TokenData {
	price: number;
	priceChange24h: number;
	marketCap: number;
	fdv: number;
	volume24h: number;
	volumeChange24h: number;
	liquidity: number;
	liquidityChange24h: number;
	supply: number;
	circSupply: number;
	holders: number;
	holderChange24h: number;
	trades24h: number;
	numTraders24h: number;
	buyVolume24h: number;
	sellVolume24h: number;
	organicBuyVolume24h: number;
	organicSellVolume24h: number;
	symbol: string;
	name: string;
	icon: string | null;
	twitter: string | null;
	telegram: string | null;
	website: string | null;
	topHoldersPercentage: number | null;
	devBalancePercentage: number | null;
	mintAuthorityDisabled: boolean | null;
	freezeAuthorityDisabled: boolean | null;
	organicScore: number;
	organicScoreLabel: "high" | "medium" | "low";
	isVerified: boolean | null;
	firstPoolCreatedAt: string | null;
	cexes: string[];
	tags: string[];
}

const fetchJupiterTokenInfo = unstable_cache(
	async (): Promise<JupiterTokenInfo | null> => {
		try {
			const response = await fetch(
				`https://api.jup.ag/tokens/v2/search?query=${DATABUDDY_MINT}`,
				{
					headers: getJupiterHeaders(),
					cache: "force-cache",
				}
			);

			if (!response.ok) {
				console.warn(`Jupiter Tokens API returned ${response.status}`);
				return null;
			}

			const data: JupiterTokenInfo[] = await response.json();
			return (
				data.find((token) => token.id === DATABUDDY_MINT) || data.at(0) || null
			);
		} catch (error) {
			console.error("Failed to fetch Jupiter token info:", error);
			return null;
		}
	},
	["jupiter-token-info", DATABUDDY_MINT],
	{ revalidate: CACHE_REVALIDATE_SECONDS }
);

const fetchJupiterPrice = unstable_cache(
	async (): Promise<{ price: number; priceChange24h: number }> => {
		try {
			const response = await fetch(
				`https://api.jup.ag/price/v3?ids=${DATABUDDY_MINT}`,
				{
					headers: getJupiterHeaders(),
					cache: "force-cache",
				}
			);

			if (!response.ok) {
				console.warn(`Jupiter Price API returned ${response.status}`);
				return { price: 0, priceChange24h: 0 };
			}

			const data: JupiterPriceResponse = await response.json();
			const tokenData = data[DATABUDDY_MINT];

			return {
				price: tokenData?.usdPrice || 0,
				priceChange24h: tokenData?.priceChange24h || 0,
			};
		} catch (error) {
			console.error("Failed to fetch Jupiter price:", error);
			return { price: 0, priceChange24h: 0 };
		}
	},
	["jupiter-price", DATABUDDY_MINT],
	{ revalidate: CACHE_REVALIDATE_SECONDS }
);

async function fetchTokenData(): Promise<TokenData> {
	const [tokenInfo, priceData] = await Promise.all([
		fetchJupiterTokenInfo(),
		fetchJupiterPrice(),
	]);

	const stats24h = tokenInfo?.stats24h;

	return {
		price: priceData.price || tokenInfo?.usdPrice || 0,
		priceChange24h: priceData.priceChange24h || stats24h?.priceChange || 0,
		marketCap: tokenInfo?.mcap || 0,
		fdv: tokenInfo?.fdv || 0,
		volume24h: (stats24h?.buyVolume || 0) + (stats24h?.sellVolume || 0),
		volumeChange24h: stats24h?.volumeChange || 0,
		liquidity: tokenInfo?.liquidity || 0,
		liquidityChange24h: stats24h?.liquidityChange || 0,
		supply: tokenInfo?.totalSupply || 0,
		circSupply: tokenInfo?.circSupply || 0,
		holders: tokenInfo?.holderCount || 0,
		holderChange24h: stats24h?.holderChange || 0,
		trades24h: (stats24h?.numBuys || 0) + (stats24h?.numSells || 0),
		numTraders24h: stats24h?.numTraders || 0,
		buyVolume24h: stats24h?.buyVolume || 0,
		sellVolume24h: stats24h?.sellVolume || 0,
		organicBuyVolume24h: stats24h?.buyOrganicVolume || 0,
		organicSellVolume24h: stats24h?.sellOrganicVolume || 0,
		symbol: tokenInfo?.symbol || "DATABUDDY",
		name: tokenInfo?.name || "Databuddy",
		icon: tokenInfo?.icon || null,
		twitter: tokenInfo?.twitter || null,
		telegram: tokenInfo?.telegram || null,
		website: tokenInfo?.website || null,
		topHoldersPercentage: tokenInfo?.audit?.topHoldersPercentage ?? null,
		devBalancePercentage: tokenInfo?.audit?.devBalancePercentage ?? null,
		mintAuthorityDisabled: tokenInfo?.audit?.mintAuthorityDisabled ?? null,
		freezeAuthorityDisabled: tokenInfo?.audit?.freezeAuthorityDisabled ?? null,
		organicScore: tokenInfo?.organicScore || 0,
		organicScoreLabel: tokenInfo?.organicScoreLabel || "low",
		isVerified: tokenInfo?.isVerified ?? null,
		firstPoolCreatedAt: tokenInfo?.firstPool?.createdAt || null,
		cexes: tokenInfo?.cexes || [],
		tags: tokenInfo?.tags || [],
	};
}

export default async function SolPage() {
	const tokenData = await fetchTokenData();

	return (
		<div className="overflow-hidden">
			<StructuredData
				page={{
					title: "$DATABUDDY Token | Databuddy",
					description:
						"Live analytics and market data for the $DATABUDDY token on Solana",
					url: "https://www.databuddy.cc/sol",
				}}
			/>
			<Spotlight transform="translateX(-60%) translateY(-50%)" />

			<Section className="overflow-hidden" customPaddings id="sol-hero">
				<SolHero
					holders={tokenData.holders}
					liquidity={tokenData.liquidity}
					marketCap={tokenData.marketCap}
					name={tokenData.name}
					price={tokenData.price}
					priceChange24h={tokenData.priceChange24h}
					symbol={tokenData.symbol}
				/>
			</Section>

			<Section
				className="border-border border-t border-b bg-background/50"
				id="token-stats"
			>
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
					<TokenStats
						holders={tokenData.holders}
						liquidity={tokenData.liquidity}
						marketCap={tokenData.marketCap}
						supply={tokenData.supply}
						volume24h={tokenData.volume24h}
						volumeChange24h={tokenData.volumeChange24h}
					/>
				</div>
			</Section>

			<Section className="bg-background/30" id="market-data">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
					<MarketData
						liquidity={tokenData.liquidity}
						marketCap={tokenData.marketCap}
						price={tokenData.price}
						volume24h={tokenData.volume24h}
					/>
				</div>
			</Section>

			<Section
				className="border-border border-t border-b bg-background/50"
				id="transaction-activity"
			>
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
					<TransactionActivity
						buyVolume24h={tokenData.buyVolume24h}
						numTraders24h={tokenData.numTraders24h}
						organicBuyVolume24h={tokenData.organicBuyVolume24h}
						organicSellVolume24h={tokenData.organicSellVolume24h}
						sellVolume24h={tokenData.sellVolume24h}
						trades24h={tokenData.trades24h}
						volume24h={tokenData.volume24h}
					/>
				</div>
			</Section>

			<Section className="bg-background/30" id="holders">
				<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
					<HoldersDistribution
						devBalancePercentage={tokenData.devBalancePercentage}
						freezeAuthorityDisabled={tokenData.freezeAuthorityDisabled}
						holderChange24h={tokenData.holderChange24h}
						holders={tokenData.holders}
						marketCap={tokenData.marketCap}
						mintAuthorityDisabled={tokenData.mintAuthorityDisabled}
						organicScore={tokenData.organicScore}
						organicScoreLabel={tokenData.organicScoreLabel}
						topHoldersPercentage={tokenData.topHoldersPercentage}
					/>
				</div>
			</Section>

			<div className="w-full">
				<div className="mx-auto h-px max-w-6xl bg-linear-to-r from-transparent via-border/30 to-transparent" />
			</div>

			<Footer />

			<div className="w-full">
				<div className="mx-auto h-px max-w-6xl bg-linear-to-r from-transparent via-border/30 to-transparent" />
			</div>
		</div>
	);
}
