import { useCustomer, usePricingTable } from 'autumn-js/react';

export type FeatureUsage = {
	id: string;
	name: string;
	used: number;
	limit: number;
	unlimited: boolean;
	nextReset: string | null;
	interval: string | null;
};

export type Usage = {
	features: FeatureUsage[];
};

export const useBillingData = () => {
	const {
		customer,
		isLoading: isCustomerLoading,
		refetch: refetchCustomer,
	} = useCustomer({
		expand: ['invoices'],
	});

	const {
		products,
		isLoading: isPricingLoading,
		refetch: refetchPricing,
	} = usePricingTable();

	const isLoading = isCustomerLoading || isPricingLoading;

	const refetch = () => {
		refetchCustomer();
		if (typeof refetchPricing === 'function') {
			refetchPricing();
		}
	};

	const usage: Usage = {
		features: customer
			? Object.values(customer.features).map((feature) => ({
					id: feature.id,
					name: feature.name,
					used: feature.usage || 0,
					limit: feature.unlimited
						? Number.POSITIVE_INFINITY
						: feature.included_usage || 0,
					unlimited: !!feature.unlimited,
					nextReset: feature.next_reset_at
						? new Date(feature.next_reset_at).toLocaleDateString()
						: null,
					interval: feature.interval || null,
				}))
			: [],
	};

	return {
		products: products || [],
		usage,
		customer,
		isLoading,
		refetch,
	};
};
