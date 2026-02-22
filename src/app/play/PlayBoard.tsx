'use client';

import { ChessBoard } from '@/components/chess';
import { usePlay } from './PlayContext';
import { useChessTheme } from '@/hooks';
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
    resetGame,
  } = usePlay();

  const { colors } = useChessTheme();

  const handleMove = (move: { from: Square; to: Square; san: string }) => {
    makePlayerMove(move.from, move.to);
  };

  const isInteractive = isPlayerTurn && gameResult.type === 'ongoing';

  let resultPanel: React.ReactNode = null;
  if (gameResult.type !== 'ongoing') {
    let title = '';
    let titleColor = 'text-foreground';
    if (gameResult.type === 'checkmate') {
      const playerWon = gameResult.winner === playerColor;
      title = playerWon ? 'You Win!' : 'You Lose!';
      if (playerWon) title = 'You Win!';
      titleColor = playerWon ? 'text-accent-success' : 'text-accent-danger';
    } else if (gameResult.type === 'draw') {
      title = 'Draw';
      titleColor = 'text-accent-warning';
    }
    resultPanel = (
      <div className="w-full flex flex-col items-center mt-4">
        <div className="rounded-xl border border-border-default bg-surface-1 px-6 py-4 shadow text-center max-w-xs">
          <div className={`text-xl font-bold mb-3 ${titleColor}`}>{title}</div>
          <div className="flex gap-3 justify-center mt-2">
            <button
              className="px-4 py-2 rounded-lg bg-accent-primary text-white font-semibold hover:bg-accent-primary/90 transition-colors"
              onClick={resetGame}
            >
              Play Again
            </button>
            <button
              className="px-4 py-2 rounded-lg border border-accent-primary text-accent-primary font-semibold hover:bg-accent-primary/10 transition-colors"
              onClick={() => window.location.href = '/play'}
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Chess Board */}
      <ChessBoard
        position={fen}
        orientation={playerColor}
        interactive={isInteractive}
        lightSquareColor={colors.lightSquare}
        darkSquareColor={colors.darkSquare}
        onMove={handleMove}
        showControls={false}
      />
      {/* Bot Thinking Overlay */}
      {isBotThinking && <BotThinkingOverlay />}
      {/* Result info below board */}
      {resultPanel}
    </div>
  );
}

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
