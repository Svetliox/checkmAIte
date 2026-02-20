/**
 * AI Chat Panel Component
 * 
 * Displays AI chess commentary in a chat-like interface.
 * Shows friendly, educational commentary every 5 moves.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, Button } from '@/components/ui';
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
  const { data: session } = useSession();
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Check if user has API key configured
  useEffect(() => {
    async function checkApiKey() {
      if (!session?.user) {
        setHasApiKey(false);
        return;
      }
      try {
        const response = await fetch('/api/user/api-keys?provider=groq');
        const data = await response.json();
        setHasApiKey(data.hasKey);
      } catch {
        setHasApiKey(false);
      }
    }
    checkApiKey();
  }, [session]);

  // Check if any message indicates API key is required
  const needsApiKey = messages.some(m => m.content === 'API_KEY_REQUIRED');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Filter out API_KEY_REQUIRED messages from display
  const displayMessages = messages.filter(m => m.content !== 'API_KEY_REQUIRED');

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

        {/* Activation Required Message */}
        {(needsApiKey || hasApiKey === false) && (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-300 font-medium mb-1">AI Chat Not Configured</p>
                <p className="text-xs text-amber-200/70 mb-3">
                  To activate AI-powered chess commentary, add your Groq API key in settings.
                </p>
                <Link href="/account/settings">
                  <Button size="sm" variant="secondary" className="text-xs">
                    Go to Account → Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Messages container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[550px]"
        >
          {displayMessages.map((message) => (
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
            {hasApiKey === false ? 'Configure API key to enable commentary' : 'AI commentary every 5 moves'}
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
  // Use lazy initializer to compute time only on client (returns empty on SSR)
  const [timeString] = useState<string>(() => {
    // Check if we're on the client
    if (typeof window === 'undefined') return '';
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  });

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
