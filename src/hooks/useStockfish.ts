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
  evaluation: number; 
  mate: number | null; 
  depth: number; 
  targetDepth: number; 
  bestMove: string; 
  bestMoveSan: string; 
  topMoves: MultiPvLine[]; 
  nodes: number;
  nps: number;
  time: number;
  isWhiteTurn: boolean; 
}

export interface UseStockfishOptions {
  autoAnalyze?: boolean; 
  depth?: number; 
  multiPv?: number; 
  debounceMs?: number; 
}

const DEFAULT_OPTIONS: UseStockfishOptions = {
  autoAnalyze: true,
  depth: 12, 
  multiPv: 3,
  debounceMs: 200, 
};


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

  
  const handleInfo = useCallback((fen: string, info: EngineInfo) => {
    
    if (currentAnalysisFen.current !== fen) {
      return;
    }
    
    const chess = new Chess(fen);
    const isWhiteTurn = chess.turn() === 'w';
    
    
    const adjustedScore = isWhiteTurn ? info.score : -info.score;
    const adjustedMate = info.mate ? (isWhiteTurn ? info.mate : -info.mate) : null;
    
    
    const pvLines = getMultiPvLines().map(line => ({
      ...line,
      sanMoves: uciLinesToSan(fen, line.moves),
      
      score: isWhiteTurn ? line.score : -line.score,
      mate: line.mate ? (isWhiteTurn ? line.mate : -line.mate) : undefined,
    }));

    
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

  
  const handleBestMove = useCallback((fen: string, move: string) => {
    
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

  
  const analyze = useCallback((fen: string) => {
    if (!isEngineReady()) {
      console.warn('[useStockfish] Engine not ready');
      return;
    }

    
    if (currentAnalysisFen.current === fen) {
      return;
    }

    
    stockfishStop();
    
    currentAnalysisFen.current = fen;
    setCurrentFen(fen);
    
    
    const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    if (fen === STARTING_FEN) {
      setStatus('ready');
      setAnalysis({
        evaluation: 0,
        mate: null,
        depth: 0,
        targetDepth: opts.depth || 20,
        bestMove: '',
        bestMoveSan: '',
        topMoves: [],
        nodes: 0,
        nps: 0,
        time: 0,
        isWhiteTurn: true,
      });
      return; 
    }
    
    setStatus('analyzing');
    
    stockfishAnalyze(
      fen,
      opts.depth,
      (info) => handleInfo(fen, info),
      (move) => handleBestMove(fen, move)
    );
  }, [opts.depth, handleInfo, handleBestMove]);

  
  const analyzeDebounced = useCallback((fen: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      analyze(fen);
    }, opts.debounceMs);
  }, [analyze, opts.debounceMs]);

  
  const stop = useCallback(() => {
    stockfishStop();
    currentAnalysisFen.current = null;
    if (status === 'analyzing') {
      setStatus('ready');
    }
  }, [status]);

  
  const updateConfig = useCallback((config: Partial<EngineConfig>) => {
    setStockfishConfig(config);
  }, []);


  const setFen = useCallback((fen: string) => {
    if (opts.autoAnalyze && status === 'ready' || status === 'analyzing') {

      const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      if (fen === STARTING_FEN) {
        setAnalysis({
          evaluation: 0,
          mate: null,
          depth: 0,
          targetDepth: opts.depth || 20,
          bestMove: '',
          bestMoveSan: '',
          topMoves: [],
          nodes: 0,
          nps: 0,
          time: 0,
          isWhiteTurn: true,
        });
      }
      analyzeDebounced(fen);
    }
  }, [opts.autoAnalyze, opts.depth, status, analyzeDebounced]);

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
