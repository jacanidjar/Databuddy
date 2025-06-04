"use client";

import React, { useState } from "react";
import { Bot, User, BarChart3, LineChart, PieChart, ChevronDown, ChevronRight, Bug, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "../types/message";

interface MessageBubbleProps {
  message: Message;
}

const getChartIcon = (chartType: string) => {
  switch (chartType) {
    case 'bar': return <BarChart3 className="h-4 w-4" />;
    case 'line': return <LineChart className="h-4 w-4" />;
    case 'pie': return <PieChart className="h-4 w-4" />;
    default: return <BarChart3 className="h-4 w-4" />;
  }
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const [showThinking, setShowThinking] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  return (
    <div
      className={cn(
        "flex gap-3 max-w-[90%] animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        message.type === 'user' ? "ml-auto flex-row-reverse" : ""
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
        message.type === 'user' 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted border"
      )}>
        {message.type === 'user' ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      
      {/* Message Content */}
      <div className={cn(
        "rounded px-4 py-3 max-w-full shadow-sm",
        message.type === 'user'
          ? "bg-primary text-primary-foreground ml-2"
          : "bg-muted/70 mr-2 border"
      )}>
        {/* Main message text */}
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
        
        {/* Thinking Steps */}
        {message.thinkingSteps && message.thinkingSteps.length > 0 && message.type === 'assistant' && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <button
              type="button"
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showThinking ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <Clock className="h-3 w-3" />
              <span>Thinking process ({message.thinkingSteps.length} steps)</span>
            </button>
            
            {showThinking && (
              <div className="mt-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
                {message.thinkingSteps.map((step, index) => (
                  <div key={`thinking-${index}-${step.slice(0, 20)}`} className="text-xs text-muted-foreground pl-5 py-1">
                    {step}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Visualization Indicator */}
        {message.hasVisualization && message.type === 'assistant' && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {getChartIcon(message.chartType || 'bar')}
              <span>Visualization available in the data panel →</span>
            </div>
          </div>
        )}
        
        {/* Debug Information */}
        {message.debugInfo && message.type === 'assistant' && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDebug ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              <Bug className="h-3 w-3" />
              <span>Debug info</span>
            </button>
            
            {showDebug && (
              <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                <pre className="text-xs bg-background/50 rounded p-2 overflow-x-auto border">
                  {JSON.stringify(message.debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        <div className="text-xs opacity-60 mt-3 font-mono">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
} 