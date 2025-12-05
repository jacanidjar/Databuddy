"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { useSetAtom } from "jotai";
import { agentMessagesAtom, agentStatusAtom } from "./agent-atoms";
import { AgentPageContent } from "./agent-page-content";

interface AgentPageClientProps {
	chatId: string;
	websiteId: string;
	initialMessages?: UIMessage[];
}

export function AgentPageClient({ 
	chatId, 
	websiteId,
	initialMessages = []
}: AgentPageClientProps) {
	const setMessages = useSetAtom(agentMessagesAtom);
	const setStatus = useSetAtom(agentStatusAtom);
	const prevChatIdRef = useRef<string | null>(null);

	useEffect(() => {
		const prevChatId = prevChatIdRef.current;
		if (prevChatId !== chatId && initialMessages.length > 0) {
			setMessages(initialMessages);
			setStatus("idle");
			prevChatIdRef.current = chatId;
		}
	}, [chatId, initialMessages, setMessages, setStatus]);

	return (
		<div className="relative flex h-full flex-col">
			<AgentPageContent chatId={chatId} websiteId={websiteId} />
		</div>
	);
}

