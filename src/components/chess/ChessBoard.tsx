'use client';

import { useState, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, type Square } from 'chess.js';
import type { BoardOrientation } from '@/types';

interface ChessBoardProps {
  /** Initial FEN position (defaults to starting position) */
  position?: string;
  /** Board orientation - 'white' or 'black' */
  orientation?: BoardOrientation;
  /** Whether the board is interactive */
  interactive?: boolean;
  /** Board width in pixels */
  boardWidth?: number;
  /** Callback when a move is made */
  onMove?: (move: { from: Square; to: Square; san: string }) => void;
  /** Callback when position changes */
  onPositionChange?: (fen: string) => void;
  /** Show board coordinates */
  showCoordinates?: boolean;
  /** Custom light square color */
  lightSquareColor?: string;
  /** Custom dark square color */
  darkSquareColor?: string;
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
}: ChessBoardProps) {
  // Initialize chess instance with provided position or default
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

  // Track selected square for highlighting
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveSquares, setMoveSquares] = useState<Record<string, React.CSSProperties>>({});

  // Calculate legal moves for selected piece
  const legalMoves = useMemo(() => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare, verbose: true });
  }, [game, selectedSquare]);

  // Highlight legal move squares
  const getMoveSquareStyles = useCallback((): Record<string, React.CSSProperties> => {
    const styles: Record<string, React.CSSProperties> = {};
    
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    }

    legalMoves.forEach((move) => {
      styles[move.to] = {
        backgroundColor: game.get(move.to as Square)
          ? 'rgba(255, 0, 0, 0.4)' // Capture square
          : 'rgba(0, 255, 0, 0.3)', // Empty square
      };
    });

    return { ...styles, ...moveSquares };
  }, [selectedSquare, legalMoves, game, moveSquares]);

  // Handle piece drop (drag and drop move)
  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
      if (!interactive || !targetSquare) return false;

      try {
        const move = game.move({
          from: sourceSquare as Square,
          to: targetSquare as Square,
          promotion: 'q', // Always promote to queen for simplicity
        });

        if (move === null) return false;

        // Update game state
        setGame(new Chess(game.fen()));
        setSelectedSquare(null);
        setMoveSquares({
          [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
          [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
        });

        // Notify parent components
        onMove?.({ from: sourceSquare as Square, to: targetSquare as Square, san: move.san });
        onPositionChange?.(game.fen());

        return true;
      } catch {
        return false;
      }
    },
    [game, interactive, onMove, onPositionChange]
  );

  // Handle square click
  const handleSquareClick = useCallback(
    ({ square }: { piece: { pieceType: string } | null; square: string }) => {
      if (!interactive) return;
      const sq = square as Square;

      // If a piece is already selected, try to move
      if (selectedSquare) {
        try {
          const move = game.move({
            from: selectedSquare,
            to: sq,
            promotion: 'q',
          });

          if (move) {
            setGame(new Chess(game.fen()));
            setSelectedSquare(null);
            setMoveSquares({
              [selectedSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
              [sq]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
            });
            onMove?.({ from: selectedSquare, to: sq, san: move.san });
            onPositionChange?.(game.fen());
            return;
          }
        } catch {
          // Invalid move, continue to select logic
        }
        
        // If move failed, select the new square if it has a piece
        const piece = game.get(sq);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(sq);
        } else {
          setSelectedSquare(null);
        }
      } else {
        // Select the square if it has a piece of the current turn's color
        const piece = game.get(sq);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(sq);
        }
      }
    },
    [selectedSquare, game, interactive, onMove, onPositionChange]
  );

  // Check game status
  const gameStatus = useMemo(() => {
    if (game.isCheckmate()) {
      return `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
    }
    if (game.isDraw()) {
      if (game.isStalemate()) return "Stalemate - It's a draw!";
      if (game.isThreefoldRepetition()) return 'Threefold repetition - Draw!';
      if (game.isInsufficientMaterial()) return 'Insufficient material - Draw!';
      return "It's a draw!";
    }
    if (game.isCheck()) {
      return `${game.turn() === 'w' ? 'White' : 'Black'} is in check!`;
    }
    return `${game.turn() === 'w' ? 'White' : 'Black'} to move`;
  }, [game]);

  // Calculate board width based on container
  const actualBoardWidth = Math.min(boardWidth, typeof window !== 'undefined' ? window.innerWidth - 32 : boardWidth);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status indicator */}
      <div className="text-sm font-medium text-foreground/80">{gameStatus}</div>

      {/* Chess board */}
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
            squareStyles: getMoveSquareStyles(),
            onPieceDrop: handlePieceDrop,
            onSquareClick: handleSquareClick,
          }}
        />
      </div>

      {/* Controls */}
      {interactive && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              game.undo();
              setGame(new Chess(game.fen()));
              setSelectedSquare(null);
              setMoveSquares({});
              onPositionChange?.(game.fen());
            }}
            className="px-3 py-1.5 text-sm bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors"
            disabled={game.history().length === 0}
          >
            Undo
          </button>
          <button
            onClick={() => {
              const newGame = new Chess();
              setGame(newGame);
              setSelectedSquare(null);
              setMoveSquares({});
              onPositionChange?.(newGame.fen());
            }}
            className="px-3 py-1.5 text-sm bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
