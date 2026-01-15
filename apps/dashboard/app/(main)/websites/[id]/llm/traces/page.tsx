import { LlmTabPageWrapper } from "../_components/llm-tab-page-wrapper";
import { LlmTracesTab } from "../_components/llm-traces-tab";

export default function LlmTracesPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<LlmTabPageWrapper params={params}>
			{(websiteId, dateRange) => (
				<LlmTracesTab dateRange={dateRange} websiteId={websiteId} />
			)}
		</LlmTabPageWrapper>
	);
}
