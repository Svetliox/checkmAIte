

import type { AIChatRequest } from '@/types';

 
const PIECE_NAMES: Record<string, string> = {
  K: 'King',
  Q: 'Queen',
  R: 'Rook',
  B: 'Bishop',
  N: 'Knight',
  P: 'Pawn',
  k: 'King',
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
  p: 'Pawn',
};

 
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

 
function parseFenToPieces(fen: string): { white: string[]; black: string[] } {
  const [position] = fen.split(' ');
  const whitePieces: string[] = [];
  const blackPieces: string[] = [];
  
  const ranks = position.split('/');
  
  ranks.forEach((rank, rankIndex) => {
    let fileIndex = 0;
    for (const char of rank) {
      if (/\d/.test(char)) {
        fileIndex += parseInt(char, 10);
      } else {
        const square = `${FILES[fileIndex]}${8 - rankIndex}`;
        const pieceName = PIECE_NAMES[char] || char;
        const isWhite = char === char.toUpperCase();
        
        if (isWhite) {
          whitePieces.push(`${pieceName} on ${square}`);
        } else {
          blackPieces.push(`${pieceName} on ${square}`);
        }
        fileIndex++;
      }
    }
  });
  
  return { white: whitePieces, black: blackPieces };
}

 
function determineGamePhase(fen: string, moveCount: number): 'opening' | 'middlegame' | 'endgame' {
  const [position] = fen.split(' ');
  
  // Count major/minor pieces (excluding pawns and kings)
  const minorMajorPieces = (position.match(/[qrbnQRBN]/g) || []).length;
  const queens = (position.match(/[qQ]/g) || []).length;
  
  if (moveCount <= 10 && minorMajorPieces >= 12) {
    return 'opening';
  } else if (minorMajorPieces <= 6 || (queens === 0 && minorMajorPieces <= 8)) {
    return 'endgame';
  }
  return 'middlegame';
}

 
function getTurnFromFen(fen: string): 'white' | 'black' {
  const parts = fen.split(' ');
  return parts[1] === 'w' ? 'white' : 'black';
}

 
function buildSystemPrompt(): string {
  return `You are checkmAIte, a friendly and knowledgeable chess companion. Your personality:
- Enthusiastic about chess but never condescending
- Use light, friendly humor (NOT sarcastic or sassy)
- Educational: briefly explain openings, tactics, or positions when relevant
- Supportive: encourage the player regardless of position
- Concise: keep responses under 80 words

Your commentary style:
- If you recognize an opening or defense, name it and add a fun fact
- Comment on interesting tactical patterns
- Note if one side has a significant advantage (in a friendly way)
- Use chess metaphors and wordplay occasionally
- End with a small encouraging note or observation

Remember: You're a chess buddy, not a stern coach!`;
}

 
function buildUserPrompt(request: AIChatRequest): string {
  const { fen, moveHistory, moveNumber, gameMode } = request;
  const pieces = parseFenToPieces(fen);
  const phase = determineGamePhase(fen, moveHistory.length);
  const turn = getTurnFromFen(fen);
  
  const modeContext = gameMode === 'vsBot' 
    ? 'The player is playing against a bot.' 
    : 'The player is analyzing a position.';
  
  const recentMoves = moveHistory.slice(-6).join(' ');
  
  return `Analyze this chess position and provide friendly commentary.

${modeContext}
Current move number: ${moveNumber}
Game phase: ${phase}
It's ${turn}'s turn to move.

Recent moves: ${recentMoves || 'Game just started'}

FEN: ${fen}

White pieces: ${pieces.white.join(', ')}
Black pieces: ${pieces.black.join(', ')}

Provide a brief, friendly comment about the position. If you recognize any opening or defense, mention it with a fun fact. Keep it light and encouraging!`;
}

 
export function buildChatPrompt(request: AIChatRequest): { role: string; content: string }[] {
  return [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: buildUserPrompt(request) },
  ];
}

 
export function getWelcomeMessage(): string {
  const welcomeMessages = [
    "Do your moves, I am waiting to be your best checkmAIte! ♟️",
    "Ready for some chess magic? Make your moves and I'll be here with insights every 5 moves!",
    "Let's play! I'll share some chess wisdom after every 5 moves. May your pieces find their best squares!",
    "Game on! I'm your friendly chess companion. I'll chime in with commentary every 5 moves. Good luck!",
  ];
  
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
}

 
export function getGamePhase(fen: string, moveCount: number): 'opening' | 'middlegame' | 'endgame' {
  return determineGamePhase(fen, moveCount);
}
