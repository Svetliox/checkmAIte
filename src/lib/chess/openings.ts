
interface OpeningMove {
  san: string;
  uci: string;
  weight: number;
  name: string;
}

const WHITE_OPENING_MOVES: OpeningMove[] = [
  { san: 'e4', uci: 'e2e4', weight: 35, name: "King's Pawn Opening" },
  { san: 'd4', uci: 'd2d4', weight: 30, name: "Queen's Pawn Opening" },
  { san: 'Nf3', uci: 'g1f3', weight: 15, name: "Réti Opening" },
  { san: 'c4', uci: 'c2c4', weight: 12, name: "English Opening" },
  { san: 'g3', uci: 'g2g3', weight: 5, name: "King's Fianchetto" },
  { san: 'b3', uci: 'b2b3', weight: 3, name: "Nimzo-Larsen Attack" },
];

export function getRandomOpeningMove(): { san: string; uci: string } {
  const totalWeight = WHITE_OPENING_MOVES.reduce((sum, move) => sum + move.weight, 0);
  let random = Math.random() * totalWeight;
  for (const move of WHITE_OPENING_MOVES) {
    random -= move.weight;
    if (random <= 0) {
      return { san: move.san, uci: move.uci };
    }
  }
  return { san: 'e4', uci: 'e2e4' };
}

export function isStartingPosition(fen: string): boolean {
  const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  return fen.split(' ').slice(0, 4).join(' ') === startingFen.split(' ').slice(0, 4).join(' ');
}

export function getAllOpeningMoves(): OpeningMove[] {
  return [...WHITE_OPENING_MOVES];
}
