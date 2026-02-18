/**
 * useStockfish Hook
 * 
 * A React hook for integrating Stockfish chess engine analysis
 * into React components with real-time streaming updates.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import type { EngineConfig, EngineInfo, EngineStatus, MultiPvLine } from '@/types';
import {
  initStockfish,
  analyzePosition as stockfishAnalyze,
  stopAnalysis as stockfishStop,
  terminateStockfish,
  isEngineReady,
  getMultiPvLines,
  setStockfishConfig,
} from '@/lib/chess/stockfish';

export interface StockfishAnalysis {
  evaluation: number; // Centipawn score
  mate: number | null; // Moves to mate
  depth: number; // Current search depth
  targetDepth: number; // Target search depth
  bestMove: string; // Best move in UCI format
  bestMoveSan: string; // Best move in SAN format
  topMoves: MultiPvLine[]; // Multi-PV lines
  nodes: number;
  nps: number;
  time: number;
  isWhiteTurn: boolean; // Whose turn it is
}

export interface UseStockfishOptions {
  autoAnalyze?: boolean; // Automatically analyze when FEN changes
  depth?: number; // Analysis depth
  multiPv?: number; // Number of principal variations
  debounceMs?: number; // Debounce position changes
}

const DEFAULT_OPTIONS: UseStockfishOptions = {
  autoAnalyze: true,
  depth: 12, // Lower depth for faster analysis
  multiPv: 3,
  debounceMs: 200, // Faster response
};

/**
 * Convert UCI move to SAN using a Chess.js instance
 */
function uciToSan(fen: string, uciMove: string): string {
  try {
    const chess = new Chess(fen);
    const from = uciMove.slice(0, 2);
    const to = uciMove.slice(2, 4);
    const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
    
    const move = chess.move({ from, to, promotion });
    return move?.san || uciMove;
  } catch {
    return uciMove;
  }
}

/**
 * Convert array of UCI moves to SAN starting from a position
 */
function uciLinesToSan(fen: string, uciMoves: string[]): string[] {
  const sanMoves: string[] = [];
  const chess = new Chess(fen);
  
  for (const uciMove of uciMoves) {
    try {
      const from = uciMove.slice(0, 2);
      const to = uciMove.slice(2, 4);
      const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
      
      const move = chess.move({ from, to, promotion });
      if (move) {
        sanMoves.push(move.san);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
  
  return sanMoves;
}

export function useStockfish(options: UseStockfishOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [status, setStatus] = useState<EngineStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentFen, setCurrentFen] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<StockfishAnalysis | null>(null);
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const currentAnalysisFen = useRef<string | null>(null);

  // Initialize engine on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setStatus('loading');
      try {
        await initStockfish({
          depth: opts.depth,
          multiPv: opts.multiPv,
        });
        if (mounted) {
          setStatus('ready');
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Failed to initialize engine');
        }
      }
    };

    init();

    return () => {
      mounted = false;
      terminateStockfish();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle info callback
  const handleInfo = useCallback((fen: string, info: EngineInfo) => {
    // Ignore info if it's for a different position (stale callback)
    if (currentAnalysisFen.current !== fen) {
      return;
    }
    
    const chess = new Chess(fen);
    const isWhiteTurn = chess.turn() === 'w';
    
    // Adjust evaluation for black's perspective
    const adjustedScore = isWhiteTurn ? info.score : -info.score;
    const adjustedMate = info.mate ? (isWhiteTurn ? info.mate : -info.mate) : null;
    
    // Get multi-PV lines and convert to SAN for the CURRENT position
    const pvLines = getMultiPvLines().map(line => ({
      ...line,
      sanMoves: uciLinesToSan(fen, line.moves),
      // Adjust score for perspective
      score: isWhiteTurn ? line.score : -line.score,
      mate: line.mate ? (isWhiteTurn ? line.mate : -line.mate) : undefined,
    }));

    // Get best move in SAN
    const bestMoveUci = info.pv[0] || '';
    const bestMoveSan = bestMoveUci ? uciToSan(fen, bestMoveUci) : '';

    setAnalysis({
      evaluation: adjustedScore,
      mate: adjustedMate,
      depth: info.depth,
      targetDepth: opts.depth || 20,
      bestMove: bestMoveUci,
      bestMoveSan,
      topMoves: pvLines,
      nodes: info.nodes || 0,
      nps: info.nps || 0,
      time: info.time || 0,
      isWhiteTurn,
    });
  }, [opts.depth]);

  // Handle best move callback
  const handleBestMove = useCallback((fen: string, move: string) => {
    // Ignore bestmove if it's for a different position (stale callback)
    if (currentAnalysisFen.current !== fen) {
      return;
    }
    
    const bestMoveSan = uciToSan(fen, move);
    
    setAnalysis(prev => prev ? {
      ...prev,
      bestMove: move,
      bestMoveSan,
    } : null);
    
    setStatus('ready');
  }, []);

  // Analyze a position
  const analyze = useCallback((fen: string) => {
    if (!isEngineReady()) {
      console.warn('[useStockfish] Engine not ready');
      return;
    }

    // Skip if same position is already being analyzed
    if (currentAnalysisFen.current === fen) {
      return;
    }

    // Stop any current analysis
    stockfishStop();
    
    currentAnalysisFen.current = fen;
    setStatus('analyzing');
    setCurrentFen(fen);
    
    // Don't clear analysis - keep showing previous results until new ones arrive
    
    stockfishAnalyze(
      fen,
      opts.depth,
      (info) => handleInfo(fen, info),
      (move) => handleBestMove(fen, move)
    );
  }, [opts.depth, handleInfo, handleBestMove]);

  // Debounced analyze
  const analyzeDebounced = useCallback((fen: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      analyze(fen);
    }, opts.debounceMs);
  }, [analyze, opts.debounceMs]);

  // Stop analysis
  const stop = useCallback(() => {
    stockfishStop();
    currentAnalysisFen.current = null;
    if (status === 'analyzing') {
      setStatus('ready');
    }
  }, [status]);

  // Update configuration
  const updateConfig = useCallback((config: Partial<EngineConfig>) => {
    setStockfishConfig(config);
  }, []);

  // Auto-analyze when FEN changes
  const setFen = useCallback((fen: string) => {
    if (opts.autoAnalyze && status === 'ready' || status === 'analyzing') {
      analyzeDebounced(fen);
    }
  }, [opts.autoAnalyze, status, analyzeDebounced]);

  return {
    status,
    error,
    analysis,
    currentFen,
    isReady: status === 'ready' || status === 'analyzing',
    isAnalyzing: status === 'analyzing',
    analyze,
    analyzeDebounced,
    setFen,
    stop,
    updateConfig,
  };
}
