/**
 * AI Chat Panel Component
 * 
 * Displays AI chess commentary in a chat-like interface.
 * Shows friendly, educational commentary every 5 moves.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

interface AIChatPanelProps {
  /** Array of chat messages to display */
  messages: ChatMessage[];
  /** Whether AI is generating a response */
  isLoading?: boolean;
  /** Error message if something went wrong */
  error?: string | null;
  /** Additional CSS classes */
  className?: string;
}

export function AIChatPanel({
  messages,
  isLoading = false,
  error = null,
  className,
}: AIChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <Card variant="bordered" className={cn('flex flex-col h-full', className)}>
      <CardContent className="flex flex-col h-full p-0">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b border-border-default">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">checkmAIte</h3>
            <p className="text-xs text-foreground/50">Your chess companion</p>
          </div>
        </div>

        {/* Messages container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[550px]"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {/* Loading indicator */}
          {isLoading && <TypingIndicator />}
          
          {/* Error message */}
          {error && (
            <div className="text-xs text-accent-danger bg-accent-danger/10 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-default bg-surface-2/50">
          <p className="text-xs text-foreground/40 text-center">
            AI commentary every 5 moves
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Message Bubble Component
// ============================================

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  
  return (
    <div className={cn(
      'flex flex-col',
      isAssistant ? 'items-start' : 'items-end'
    )}>
      <div className={cn(
        'max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isAssistant 
          ? 'bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 text-foreground rounded-tl-sm' 
          : 'bg-surface-2 text-foreground rounded-tr-sm'
      )}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      
      {/* Timestamp and model info */}
      <div className="flex items-center gap-2 mt-1 px-1">
        <span className="text-[10px] text-foreground/30">
          <ClientTimestamp date={message.timestamp} />
        </span>
        {isAssistant && message.model && message.model !== 'welcome' && message.model !== 'fallback' && (
          <span className="text-[10px] text-foreground/20">
            via {formatModelName(message.model)}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Typing Indicator Component
// ============================================

function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-accent-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-accent-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-accent-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Client-only Timestamp Component
// ============================================

function ClientTimestamp({ date }: { date: Date }) {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    // Only format time on client to avoid hydration mismatch
    setTimeString(
      new Date(date).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    );
  }, [date]);

  // Return empty during SSR, formatted time on client
  return <>{timeString}</>;
}

// ============================================
// Helper Functions
// ============================================

function formatModelName(model: string): string {
  // Shorten model names for display
  if (model.includes('llama')) return 'Llama';
  if (model.includes('gemma')) return 'Gemma';
  return model.split('-')[0];
}
