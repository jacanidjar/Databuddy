import { LlmAnalyticsContent } from "./_components/llm-analytics-content";

export default function LlmAnalyticsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return <LlmAnalyticsContent params={params} />;
}
