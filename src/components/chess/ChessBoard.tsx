'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, type Square } from 'chess.js';
import { Button } from '@/components/ui';
import type { BoardOrientation } from '@/types';

interface ChessBoardProps {
  position?: string;
  orientation?: BoardOrientation;
  interactive?: boolean;
  boardWidth?: number;
  onMove?: (move: { from: Square; to: Square; san: string }) => void;
  onPositionChange?: (fen: string) => void;
  showCoordinates?: boolean;
  lightSquareColor?: string;
  darkSquareColor?: string;
  showControls?: boolean;
  onFlipBoard?: () => void;
  onUndoMove?: () => void;
  onNewGame?: () => void;
  canUndo?: boolean;
}

export function ChessBoard({
  position,
  orientation = 'white',
  interactive = true,
  boardWidth = 480,
  onMove,
  onPositionChange,
  showCoordinates = true,
  lightSquareColor = '#e8eaed',
  darkSquareColor = '#769656',
  showControls = true,
  onFlipBoard,
  onUndoMove,
  onNewGame,
  canUndo = false,
}: ChessBoardProps) {
  const [game, setGame] = useState(() => {
    const chess = new Chess();
    if (position) {
      try {
        chess.load(position);
      } catch {
        console.error('Invalid FEN position provided');
      }
    }
    return chess;
  });

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveSquares, setMoveSquares] = useState<Record<string, React.CSSProperties>>({});

  const lastSyncedPosition = useRef<string | undefined>(position);

  useEffect(() => {
    if (position && position !== lastSyncedPosition.current) {
      try {
        const newGame = new Chess();
        newGame.load(position);
        // Only update if position actually differs from current game state
        if (newGame.fen() !== game.fen()) {
          // Use setTimeout to schedule update outside the effect
          const timeoutId = setTimeout(() => {
            setGame(newGame);
            setSelectedSquare(null);
            setMoveSquares({});
          }, 0);
          lastSyncedPosition.current = position;
          return () => clearTimeout(timeoutId);
        }
        lastSyncedPosition.current = position;
      } catch {
        // Invalid FEN, ignore
      }
    }
  }, [position, game]);

  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare, verbose: true });
  }, [game, selectedSquare]);

  const getMoveSquareStyles = useCallback((): Record<string, React.CSSProperties> => {
    const styles: Record<string, React.CSSProperties> = {};
    
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    }

    legalMoves.forEach((move) => {
      styles[move.to] = {
        backgroundColor: game.get(move.to as Square)
          ? 'rgba(255, 0, 0, 0.4)' 
          : 'rgba(0, 255, 0, 0.3)', 
      };
    });

    return { ...styles, ...moveSquares };
  }, [selectedSquare, legalMoves, game, moveSquares]);

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
      if (!interactive || !targetSquare) return false;

      try {
        const newGame = new Chess(game.fen());
        const move = newGame.move({
          from: sourceSquare as Square,
          to: targetSquare as Square,
          promotion: 'q',
        });

        if (move === null) return false;

        const newFen = newGame.fen();
        
        lastSyncedPosition.current = newFen;

        setGame(newGame);
        setSelectedSquare(null);
        setMoveSquares({
          [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
          [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
        });

        onMove?.({ from: sourceSquare as Square, to: targetSquare as Square, san: move.san });
        onPositionChange?.(newFen);

        return true;
      } catch {
        return false;
      }
    },
    [game, interactive, onMove, onPositionChange]
  );

  const handleSquareClick = useCallback(
    ({ square }: { piece: { pieceType: string } | null; square: string }) => {
      if (!interactive) return;
      const sq = square as Square;

      if (selectedSquare) {
        try {
          const newGame = new Chess(game.fen());
          const move = newGame.move({
            from: selectedSquare,
            to: sq,
            promotion: 'q',
          });

          if (move) {
            const newFen = newGame.fen();
            
            lastSyncedPosition.current = newFen;
            
            setGame(newGame);
            setSelectedSquare(null);
            setMoveSquares({
              [selectedSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
              [sq]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
            });
            onMove?.({ from: selectedSquare, to: sq, san: move.san });
            onPositionChange?.(newFen);
            return;
          }
        } catch {
          // Invalid move, continue to select logic
        }
        
        const piece = game.get(sq);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(sq);
        } else {
          setSelectedSquare(null);
        }
      } else {
        const piece = game.get(sq);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(sq);
        }
      }
    },
    [selectedSquare, game, interactive, onMove, onPositionChange]
  );

  const gameStatus = useMemo(() => {
    if (game.isCheckmate()) {
      return {
        text: `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`,
        color: 'bg-red-600 text-white',
      };
    }
    if (game.isDraw()) {
      let text = "It's a draw!";
      if (game.isStalemate()) text = "Stalemate - It's a draw!";
      if (game.isThreefoldRepetition()) text = 'Threefold repetition - Draw!';
      if (game.isInsufficientMaterial()) text = 'Insufficient material - Draw!';
      return {
        text,
        color: 'bg-surface-2 text-foreground',
      };
    }
    if (game.isCheck()) {
      return {
        text: `${game.turn() === 'w' ? 'White' : 'Black'} is in check!`,
        color: 'bg-yellow-400 text-black',
      };
    }
    return {
      text: `${game.turn() === 'w' ? 'White' : 'Black'} to move`,
      color: 'bg-surface-2 text-foreground',
    };
  }, [game]);

  const actualBoardWidth = Math.min(boardWidth, typeof window !== 'undefined' ? window.innerWidth - 32 : boardWidth);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl shadow-md border border-border-default transition-colors duration-300 ${gameStatus.color}`}
        style={{ minWidth: '180px', textAlign: 'center', fontSize: '1rem', letterSpacing: '0.02em', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        aria-live="polite"
      >
        <span className="text-xl" aria-hidden="true">{gameStatus.text.includes('White') ? '♔' : gameStatus.text.includes('Black') ? '♚' : '♟'}</span>
        <span className="font-medium tracking-wide" style={{ flex: 1 }}>{gameStatus.text}</span>
      </div>

      <div className="rounded-lg overflow-hidden shadow-2xl" style={{ width: actualBoardWidth, height: actualBoardWidth }}>
        <Chessboard
          options={{
            position: game.fen(),
            boardOrientation: orientation,
            allowDragging: interactive,
            showNotation: showCoordinates,
            lightSquareStyle: { backgroundColor: lightSquareColor },
            darkSquareStyle: { backgroundColor: darkSquareColor },
            boardStyle: {
              borderRadius: '8px',
            },
            lightSquareNotationStyle: {
              fontSize: '16px',
              fontWeight: '700',
              color: '#ef4444',
            },
            darkSquareNotationStyle: {
              fontSize: '16px',
              fontWeight: '700',
              color: '#ef4444',
            },
            squareStyles: getMoveSquareStyles(),
            onPieceDrop: handlePieceDrop,
            onSquareClick: handleSquareClick,
          }}
        />
      </div>

      {interactive && showControls && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onFlipBoard && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onFlipBoard}
              aria-label="Flip board orientation"
            >
              <FlipIcon className="w-4 h-4" aria-hidden="true" />
              Flip Board
            </Button>
          )}
          {onUndoMove && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onUndoMove}
              disabled={!canUndo}
              aria-label="Undo last move"
            >
              <UndoIcon className="w-4 h-4" aria-hidden="true" />
              Undo
            </Button>
          )}
          {onNewGame && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNewGame}
              aria-label="Start a new game"
            >
              <ResetIcon className="w-4 h-4" aria-hidden="true" />
              New Game
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function FlipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  );
}

function UndoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
      />
    </svg>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
