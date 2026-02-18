'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/chess';
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
    undoLastMove,
    resetGame,
    currentFen,
  } = useAnalysis();
  
  const chessRef = useRef(new Chess());
  const previousEvalRef = useRef(0);

  // Track evaluation for cp loss calculation
  useEffect(() => {
    if (analysis) {
      previousEvalRef.current = analysis.evaluation;
    }
  }, [analysis]);

  // Sync chessRef when position changes externally (undo/reset)
  useEffect(() => {
    try {
      const newChess = new Chess();
      newChess.load(currentFen);
      if (newChess.fen() !== chessRef.current.fen()) {
        chessRef.current = newChess;
      }
    } catch {
      // Invalid FEN, ignore
    }
  }, [currentFen]);

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
    setFen(fen);
  }, [setFen]);

  const flipBoard = useCallback(() => {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  }, []);

  const handleUndo = useCallback(() => {
    undoLastMove();
  }, [undoLastMove]);

  const handleNewGame = useCallback(() => {
    chessRef.current = new Chess();
    previousEvalRef.current = 0;
    resetGame();
  }, [resetGame]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Board with unified controls */}
      <ChessBoard
        position={currentFen}
        orientation={orientation}
        interactive={true}
        boardWidth={520}
        onMove={handleMove}
        onPositionChange={handlePositionChange}
        showCoordinates={true}
        showControls={true}
        onFlipBoard={flipBoard}
        onUndoMove={handleUndo}
        onNewGame={handleNewGame}
        canUndo={moveHistory.length > 0}
      />

      {/* Engine status indicator */}
      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
          Analyzing…
        </div>
      )}

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
