import { useState, useCallback, useRef, useEffect } from "react";
import type { Message } from "../types/message";

// StreamingUpdate interface to match API
interface StreamingUpdate {
  type: 'thinking' | 'progress' | 'complete' | 'error';
  content: string;
  data?: any;
  debugInfo?: Record<string, any>;
}

function generateWelcomeMessage(websiteName?: string): string {
  const examples = [
    "Show me page views over the last 7 days",
    "What are my top traffic sources?", 
    "Which pages have the highest bounce rate?",
    "How is my mobile vs desktop traffic?",
    "Show me traffic by country",
    "What's my average page load time?"
  ];

  return `Hello! I'm your analytics AI assistant for ${websiteName || 'your website'}. I can help you understand your data and create visualizations. Try asking me questions like:\n\n${examples.map((prompt: string) => `• "${prompt}"`).join('\n')}`;
}

export function useChat(websiteId: string, websiteName?: string) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: generateWelcomeMessage(websiteName), 
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 50);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to scroll on message content changes
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const sendMessage = useCallback(async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      type: 'assistant',
      content: "",
      timestamp: new Date(),
      hasVisualization: false,
      thinkingSteps: [],
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Stream the AI response using the new single endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Website-Id': websiteId,
        },
        credentials: 'include',
        body: JSON.stringify({
          message: messageContent,
          website_id: websiteId,
          context: { previousMessages: messages }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const update: StreamingUpdate = JSON.parse(line.slice(6));
                
                if (update.type === 'thinking') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantId 
                      ? { 
                          ...msg, 
                          thinkingSteps: [...(msg.thinkingSteps || []), update.content]
                        }
                      : msg
                  ));
                } else if (update.type === 'progress') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantId 
                      ? { 
                          ...msg, 
                          content: update.content,
                          hasVisualization: update.data?.hasVisualization || false,
                          chartType: update.data?.chartType,
                          data: update.data?.queryData || update.data?.data,
                        }
                      : msg
                  ));
                  scrollToBottom();
                } else if (update.type === 'complete') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantId 
                      ? { 
                          ...msg, 
                          content: update.content,
                          hasVisualization: update.data?.hasVisualization || false,
                          chartType: update.data?.chartType,
                          data: update.data?.data,
                          debugInfo: update.debugInfo,
                        }
                      : msg
                  ));
                  scrollToBottom();
                  break;
                } else if (update.type === 'error') {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantId 
                      ? { 
                          ...msg, 
                          content: update.content,
                          debugInfo: update.debugInfo,
                        }
                      : msg
                  ));
                  break;
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', line);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantId 
          ? { 
              ...msg, 
              content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, websiteId, messages, scrollToBottom]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: generateWelcomeMessage(websiteName),
        timestamp: new Date(),
      }
    ]);
    setInputValue("");
  }, [websiteName]);

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    scrollAreaRef,
    sendMessage,
    handleKeyPress,
    resetChat,
  };
} 