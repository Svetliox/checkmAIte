'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/components/chess';
import { useChessTheme } from '@/hooks';
import type { BoardOrientation } from '@/types';
import { useAnalysis } from './AnalysisContext';

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

  const { colors } = useChessTheme();
  
  const chessRef = useRef(new Chess());
  const previousEvalRef = useRef(0);

  useEffect(() => {
    if (analysis) {
      previousEvalRef.current = analysis.evaluation;
    }
  }, [analysis]);

  useEffect(() => {
    try {
      const newChess = new Chess();
      newChess.load(currentFen);
      if (newChess.fen() !== chessRef.current.fen()) {
        chessRef.current = newChess;
      }
    } catch {
    }
  }, [currentFen]);

  const handleMove = useCallback(
    (move: { from: string; to: string; san: string }) => {
      const wasWhite = chessRef.current.turn() === 'w';
      
      try {
        chessRef.current.move(move.san);
      } catch {
      }
      
      const newFen = chessRef.current.fen();
      
      setTimeout(() => {
        const evalAfter = analysis?.evaluation || 0;
        addMove(move.san, evalAfter, wasWhite);
      }, 500);
      
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
        lightSquareColor={colors.lightSquare}
        darkSquareColor={colors.darkSquare}
        onNewGame={handleNewGame}
        canUndo={moveHistory.length > 0}
      />

      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
          Analyzing…
        </div>
      )}

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
