import { Provider as ChatProvider } from "@ai-sdk-tools/store";
import type { UIMessage } from "ai";
import { FeatureGate } from "@/components/feature-gate";
import { GATED_FEATURES } from "@/components/providers/billing-provider";
import { getServerRPCClient } from "@/lib/orpc-server";
import { AgentPageClient } from "./_components/agent-page-client";

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ chatId?: string }>;
};

export default async function AgentPage(props: Props) {
	const { id } = await props.params;
	const { chatId } = await props.searchParams;

	const rpcClient = await getServerRPCClient();
	const chat = chatId
		? await rpcClient.agent.getMessages({ chatId, websiteId: id })
		: null;

	return (
		// <FeatureGate feature={GATED_FEATURES.AI_AGENT}>
			<ChatProvider
				initialMessages={(chat?.messages ?? []) as UIMessage[]}
				key={chatId || "home"}
			>
				<AgentPageClient chatId={chatId ?? null} websiteId={id} />
			</ChatProvider>
		// </FeatureGate>
	);
}
