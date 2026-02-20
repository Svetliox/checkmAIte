

import { Chess } from 'chess.js';
import type {
  GameAnalysisResult,
  MoveAnalysis,
  MoveClassification,
} from '@/types';
import {
  initStockfish,
  analyzeToBestMove,
  isEngineReady,
} from './stockfish';

const THRESHOLDS = {
  best: 10,
  excellent: 25,
  good: 50,
  inaccuracy: 100,
  mistake: 200,
};

 
function classifyMove(cpLoss: number): MoveClassification {
  const absLoss = Math.abs(cpLoss);
  
  if (absLoss <= THRESHOLDS.best) return 'best';
  if (absLoss <= THRESHOLDS.excellent) return 'excellent';
  if (absLoss <= THRESHOLDS.good) return 'good';
  if (absLoss <= THRESHOLDS.inaccuracy) return 'inaccuracy';
  if (absLoss <= THRESHOLDS.mistake) return 'mistake';
  return 'blunder';
}

 
function calculateAccuracy(cpLosses: number[]): number {
  if (cpLosses.length === 0) return 0;
  
  
  const accuracies = cpLosses.map(loss => {
    const absLoss = Math.abs(loss);
    
    const accuracy = Math.max(0, 100 * Math.exp(-absLoss / 200));
    return accuracy;
  });
  
  const sum = accuracies.reduce((a, b) => a + b, 0);
  return Math.round(sum / accuracies.length * 10) / 10;
}

export interface GameAnalysisOptions {
  depth?: number;
  onProgress?: (current: number, total: number) => void;
}

 
export async function analyzeGame(
  moves: string[],
  options: GameAnalysisOptions = {}
): Promise<GameAnalysisResult> {
  const { depth = 16, onProgress } = options;

  if (!isEngineReady()) {
    await initStockfish({ depth });
  }

  const chess = new Chess();
  const moveAnalyses: MoveAnalysis[] = [];
  const whiteCpLosses: number[] = [];
  const blackCpLosses: number[] = [];
  
  let blunders = 0;
  let mistakes = 0;
  let inaccuracies = 0;
  let bestMoves = 0;
  
  let previousEval = 0;

  for (let i = 0; i < moves.length; i++) {
    const san = moves[i];
    const fenBefore = chess.fen();
    const isWhite = chess.turn() === 'w';
    const moveNumber = Math.floor(i / 2) + 1;

    
    let bestMoveEval = 0;
    let bestMoveUci = '';
    
    try {
      const result = await analyzeToBestMove(fenBefore, depth, (info) => {
        if (info.pv.length > 0) {
          bestMoveEval = info.score;
        }
      });
      bestMoveUci = result.bestMove;
    } catch (err) {
      console.warn(`[GameAnalysis] Error analyzing position ${i}:`, err);
    }

    
    const move = chess.move(san);
    if (!move) {
      console.warn(`[GameAnalysis] Invalid move: ${san}`);
      continue;
    }

    
    let currentEval = 0;
    try {
      await analyzeToBestMove(chess.fen(), depth, (info) => {
        currentEval = info.score;
      });
    } catch (err) {
      console.warn(`[GameAnalysis] Error analyzing position after move ${i}:`, err);
    }

    
    const evalChange = isWhite
      ? previousEval - (-currentEval) // Flip sign because side changed
      : (-previousEval) - currentEval;
    
    const cpLoss = Math.max(0, evalChange);
    
    
    const classification = classifyMove(cpLoss);
    
    
    if (classification === 'blunder') blunders++;
    if (classification === 'mistake') mistakes++;
    if (classification === 'inaccuracy') inaccuracies++;
    if (classification === 'best' || classification === 'excellent') bestMoves++;
    
    
    if (isWhite) {
      whiteCpLosses.push(cpLoss);
    } else {
      blackCpLosses.push(cpLoss);
    }

    
    let bestMoveSan = bestMoveUci;
    try {
      const tempChess = new Chess(fenBefore);
      const from = bestMoveUci.slice(0, 2);
      const to = bestMoveUci.slice(2, 4);
      const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;
      const bestMove = tempChess.move({ from, to, promotion });
      if (bestMove) bestMoveSan = bestMove.san;
    } catch {
      
    }

    
    moveAnalyses.push({
      moveNumber,
      color: isWhite ? 'white' : 'black',
      move: san,
      fen: chess.fen(),
      evaluation: currentEval,
      bestMove: bestMoveSan,
      classification,
      centipawnLoss: cpLoss,
    });

    
    previousEval = currentEval;

    
    if (onProgress) {
      onProgress(i + 1, moves.length);
    }
  }

  
  const whiteAccuracy = calculateAccuracy(whiteCpLosses);
  const blackAccuracy = calculateAccuracy(blackCpLosses);

  
  const avgWhiteCpLoss = whiteCpLosses.length > 0
    ? Math.round(whiteCpLosses.reduce((a, b) => a + b, 0) / whiteCpLosses.length)
    : 0;
  const avgBlackCpLoss = blackCpLosses.length > 0
    ? Math.round(blackCpLosses.reduce((a, b) => a + b, 0) / blackCpLosses.length)
    : 0;

  return {
    moves: moveAnalyses,
    accuracy: {
      white: whiteAccuracy,
      black: blackAccuracy,
    },
    blunders,
    mistakes,
    inaccuracies,
    bestMoves,
    averageCentipawnLoss: {
      white: avgWhiteCpLoss,
      black: avgBlackCpLoss,
    },
  };
}

 
export function estimateAccuracy(cpLosses: number[]): number {
  return calculateAccuracy(cpLosses);
}

 
export function getMoveColor(classification: MoveClassification): string {
  switch (classification) {
    case 'best':
      return 'text-accent-success';
    case 'excellent':
      return 'text-green-400';
    case 'good':
      return 'text-foreground';
    case 'inaccuracy':
      return 'text-yellow-500';
    case 'mistake':
      return 'text-orange-500';
    case 'blunder':
      return 'text-accent-danger';
    default:
      return 'text-foreground';
  }
}
