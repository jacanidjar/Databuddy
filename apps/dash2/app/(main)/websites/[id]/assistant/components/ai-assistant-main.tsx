"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { WebsiteDataTabProps } from "../../_components/utils/types";
import { useChat } from "../hooks/use-chat";
import type { Message } from "../types/message";
import ChatSection, { ChatSkeleton } from "./chat-section";
import VisualizationSection, { VisualizationSkeleton } from "./visualization-section";

// Lazy load chat and visualization components
const ChatSectionComponent = dynamic(
  () => import("./chat-section"),
  { 
    loading: () => <ChatSkeleton />,
    ssr: false 
  }
);

const VisualizationSectionComponent = dynamic(
  () => import("./visualization-section"),
  { 
    loading: () => <VisualizationSkeleton />,
    ssr: false 
  }
);

function ChatSkeletonComponent() {
  return (
    <div className="rounded-lg border bg-background shadow-sm flex flex-col h-full">
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="flex-1 p-4 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-16 w-3/4 rounded-lg" />
        </div>
        <div className="flex gap-3 ml-auto flex-row-reverse">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-10 w-1/2 rounded-lg" />
        </div>
      </div>
      <div className="p-4 border-t">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

function VisualizationSkeletonComponent() {
  return (
    <div className="rounded-lg border bg-background shadow-sm flex flex-col h-full">
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="flex-1 p-4">
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-7 w-14" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}

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
  // If no visualization, or no preceding user query found for it (should be rare),
  // we can fall back to the absolute latest user message if needed, or pass undefined.
  // For now, currentQueryMessage will be undefined if not specifically found before a visualization.

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