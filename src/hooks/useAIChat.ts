/**
 * useAIChat Hook
 * 
 * Manages AI chat state and triggers commentary requests.
 * Used by both Analysis and Play modes for chess position commentary.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, AIChatRequest, AIChatResponse, ApiResponse } from '@/types';
import { getWelcomeMessage, getGamePhase } from '@/lib/chess/promptBuilder';

/** Hook configuration options */
interface UseAIChatOptions {
  /** Game mode: 'analysis' or 'vsBot' */
  gameMode: 'analysis' | 'vsBot';
  /** Number of half-moves between AI commentary (default: 5) */
  triggerInterval?: number;
}

/** Hook return type */
interface UseAIChatReturn {
  /** Array of chat messages */
  messages: ChatMessage[];
  /** Whether AI is currently generating a response */
  isLoading: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Trigger AI commentary for the current position */
  triggerCommentary: (fen: string, moveHistory: string[]) => Promise<void>;
  /** Reset chat to initial state with welcome message */
  resetChat: () => void;
  /** Last move count that triggered commentary */
  lastTriggeredMoveCount: number;
  /** Check if commentary should be triggered based on move count */
  shouldTrigger: (moveCount: number) => boolean;
}

/**
 * Generate a unique ID for chat messages
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Custom hook for AI chess commentary
 */
export function useAIChat(options: UseAIChatOptions): UseAIChatReturn {
  const { gameMode, triggerInterval = 5 } = options;
  
  // Start with empty messages to avoid hydration mismatch
  // Welcome message is added client-side in useEffect
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTriggeredMoveCount, setLastTriggeredMoveCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref to prevent duplicate requests
  const pendingRequest = useRef(false);

  // Add welcome message on client mount to avoid hydration mismatch
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

  // Helper to create initial welcome message
  const createWelcomeMessage = useCallback((): ChatMessage => ({
    id: generateMessageId(),
    role: 'assistant',
    content: getWelcomeMessage(),
    timestamp: new Date(),
    model: 'welcome',
  }), []);

  /**
   * Check if commentary should be triggered based on move count
   */
  const shouldTrigger = useCallback((moveCount: number): boolean => {
    // Trigger every `triggerInterval` moves, but not at 0
    if (moveCount === 0) return false;
    if (moveCount % triggerInterval !== 0) return false;
    if (moveCount <= lastTriggeredMoveCount) return false;
    return true;
  }, [triggerInterval, lastTriggeredMoveCount]);

  /**
   * Trigger AI commentary for the current position
   */
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

  /**
   * Reset chat to initial state with welcome message
   */
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
