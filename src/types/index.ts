
export * from './chess';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export type SavedGameType = 'analysis' | 'vsBot';

export interface SavedGame {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  fen: string;
  turn: string;
  moveHistory: string; // JSON stringified array
  statistics: string; // JSON stringified object
  evaluationScore: number;
  gameType?: SavedGameType; // Optional for backwards compatibility with existing records
  evaluation?: number | null; // Engine evaluation at save time
  topMoves?: string | null; // JSON stringified MultiPvLine[]
  difficulty?: string | null; // For analysis: depth number, for vsBot: 'easy'|'medium'|'hard'
  playerColor?: string | null; // 'white' | 'black' - which side user was playing (vsBot)
}

export interface SavedGameParsed extends Omit<SavedGame, 'moveHistory' | 'statistics' | 'topMoves'> {
  moveHistory: string[];
  statistics: import('./chess').GameStatistics;
  topMoves?: import('./chess').MultiPvLine[] | null;
}
