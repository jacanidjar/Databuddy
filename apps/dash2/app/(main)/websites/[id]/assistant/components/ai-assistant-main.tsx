"use client";

import React, { Suspense } from "react";
import type { WebsiteDataTabProps } from "../../_components/utils/types";
import { useChat } from "../hooks/use-chat";
import type { Message } from "../types/message";
import ChatSection, { ChatSkeleton } from "./chat-section";
import VisualizationSection, { VisualizationSkeleton } from "./visualization-section";

export default function AIAssistantMain(props: WebsiteDataTabProps) {
  const chat = useChat(props.websiteId, props.websiteData);
  
  const latestVisualizationMessage = chat.messages
    .slice()
    .reverse()
    .find((m: Message) => m.data && m.chartType && m.type === 'assistant');

  let currentQueryMessage: Message | undefined = undefined;
  if (latestVisualizationMessage) {
    const vizMessageIndex = chat.messages.findIndex(m => m.id === latestVisualizationMessage.id);
    if (vizMessageIndex > -1) {
      for (let i = vizMessageIndex - 1; i >= 0; i--) {
        if (chat.messages[i].type === 'user') {
          currentQueryMessage = chat.messages[i];
          break;
        }
      }
    }
  }
  
  return (
    // Use flex row for layout, allowing children to take available space
    <div className="flex flex-1 lg:flex-row flex-col gap-3 overflow-hidden">
      {/* Chat Section - takes 2/5th width on large screens */}
      <div className="flex-[2_2_0%] flex flex-col overflow-hidden">
        <Suspense fallback={<ChatSkeleton />}>
          <ChatSection 
            {...props} 
            messages={chat.messages}
            inputValue={chat.inputValue}
            setInputValue={chat.setInputValue}
            isLoading={chat.isLoading}
            scrollAreaRef={chat.scrollAreaRef}
            sendMessage={chat.sendMessage}
            handleKeyPress={chat.handleKeyPress}
            onResetChat={chat.resetChat}
          />
        </Suspense>
      </div>
      
      {/* Visualization Section - takes 3/5th width on large screens */}
      <div className="flex-[3_3_0%] flex flex-col overflow-hidden">
        <Suspense fallback={<VisualizationSkeleton />}>
          <VisualizationSection 
            {...props} 
            latestVisualization={latestVisualizationMessage}
            currentMessage={currentQueryMessage}
            onQuickInsight={chat.sendMessage}
          />
        </Suspense>
      </div>
    </div>
  );
} 