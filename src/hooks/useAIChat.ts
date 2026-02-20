

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, AIChatRequest, AIChatResponse, ApiResponse } from '@/types';
import { getWelcomeMessage, getGamePhase } from '@/lib/chess/promptBuilder';

 
interface UseAIChatOptions {
  gameMode: 'analysis' | 'vsBot';
  triggerInterval?: number;
}

 
interface UseAIChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  triggerCommentary: (fen: string, moveHistory: string[]) => Promise<void>;
  resetChat: () => void;
  lastTriggeredMoveCount: number;
  shouldTrigger: (moveCount: number) => boolean;
}

 
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

 
export function useAIChat(options: UseAIChatOptions): UseAIChatReturn {
  const { gameMode, triggerInterval = 5 } = options;
  
  // Start with empty messages to avoid hydration mismatch
  // Welcome message is added client-side in useEffect
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTriggeredMoveCount, setLastTriggeredMoveCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  
  const pendingRequest = useRef(false);

  
  useEffect(() => {
    if (!isInitialized) {
      setMessages([{
        id: generateMessageId(),
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date(),
        model: 'welcome',
      }]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  
  const createWelcomeMessage = useCallback((): ChatMessage => ({
    id: generateMessageId(),
    role: 'assistant',
    content: getWelcomeMessage(),
    timestamp: new Date(),
    model: 'welcome',
  }), []);

  
  const shouldTrigger = useCallback((moveCount: number): boolean => {
    // Trigger every `triggerInterval` moves, but not at 0
    if (moveCount === 0) return false;
    if (moveCount % triggerInterval !== 0) return false;
    if (moveCount <= lastTriggeredMoveCount) return false;
    return true;
  }, [triggerInterval, lastTriggeredMoveCount]);

  
  const triggerCommentary = useCallback(async (
    fen: string,
    moveHistory: string[]
  ): Promise<void> => {
    const moveCount = moveHistory.length;
    
    // Prevent duplicate requests
    if (pendingRequest.current) return;
    if (!shouldTrigger(moveCount)) return;
    
    pendingRequest.current = true;
    setIsLoading(true);
    setError(null);
    setLastTriggeredMoveCount(moveCount);

    try {
      const requestBody: AIChatRequest = {
        fen,
        moveHistory,
        moveNumber: Math.floor(moveCount / 2) + 1,
        gamePhase: getGamePhase(fen, moveCount),
        gameMode,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: ApiResponse<AIChatResponse> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.data.message,
        timestamp: new Date(),
        model: data.data.model,
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('[useAIChat] Error:', errorMessage);
    } finally {
      setIsLoading(false);
      pendingRequest.current = false;
    }
  }, [gameMode, shouldTrigger]);

  
  const resetChat = useCallback((): void => {
    setMessages([createWelcomeMessage()]);
    setError(null);
    setIsLoading(false);
    setLastTriggeredMoveCount(0);
    pendingRequest.current = false;
  }, [createWelcomeMessage]);

  return {
    messages,
    isLoading,
    error,
    triggerCommentary,
    resetChat,
    lastTriggeredMoveCount,
    shouldTrigger,
  };
}
