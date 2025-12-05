import { Provider as ChatProvider } from "@ai-sdk-tools/store";
import type { UIMessage } from "ai";
import { FeatureGate } from "@/components/feature-gate";
import { GATED_FEATURES } from "@/components/providers/billing-provider";
import { getServerRPCClient } from "@/lib/orpc-server";
import { AgentPageClient } from "../_components/agent-page-client";

type Props = {
	params: Promise<{ id: string; chatId: string }>;
};

export default async function AgentPage(props: Props) {
	const { id, chatId } = await props.params;

	const rpcClient = await getServerRPCClient();
	const chat = await rpcClient.agent.getMessages({ chatId, websiteId: id });

	return (
		// <FeatureGate feature={GATED_FEATURES.AI_AGENT}>
			<ChatProvider
				initialMessages={(chat?.messages ?? []) as UIMessage[]}
				key={`${id}-${chatId}`}
			>
				<AgentPageClient 
					chatId={chatId} 
					websiteId={id}
					initialMessages={(chat?.messages ?? []) as UIMessage[]}
				/>
			</ChatProvider>
		// </FeatureGate>
	);
}
