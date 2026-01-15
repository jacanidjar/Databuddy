import { LlmErrorsTab } from "../_components/llm-errors-tab";
import { LlmTabPageWrapper } from "../_components/llm-tab-page-wrapper";

export default function LlmErrorsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<LlmTabPageWrapper params={params}>
			{(websiteId, dateRange) => (
				<LlmErrorsTab dateRange={dateRange} websiteId={websiteId} />
			)}
		</LlmTabPageWrapper>
	);
}
