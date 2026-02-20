
import type { Square, PieceSymbol, Color } from 'chess.js';

export type ChessPosition = string;

export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: PieceSymbol;
  san?: string;
  lan?: string;
}

export interface ChessPiece {
  type: PieceSymbol;
  color: Color;
  square: Square;
}

export interface AnalysisResult {
  bestMove: ChessMove | null;
  evaluation: number;
  depth: number;
  pv: ChessMove[];
  mate?: number;
  nodes?: number;
  time?: number;
}

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

export type MoveClassification =
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'book';

export interface AnalyzedMove {
  move: ChessMove;
  position: ChessPosition;
  classification: MoveClassification;
  evaluation: number;
  bestMove: ChessMove | null;
  centipawnLoss: number;
}

export interface GameHistoryEntry {
  moveNumber: number;
  whiteMove?: AnalyzedMove;
  blackMove?: AnalyzedMove;
}

export type BoardOrientation = 'white' | 'black';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'analyzing' | 'error';

export interface EngineConfig {
  depth: number;
  multiPv: number;
  threads?: number;
  hashSize?: number;
}

export interface MultiPvLine {
  rank: number;
  moves: string[];
  sanMoves: string[];
  score: number;
  mate?: number;
  depth: number;
}

export interface EngineInfo {
  depth: number;
  seldepth?: number;
  score: number;
  mate?: number;
  nodes?: number;
  nps?: number;
  time?: number;
  pv: string[];
  multipv?: number;
}

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

export interface MoveAnalysis {
  moveNumber: number;
  color: 'white' | 'black';
  move: string;
  fen: string;
  evaluation: number;
  bestMove: string;
  classification: MoveClassification;
  centipawnLoss: number;
}


export type GameMode = 'analysis' | 'vsBot';

export type PlayerColor = 'white' | 'black';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export const BOT_DIFFICULTY_CONFIG: Record<BotDifficulty, { depth: number; label: string }> = {
  easy: { depth: 4, label: 'Easy' },
  medium: { depth: 8, label: 'Medium' },
  hard: { depth: 15, label: 'Hard' },
};

export type GameResult = 
  | { type: 'ongoing' }
  | { type: 'checkmate'; winner: PlayerColor }
  | { type: 'draw'; reason: 'stalemate' | 'insufficient' | 'threefold' | 'fifty-move' }
  | { type: 'resignation'; winner: PlayerColor };

export interface PlayGameState {
  playerColor: PlayerColor;
  difficulty: BotDifficulty;
  isPlayerTurn: boolean;
  isBotThinking: boolean;
  gameResult: GameResult;
  showBestMoves: boolean;
}


export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  model?: string;
}

export interface AIChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  lastTriggeredMoveCount: number;
}

export interface AIChatRequest {
  fen: string;
  moveHistory: string[];
  moveNumber: number;
  gamePhase?: 'opening' | 'middlegame' | 'endgame';
  gameMode: 'analysis' | 'vsBot';
}

export interface AIChatResponse {
  message: string;
  model: string;
  success: boolean;
  error?: string;
}
