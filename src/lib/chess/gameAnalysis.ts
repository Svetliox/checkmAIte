/**
 * Game Analysis Service
 * 
 * Analyzes complete chess games to calculate:
 * - Move classifications (best, excellent, good, inaccuracy, mistake, blunder)
 * - Accuracy percentages for both players
 * - Statistics (blunders, mistakes, best moves, etc.)
 */

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

// Centipawn loss thresholds for move classification
const THRESHOLDS = {
  best: 10, // <= 10 cp loss
  excellent: 25, // <= 25 cp loss
  good: 50, // <= 50 cp loss
  inaccuracy: 100, // <= 100 cp loss
  mistake: 200, // <= 200 cp loss
  // > 200 cp loss = blunder
};

/**
 * Classify a move based on centipawn loss
 */
function classifyMove(cpLoss: number): MoveClassification {
  const absLoss = Math.abs(cpLoss);
  
  if (absLoss <= THRESHOLDS.best) return 'best';
  if (absLoss <= THRESHOLDS.excellent) return 'excellent';
  if (absLoss <= THRESHOLDS.good) return 'good';
  if (absLoss <= THRESHOLDS.inaccuracy) return 'inaccuracy';
  if (absLoss <= THRESHOLDS.mistake) return 'mistake';
  return 'blunder';
}

/**
 * Calculate accuracy percentage from centipawn losses
 * Uses a formula similar to Chess.com's accuracy calculation
 */
function calculateAccuracy(cpLosses: number[]): number {
  if (cpLosses.length === 0) return 0;
  
  // Win probability formula: 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
  // Accuracy is based on average win probability difference
  const accuracies = cpLosses.map(loss => {
    const absLoss = Math.abs(loss);
    // Convert cp loss to accuracy percentage
    // A perfect move (0 cp loss) = 100% accuracy
    // Higher losses reduce accuracy exponentially
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

/**
 * Analyze a complete game
 * 
 * @param moves Array of moves in SAN notation
 * @param options Analysis options
 * @returns GameAnalysisResult with full analysis
 */
export async function analyzeGame(
  moves: string[],
  options: GameAnalysisOptions = {}
): Promise<GameAnalysisResult> {
  const { depth = 16, onProgress } = options;

  // Ensure engine is ready
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
  
  let previousEval = 0; // Starting position is roughly equal

  for (let i = 0; i < moves.length; i++) {
    const san = moves[i];
    const fenBefore = chess.fen();
    const isWhite = chess.turn() === 'w';
    const moveNumber = Math.floor(i / 2) + 1;

    // Get engine's best move for this position
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

    // Make the actual move
    const move = chess.move(san);
    if (!move) {
      console.warn(`[GameAnalysis] Invalid move: ${san}`);
      continue;
    }

    // Get evaluation after the move
    let currentEval = 0;
    try {
      await analyzeToBestMove(chess.fen(), depth, (info) => {
        currentEval = info.score;
      });
    } catch (err) {
      console.warn(`[GameAnalysis] Error analyzing position after move ${i}:`, err);
    }

    // Calculate centipawn loss
    // For white: loss = evalBefore - evalAfterPlayerMove
    // For black: loss = -evalBefore + evalAfterPlayerMove (flip signs)
    const evalChange = isWhite
      ? previousEval - (-currentEval) // Flip sign because side changed
      : (-previousEval) - currentEval;
    
    const cpLoss = Math.max(0, evalChange);
    
    // Classify the move
    const classification = classifyMove(cpLoss);
    
    // Track statistics
    if (classification === 'blunder') blunders++;
    if (classification === 'mistake') mistakes++;
    if (classification === 'inaccuracy') inaccuracies++;
    if (classification === 'best' || classification === 'excellent') bestMoves++;
    
    // Track cp losses by color
    if (isWhite) {
      whiteCpLosses.push(cpLoss);
    } else {
      blackCpLosses.push(cpLoss);
    }

    // Convert best move UCI to SAN
    let bestMoveSan = bestMoveUci;
    try {
      const tempChess = new Chess(fenBefore);
      const from = bestMoveUci.slice(0, 2);
      const to = bestMoveUci.slice(2, 4);
      const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;
      const bestMove = tempChess.move({ from, to, promotion });
      if (bestMove) bestMoveSan = bestMove.san;
    } catch {
      // Keep UCI notation if conversion fails
    }

    // Record move analysis
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

    // Update evaluation for next iteration
    previousEval = currentEval;

    // Report progress
    if (onProgress) {
      onProgress(i + 1, moves.length);
    }
  }

  // Calculate overall accuracy
  const whiteAccuracy = calculateAccuracy(whiteCpLosses);
  const blackAccuracy = calculateAccuracy(blackCpLosses);

  // Calculate average CP loss
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

/**
 * Quick accuracy estimate based on a few key positions
 * Used for real-time updates while playing
 */
export function estimateAccuracy(cpLosses: number[]): number {
  return calculateAccuracy(cpLosses);
}

/**
 * Get move quality color based on classification
 */
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
