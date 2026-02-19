/**
 * Play vs Bot Board Component
 * 
 * Interactive chess board for playing against the bot.
 * Only allows moves when it's the player's turn.
 */

'use client';

import { ChessBoard } from '@/components/chess';
import { usePlay } from './PlayContext';
import { cn } from '@/lib/utils';
import type { Square } from 'chess.js';

interface PlayBoardProps {
  className?: string;
}

export function PlayBoard({ className }: PlayBoardProps) {
  const {
    fen,
    playerColor,
    isPlayerTurn,
    isBotThinking,
    gameResult,
    makePlayerMove,
  } = usePlay();

  // Handle move from the chess board
  const handleMove = (move: { from: Square; to: Square; san: string }) => {
    // Note: Promotions are handled internally by ChessBoard
    makePlayerMove(move.from, move.to);
  };

  // Board is interactive only when it's player's turn and game is ongoing
  const isInteractive = isPlayerTurn && gameResult.type === 'ongoing';

  return (
    <div className={cn('relative', className)}>
      {/* Chess Board */}
      <ChessBoard
        position={fen}
        orientation={playerColor}
        interactive={isInteractive}
        onMove={handleMove}
        showControls={false}
      />
      
      {/* Bot Thinking Overlay */}
      {isBotThinking && (
        <BotThinkingOverlay />
      )}
    </div>
  );
}

// ============================================
// Bot Thinking Overlay
// ============================================

function BotThinkingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-lg pointer-events-none">
      <div className="bg-surface-1 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-medium text-foreground/90">Bot is thinking...</span>
      </div>
    </div>
  );
}
