'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/chess';
import { Button } from '@/components/ui';
import type { BoardOrientation } from '@/types';
import { useAnalysis } from './AnalysisContext';

/**
 * Analysis Board Client Component
 * 
 * This is a client component that handles the interactive chess board
 * and integrates with the Stockfish engine via AnalysisContext.
 */
export function AnalysisBoard() {
  const [orientation, setOrientation] = useState<BoardOrientation>('white');
  const { 
    setFen, 
    addMove, 
    moveHistory, 
    analysis,
    isAnalyzing,
    resetGame,
  } = useAnalysis();
  
  const chessRef = useRef(new Chess());
  const previousEvalRef = useRef(0);

  // Track evaluation for cp loss calculation
  useEffect(() => {
    if (analysis) {
      previousEvalRef.current = analysis.evaluation;
    }
  }, [analysis]);

  const handleMove = useCallback(
    (move: { from: string; to: string; san: string }) => {
      // Determine if it was white's move
      const wasWhite = chessRef.current.turn() === 'w';
      
      // Make the move on our tracked chess instance
      try {
        chessRef.current.move(move.san);
      } catch {
        // Move already applied by ChessBoard
      }
      
      // Get the new position
      const newFen = chessRef.current.fen();
      
      // After a brief delay to let engine analyze, record the move
      // The evaluation will be from the NEW position (opponent's perspective)
      setTimeout(() => {
        const evalAfter = analysis?.evaluation || 0;
        addMove(move.san, evalAfter, wasWhite);
      }, 500);
      
      // Update the FEN for analysis
      setFen(newFen);
    },
    [setFen, addMove, analysis]
  );

  const handlePositionChange = useCallback((fen: string) => {
    // Sync our chess instance
    try {
      chessRef.current.load(fen);
    } catch {
      // Invalid FEN, ignore
    }
    setFen(fen);
  }, [setFen]);

  const flipBoard = useCallback(() => {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  }, []);

  const handleReset = useCallback(() => {
    chessRef.current = new Chess();
    previousEvalRef.current = 0;
    resetGame();
  }, [resetGame]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Board */}
      <ChessBoard
        orientation={orientation}
        interactive={true}
        boardWidth={520}
        onMove={handleMove}
        onPositionChange={handlePositionChange}
        showCoordinates={true}
      />

      {/* Engine status indicator */}
      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
          Analyzing...
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={flipBoard}>
          <FlipIcon className="w-4 h-4 mr-2" />
          Flip Board
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <ResetIcon className="w-4 h-4 mr-2" />
          New Game
        </Button>
      </div>

      {/* Move history (simple display) */}
      {moveHistory.length > 0 && (
        <div className="w-full max-w-md">
          <div className="text-sm text-foreground/60 mb-2">Move History</div>
          <div className="p-3 rounded-lg bg-surface-2 font-mono text-sm overflow-x-auto whitespace-normal break-words" style={{ maxHeight: '120px' }}>
            {moveHistory.map((move, i) => (
              <span key={i} className="inline-block max-w-[80px] truncate align-top">
                {i % 2 === 0 && (
                  <span className="text-foreground/50 mr-1">
                    {Math.floor(i / 2) + 1}.
                  </span>
                )}
                <span className="mr-2">{move}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function FlipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
