"use client";

import type React from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Sparkles, MessageSquare, RotateCcw, Zap } from "lucide-react";
import type { WebsiteDataTabProps } from "../../_components/utils/types";
import type { Message } from "../types/message";
import { MessageBubble } from "./message-bubble";
import { LoadingMessage } from "./loading-message";

interface ChatSectionProps extends WebsiteDataTabProps {
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: (content?: string) => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  onResetChat: () => void;
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background border rounded shadow-sm overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      {/* Messages Area Skeleton */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-16 w-3/4 rounded-lg" />
        </div>
        <div className="flex gap-2 ml-auto flex-row-reverse">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-10 w-1/2 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
      {/* Input Area Skeleton */}
      <div className="p-3 border-t bg-muted/20 flex-shrink-0">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-3 w-1/2 mt-2" />
      </div>
    </div>
  );
}

export default function ChatSection({ 
  websiteData, 
  websiteId, 
  messages,
  inputValue,
  setInputValue,
  isLoading,
  scrollAreaRef,
  sendMessage,
  handleKeyPress,
  onResetChat
}: ChatSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const quickQuestions = [
    "Show me page views over the last 7 days",
    "What are my top traffic sources?",
    "Mobile vs desktop breakdown"
  ];

  return (
    <div className="flex flex-col flex-1 bg-background border rounded shadow-sm overflow-hidden min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-lg truncate">AI Analytics Assistant</h2>
            <p className="text-sm text-muted-foreground truncate">
              Ask questions about your website analytics
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onResetChat}
          className="h-9 w-9 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
          title="Reset chat"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Messages Area - this should be the only scrollable part */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <ScrollArea ref={scrollAreaRef} className="h-full px-3">
          <div className="space-y-3 py-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoading && <LoadingMessage />}
            
            {messages.length <= 1 && !isLoading && (
              <div className="space-y-3 pt-4">
                <p className="text-xs text-muted-foreground text-center mb-2">Or try one of these:</p>
                {quickQuestions.map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto py-2 px-3 text-sm font-normal hover:bg-muted/50"
                    onClick={() => sendMessage(question)}
                    disabled={isLoading}
                  >
                    <Zap className="h-3 w-3 mr-2 flex-shrink-0" />
                    {question}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
        
      {/* Input Area */}
      <div className="p-3 border-t bg-muted/20 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your analytics data..."
            disabled={isLoading}
            className="flex-1 h-9"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 flex-shrink-0" />
          <span>Ask about trends, comparisons, or specific metrics</span>
        </div>
      </div>
    </div>
  );
} 