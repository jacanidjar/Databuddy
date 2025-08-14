export interface Sponsor {
	id: string;
	name: string;
	logo: string;
	website: string;
	tier: 'platinum' | 'gold' | 'silver' | 'bronze';
	description?: string;
	disabled?: boolean;
}

// Sample sponsors data - replace with real data
export const sponsors: Sponsor[] = [
	{
		id: 'neon',
		name: 'Neon',
		logo: 'neon.svg',
		website: 'https://neon.tech',
		tier: 'bronze',
		description: 'Neon is a modern database for the cloud era.',
	},
	{
		id: 'upstash',
		name: 'Upstash',
		logo: 'upstash.svg',
		website: 'https://upstash.com',
		tier: 'silver',
		description: 'Modern Serverless Data Platform for Developers',
		disabled: true,
	},
];

// Calculate sponsor statistics
export const sponsorStats = {
	totalSponsors: sponsors.length,
	featuredSponsors: sponsors.filter(
		(s) => s.tier === 'platinum' || s.tier === 'gold'
	).length,
};
