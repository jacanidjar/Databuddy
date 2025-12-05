"use client";

import { useChat, useChatActions } from "@ai-sdk-tools/store";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useAtom, useSetAtom } from "jotai";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { agentInputAtom, agentMessagesAtom, agentStatusAtom } from "../agent-atoms";
import { useAgentChatId } from "../agent-chat-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useAgentChat() {
    const chatId = useAgentChatId();
    const params = useParams();
    const websiteId = params.id as string;
    const routeChatId = params.chatId as string | undefined;
    const setInput = useSetAtom(agentInputAtom);

    // Use route chatId if available, otherwise fall back to context chatId
    const stableChatId = routeChatId ?? chatId;

    // Store stable chatId in ref to prevent useChat from resetting
    const stableChatIdRef = useRef<string>(stableChatId);
    if (stableChatIdRef.current !== stableChatId) {
        stableChatIdRef.current = stableChatId;
    }

    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: `${API_URL}/v1/agent/chat`,
                credentials: "include",
                prepareSendMessagesRequest({ messages, id }) {
                    const lastMessage = messages[messages.length - 1];
                    return {
                        body: {
                            id,
                            websiteId,
                            message: lastMessage,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        },
                    };
                },
            }),
        [websiteId]
    );

    // Use useChat from SDK but sync to Jotai for persistence
    const { messages: sdkMessages, status: sdkStatus } = useChat<UIMessage>({
        id: stableChatIdRef.current,
        transport,
    });

    // Sync SDK messages to Jotai atom for persistence
    const [jotaiMessages, setJotaiMessages] = useAtom(agentMessagesAtom);
    const [jotaiStatus, setJotaiStatus] = useAtom(agentStatusAtom);

    useEffect(() => {
        // Always sync SDK state to Jotai to ensure persistence
        if (sdkMessages.length > 0) {
            setJotaiMessages(sdkMessages);
        }
        setJotaiStatus(sdkStatus);
    }, [sdkMessages, sdkStatus, setJotaiMessages, setJotaiStatus]);

    // Use Jotai messages for display (they persist even if SDK resets)
    const messages = jotaiMessages.length > 0 ? jotaiMessages : sdkMessages;
    const status = jotaiStatus !== "idle" ? jotaiStatus : sdkStatus;

    const {
        sendMessage: sdkSendMessage,
        reset: sdkReset,
        stop: sdkStop,
    } = useChatActions();

    const lastUserMessageRef = useRef<string>("");

    const sendMessage = useCallback(
        (
            content: string,
            metadata?: { agentChoice?: string; toolChoice?: string }
        ) => {
            if (!content.trim()) return;

            lastUserMessageRef.current = content.trim();
            setInput("");

            sdkSendMessage({
                text: content.trim(),
                metadata,
            });
        },
        [sdkSendMessage, setInput]
    );

    const reset = useCallback(() => {
        sdkReset();
        setJotaiMessages([]);
        setJotaiStatus("idle");
        setInput("");
        lastUserMessageRef.current = "";
    }, [sdkReset, setJotaiMessages, setJotaiStatus, setInput]);

    const stop = useCallback(() => {
        sdkStop();
    }, [sdkStop]);

    // Retry by resending the last user message
    const retry = useCallback(() => {
        const lastUserMessage = lastUserMessageRef.current;
        if (!lastUserMessage) return;

        sdkSendMessage({
            text: lastUserMessage,
        });
    }, [sdkSendMessage]);

    const isLoading = status === "streaming" || status === "submitted";
    const hasError = status === "error";

    return {
        messages,
        status,
        isLoading,
        hasError,
        sendMessage,
        stop,
        reset,
        retry,
    };
}
