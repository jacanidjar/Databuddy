import { LlmPerformanceTab } from "../_components/llm-performance-tab";
import { LlmTabPageWrapper } from "../_components/llm-tab-page-wrapper";

export default function LlmPerformancePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<LlmTabPageWrapper params={params}>
			{(websiteId, dateRange) => (
				<LlmPerformanceTab dateRange={dateRange} websiteId={websiteId} />
			)}
		</LlmTabPageWrapper>
	);
}
