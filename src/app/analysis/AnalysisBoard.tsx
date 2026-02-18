'use client';

import { useState, useCallback } from 'react';
import { ChessBoard } from '@/components/chess';
import { Button } from '@/components/ui';
import type { BoardOrientation } from '@/types';

/**
 * Analysis Board Client Component
 * 
 * This is a client component that handles the interactive chess board
 * and analysis state. It will integrate with the Stockfish engine
 * when that feature is implemented.
 */
export function AnalysisBoard() {
  const [orientation, setOrientation] = useState<BoardOrientation>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentFen, setCurrentFen] = useState<string>(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );

  const handleMove = useCallback(
    (move: { from: string; to: string; san: string }) => {
      setMoveHistory((prev) => [...prev, move.san]);
      // TODO: Trigger Stockfish analysis here
      console.log('[Analysis] Move made:', move.san);
    },
    []
  );

  const handlePositionChange = useCallback((fen: string) => {
    setCurrentFen(fen);
    // TODO: Update analysis when position changes
  }, []);

  const flipBoard = useCallback(() => {
    setOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  }, []);

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

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={flipBoard}>
          <FlipIcon className="w-4 h-4 mr-2" />
          Flip Board
        </Button>
        {/* ...existing code... */}
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

function ImportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}
