/**
 * Opening Book Utility for Play vs Bot Mode
 * 
 * Provides random opening moves for the bot when playing as White.
 * These are common, solid opening moves used at all levels.
 */

/** Opening move with weight for probability distribution */
interface OpeningMove {
  san: string;  // Standard Algebraic Notation (e.g., "e4")
  uci: string;  // UCI format (e.g., "e2e4")
  weight: number; // Higher weight = more likely to be chosen
  name: string;  // Opening name for reference
}

/** Common first moves for White */
const WHITE_OPENING_MOVES: OpeningMove[] = [
  { san: 'e4', uci: 'e2e4', weight: 35, name: "King's Pawn Opening" },
  { san: 'd4', uci: 'd2d4', weight: 30, name: "Queen's Pawn Opening" },
  { san: 'Nf3', uci: 'g1f3', weight: 15, name: "Réti Opening" },
  { san: 'c4', uci: 'c2c4', weight: 12, name: "English Opening" },
  { san: 'g3', uci: 'g2g3', weight: 5, name: "King's Fianchetto" },
  { san: 'b3', uci: 'b2b3', weight: 3, name: "Nimzo-Larsen Attack" },
];

/**
 * Get a random opening move for White's first move
 * Uses weighted random selection based on popularity/soundness
 * 
 * @returns Object with SAN and UCI notation of the chosen move
 */
export function getRandomOpeningMove(): { san: string; uci: string } {
  const totalWeight = WHITE_OPENING_MOVES.reduce((sum, move) => sum + move.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const move of WHITE_OPENING_MOVES) {
    random -= move.weight;
    if (random <= 0) {
      return { san: move.san, uci: move.uci };
    }
  }
  
  // Fallback (should never reach here)
  return { san: 'e4', uci: 'e2e4' };
}

/**
 * Check if it's the first move of the game
 * @param fen - Current position FEN
 * @returns True if this is the starting position
 */
export function isStartingPosition(fen: string): boolean {
  const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  // Compare just the position part (ignore halfmove and fullmove counters)
  return fen.split(' ').slice(0, 4).join(' ') === startingFen.split(' ').slice(0, 4).join(' ');
}

/**
 * Get all available opening moves (for UI display if needed)
 */
export function getAllOpeningMoves(): OpeningMove[] {
  return [...WHITE_OPENING_MOVES];
}
