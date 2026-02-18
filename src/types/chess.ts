/**
 * Chess-related TypeScript type definitions
 * These types support the chess analysis features of checkmAIte
 */

import type { Square, PieceSymbol, Color } from 'chess.js';

/** Represents a chess position in FEN notation */
export type ChessPosition = string;

/** Represents a chess move */
export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
  san?: string; // Standard Algebraic Notation (e.g., "e4", "Nf3")
  lan?: string; // Long Algebraic Notation (e.g., "e2e4")
}

/** Represents a piece on the board */
export interface ChessPiece {
  type: PieceSymbol;
  color: Color;
  square: Square;
}

/** Analysis result from the chess engine */
export interface AnalysisResult {
  bestMove: ChessMove | null;
  evaluation: number; // Centipawn evaluation (+ for white advantage)
  depth: number; // Search depth
  pv: ChessMove[]; // Principal variation (best line)
  mate?: number; // Moves to mate (+ for white mates, - for black mates)
  nodes?: number; // Nodes searched
  time?: number; // Time spent in milliseconds
}

/** Statistics for a single game */
export interface GameStatistics {
  totalMoves: number;
  accuracy: {
    white: number;
    black: number;
  };
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  bestMoves: number;
  averageCentipawnLoss: {
    white: number;
    black: number;
  };
}

/** Move classification based on engine analysis */
export type MoveClassification =
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'book';

/** A move with its analysis */
export interface AnalyzedMove {
  move: ChessMove;
  position: ChessPosition;
  classification: MoveClassification;
  evaluation: number;
  bestMove: ChessMove | null;
  centipawnLoss: number;
}

/** Game history entry */
export interface GameHistoryEntry {
  moveNumber: number;
  whiteMove?: AnalyzedMove;
  blackMove?: AnalyzedMove;
}

/** Board orientation */
export type BoardOrientation = 'white' | 'black';

/** Engine status */
export type EngineStatus = 'idle' | 'loading' | 'ready' | 'analyzing' | 'error';

/** Engine configuration */
export interface EngineConfig {
  depth: number;
  multiPv: number; // Number of principal variations to calculate
  threads?: number;
  hashSize?: number; // Hash table size in MB
}

/** Multi-PV line from engine analysis */
export interface MultiPvLine {
  rank: number; // 1, 2, 3 for multiPv
  moves: string[]; // PV moves in UCI format (e.g., ["e2e4", "e7e5"])
  sanMoves: string[]; // PV moves in SAN format (e.g., ["e4", "e5"])
  score: number; // Centipawn score
  mate?: number; // Moves to mate if applicable
  depth: number;
}

/** Streaming analysis info from engine */
export interface EngineInfo {
  depth: number;
  seldepth?: number;
  score: number; // Centipawn evaluation
  mate?: number; // Moves to mate
  nodes?: number;
  nps?: number; // Nodes per second
  time?: number; // Milliseconds
  pv: string[]; // Principal variation in UCI format
  multipv?: number; // Which PV line (1, 2, 3...)
}

/** Full game analysis result */
export interface GameAnalysisResult {
  moves: MoveAnalysis[];
  accuracy: {
    white: number;
    black: number;
  };
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  bestMoves: number;
  averageCentipawnLoss: {
    white: number;
    black: number;
  };
}

/** Analysis for a single move */
export interface MoveAnalysis {
  moveNumber: number;
  color: 'white' | 'black';
  move: string; // SAN notation
  fen: string;
  evaluation: number;
  bestMove: string;
  classification: MoveClassification;
  centipawnLoss: number;
}
