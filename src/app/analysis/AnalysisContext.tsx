
'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { useStockfish, type StockfishAnalysis, useAIChat } from '@/hooks';
import type { EngineStatus, MoveClassification, ChatMessage } from '@/types';
import { estimateAccuracy } from '@/lib/chess/gameAnalysis';

export interface PlayStatistics {
  totalMoves: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  bestMoves: number;
  whiteCpLosses: number[];
  blackCpLosses: number[];
}

interface StateSnapshot {
  fen: string;
  moveHistory: string[];
  statistics: PlayStatistics;
  previousEval: number;
}

interface AnalysisContextValue {
  status: EngineStatus;
  error: string | null;
  isReady: boolean;
  isAnalyzing: boolean;
  
  analysis: StockfishAnalysis | null;
  currentFen: string;
  
  moveHistory: string[];
  
  statistics: PlayStatistics;
  whiteAccuracy: number;
  blackAccuracy: number;
  
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  chatError: string | null;
  
  setFen: (fen: string) => void;
  addMove: (san: string, evaluation: number, wasWhite: boolean) => void;
  undoLastMove: () => void;
  resetGame: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

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

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const stockfish = useStockfish({
    autoAnalyze: true,
    depth: 12, 
    multiPv: 3,
    debounceMs: 200,
  });

  const {
    messages: chatMessages,
    isLoading: isChatLoading,
    error: chatError,
    triggerCommentary,
    resetChat,
    shouldTrigger,
  } = useAIChat({ gameMode: 'analysis' });

  const [currentFen, setCurrentFen] = useState(STARTING_FEN);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [previousEval, setPreviousEval] = useState(0);
  const [statistics, setStatistics] = useState<PlayStatistics>({
    totalMoves: 0,
    blunders: 0,
    mistakes: 0,
    inaccuracies: 0,
    bestMoves: 0,
    whiteCpLosses: [],
    blackCpLosses: [],
  });
  const [historyStack, setHistoryStack] = useState<StateSnapshot[]>([]);

  const handleSetFen = useCallback((fen: string) => {
    setCurrentFen(fen);
    stockfish.setFen(fen);
  }, [stockfish]);

  const addMove = useCallback((san: string, evaluation: number, wasWhite: boolean) => {
    setHistoryStack(prev => [...prev, {
      fen: currentFen,
      moveHistory: [...moveHistory],
      statistics: { ...statistics },
      previousEval,
    }]);
    
    setMoveHistory(prev => [...prev, san]);
    
    const evalDiff = wasWhite
      ? previousEval - (-evaluation)
      : (-previousEval) - evaluation;
    
    const cpLoss = Math.max(0, evalDiff);
    const classification = classifyFromCpLoss(cpLoss);
    
    setStatistics(prev => {
      const newStats = { ...prev };
      newStats.totalMoves++;
      
      if (wasWhite) {
        newStats.whiteCpLosses = [...prev.whiteCpLosses, cpLoss];
      } else {
        newStats.blackCpLosses = [...prev.blackCpLosses, cpLoss];
      }
      
      switch (classification) {
        case 'blunder':
          newStats.blunders++;
          break;
        case 'mistake':
          newStats.mistakes++;
          break;
        case 'inaccuracy':
          newStats.inaccuracies++;
          break;
        case 'best':
        case 'excellent':
          newStats.bestMoves++;
          break;
      }
      
      return newStats;
    });
    
    setPreviousEval(evaluation);
  }, [previousEval, currentFen, moveHistory, statistics]);

  const undoLastMove = useCallback(() => {
    if (historyStack.length === 0) return;
    
    const previousState = historyStack[historyStack.length - 1];
    setHistoryStack(prev => prev.slice(0, -1));
    
    setCurrentFen(previousState.fen);
    setMoveHistory(previousState.moveHistory);
    setStatistics(previousState.statistics);
    setPreviousEval(previousState.previousEval);
    
    stockfish.setFen(previousState.fen);
  }, [historyStack, stockfish]);

  const resetGame = useCallback(() => {
    setCurrentFen(STARTING_FEN);
    setMoveHistory([]);
    setPreviousEval(0);
    setStatistics({
      totalMoves: 0,
      blunders: 0,
      mistakes: 0,
      inaccuracies: 0,
      bestMoves: 0,
      whiteCpLosses: [],
      blackCpLosses: [],
    });
    setHistoryStack([]);
    stockfish.setFen(STARTING_FEN);
    resetChat();
  }, [stockfish, resetChat]);

  useEffect(() => {
    if (shouldTrigger(moveHistory.length)) {
      triggerCommentary(currentFen, moveHistory);
    }
  }, [moveHistory.length, currentFen, moveHistory, shouldTrigger, triggerCommentary]);

  const whiteAccuracy = useMemo(() => 
    estimateAccuracy(statistics.whiteCpLosses),
    [statistics.whiteCpLosses]
  );
  
  const blackAccuracy = useMemo(() => 
    estimateAccuracy(statistics.blackCpLosses),
    [statistics.blackCpLosses]
  );

  const value: AnalysisContextValue = {
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
    chatMessages,
    isChatLoading,
    chatError,
    setFen: handleSetFen,
    addMove,
    undoLastMove,
    resetGame,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
}
