/**
 * PlayVsBot Context
 * Provides state and logic for "Play vs Bot" mode, including user color, bot moves, and statistics.
 */
'use client';

import { createContext, useContext, useState, useCallback, useMemo, useRef, type ReactNode, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useStockfish, type StockfishAnalysis } from '@/hooks';
import { estimateAccuracy } from '@/lib/chess/gameAnalysis';
import type { EngineStatus, MoveClassification, BoardOrientation } from '@/types';

export interface PlayVsBotStatistics {
  totalMoves: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  bestMoves: number;
  whiteCpLosses: number[];
  blackCpLosses: number[];
}

interface PlayVsBotContextValue {
  status: EngineStatus;
  error: string | null;
  isReady: boolean;
  isAnalyzing: boolean;
  analysis: StockfishAnalysis | null;
  currentFen: string;
  moveHistory: string[];
  statistics: PlayVsBotStatistics;
  whiteAccuracy: number;
  blackAccuracy: number;
  userColor: BoardOrientation;
  setUserColor: (color: BoardOrientation) => void;
  isBotTurn: boolean;
  makeUserMove: (san: string) => void;
  resetGame: () => void;
  gameOver: boolean;
  winner: 'white' | 'black' | 'draw' | null;
}

const PlayVsBotContext = createContext<PlayVsBotContextValue | null>(null);

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function classifyFromCpLoss(cpLoss: number): MoveClassification {
  const absLoss = Math.abs(cpLoss);
  if (absLoss <= 10) return 'best';
  if (absLoss <= 25) return 'excellent';
  if (absLoss <= 50) return 'good';
  if (absLoss <= 100) return 'inaccuracy';
  if (absLoss <= 200) return 'mistake';
  return 'blunder';
}

export function PlayVsBotProvider({ children }: { children: ReactNode }) {
  const stockfish = useStockfish({
    autoAnalyze: false, // Only analyze on demand
    depth: 12,
    multiPv: 2,
    debounceMs: 200,
  });

  const [userColor, setUserColor] = useState<BoardOrientation>('white');
  const [currentFen, setCurrentFen] = useState(STARTING_FEN);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<PlayVsBotStatistics>({
    totalMoves: 0,
    blunders: 0,
    mistakes: 0,
    inaccuracies: 0,
    bestMoves: 0,
    whiteCpLosses: [],
    blackCpLosses: [],
  });
  const [previousEval, setPreviousEval] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | 'draw' | null>(null);

  const chessRef = useRef(new Chess());
  const isBotTurn = useMemo(() => {
    const chess = chessRef.current;
    if (gameOver) return false;
    return (chess.turn() === 'w' && userColor === 'black') || (chess.turn() === 'b' && userColor === 'white');
  }, [userColor, currentFen, gameOver]);

  // Handle user move
  const makeUserMove = useCallback((san: string) => {
    if (gameOver) return;
    const chess = chessRef.current;
    try {
      chess.move(san);
      setCurrentFen(chess.fen());
      setMoveHistory(prev => [...prev, san]);
      // Evaluate move
      stockfish.setFen(chess.fen());
      stockfish.analyze(chess.fen());
    } catch {
      // Invalid move
    }
  }, [gameOver, stockfish]);

  // Handle bot move
  useEffect(() => {
    if (!isBotTurn || gameOver) return;
    const chess = chessRef.current;
    // Ask Stockfish for best move
    stockfish.setFen(chess.fen());
    stockfish.analyze(chess.fen());
    const timeout = setTimeout(() => {
      const best = stockfish.analysis?.topMoves?.[0]?.sanMoves?.[0];
      if (best) {
        chess.move(best);
        setCurrentFen(chess.fen());
        setMoveHistory(prev => [...prev, best]);
      }
    }, 600); // Add a small delay for realism
    return () => clearTimeout(timeout);
  }, [isBotTurn, stockfish.analysis, gameOver, stockfish]);

  // Update statistics and check for game over
  useEffect(() => {
    const chess = chessRef.current;
    // Update statistics (simple: just count moves for now)
    setStatistics(prev => ({ ...prev, totalMoves: chess.history().length }));
    // Check for game over
    if (chess.isGameOver()) {
      setGameOver(true);
      if (chess.isCheckmate()) {
        setWinner(chess.turn() === 'w' ? 'black' : 'white');
      } else {
        setWinner('draw');
      }
    }
  }, [currentFen]);

  // Reset game
  const resetGame = useCallback(() => {
    chessRef.current = new Chess();
    setCurrentFen(STARTING_FEN);
    setMoveHistory([]);
    setStatistics({
      totalMoves: 0,
      blunders: 0,
      mistakes: 0,
      inaccuracies: 0,
      bestMoves: 0,
      whiteCpLosses: [],
      blackCpLosses: [],
    });
    setPreviousEval(0);
    setGameOver(false);
    setWinner(null);
  }, []);

  // Accuracy (placeholder, can be improved)
  const whiteAccuracy = useMemo(() => estimateAccuracy(statistics.whiteCpLosses), [statistics.whiteCpLosses]);
  const blackAccuracy = useMemo(() => estimateAccuracy(statistics.blackCpLosses), [statistics.blackCpLosses]);

  const value: PlayVsBotContextValue = {
    status: stockfish.status,
    error: stockfish.error,
    isReady: stockfish.isReady,
    isAnalyzing: stockfish.isAnalyzing,
    analysis: stockfish.analysis,
    currentFen,
    moveHistory,
    statistics,
    whiteAccuracy,
    blackAccuracy,
    userColor,
    setUserColor,
    isBotTurn,
    makeUserMove,
    resetGame,
    gameOver,
    winner,
  };

  return (
    <PlayVsBotContext.Provider value={value}>{children}</PlayVsBotContext.Provider>
  );
}

export function usePlayVsBot() {
  const ctx = useContext(PlayVsBotContext);
  if (!ctx) throw new Error('usePlayVsBot must be used within PlayVsBotProvider');
  return ctx;
}