import { LlmCostTab } from "../_components/llm-cost-tab";
import { LlmTabPageWrapper } from "../_components/llm-tab-page-wrapper";

export default function LlmCostPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<LlmTabPageWrapper params={params}>
			{(websiteId, dateRange) => (
				<LlmCostTab dateRange={dateRange} websiteId={websiteId} />
			)}
		</LlmTabPageWrapper>
	);
}
