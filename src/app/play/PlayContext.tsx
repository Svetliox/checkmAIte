'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useRef, 
  useEffect,
  type ReactNode 
} from 'react';
import { Chess } from 'chess.js';
import { 
  type PlayerColor, 
  type BotDifficulty, 
  type GameResult,
  type ChatMessage,
  BOT_DIFFICULTY_CONFIG,
  type MultiPvLine,
  type EngineInfo,
} from '@/types';
import { 
  initStockfish, 
  analyzeToBestMove, 
  analyzePosition,
  stopAnalysis,
  getMultiPvLines,
  isCurrentlyAnalyzing,
  isEngineReady,
} from '@/lib/chess/stockfish';
import { getRandomOpeningMove, isStartingPosition } from '@/lib/chess/openings';
import { useAIChat } from '@/hooks';

type GamePhase = 'setup' | 'playing' | 'ended';

interface PlayContextValue {
  phase: GamePhase;
  playerColor: PlayerColor;
  difficulty: BotDifficulty;

  fen: string;
  moveHistory: string[];
  isPlayerTurn: boolean;
  isBotThinking: boolean;
  gameResult: GameResult;

  evaluation: number;
  mate: number | null;
  topMoves: MultiPvLine[];
  isAnalyzing: boolean;
  depth: number;

  showBestMoves: boolean;
  toggleBestMoves: () => void;

  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  chatError: string | null;

  setupGame: (color: PlayerColor, difficulty: BotDifficulty) => void;
  loadGame: (fen: string, moves: string[], color?: PlayerColor, diff?: BotDifficulty, savedTopMoves?: MultiPvLine[] | null) => void;
  makePlayerMove: (from: string, to: string, promotion?: string) => boolean;
  resetGame: () => void;
  backToSetup: () => void;

  engineStatus: 'loading' | 'ready' | 'error';
  engineError: string | null;
}

const PlayContext = createContext<PlayContextValue | null>(null);

interface PlayProviderProps {
  children: ReactNode;
}

export function PlayProvider({ children }: PlayProviderProps) {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white');
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult>({ type: 'ongoing' });
  const [evaluation, setEvaluation] = useState(0);
  const [mate, setMate] = useState<number | null>(null);
  const [topMoves, setTopMoves] = useState<MultiPvLine[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [depth, setDepth] = useState(0);
  const [showBestMoves, setShowBestMoves] = useState(true);
  const [engineStatus, setEngineStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [engineError, setEngineError] = useState<string | null>(null);
  const {
    messages: chatMessages,
    isLoading: isChatLoading,
    error: chatError,
    triggerCommentary,
    resetChat,
    shouldTrigger,
  } = useAIChat({ gameMode: 'vsBot' });
  const isProcessingBotMove = useRef(false);
  const pendingBotMove = useRef(false);
  const gameVersionRef = useRef(0);
  const currentTurn = gameRef.current.turn();
  const isPlayerTurn = phase === 'playing' && 
    gameResult.type === 'ongoing' &&
    ((currentTurn === 'w' && playerColor === 'white') || 
     (currentTurn === 'b' && playerColor === 'black'));

  useEffect(() => {
    let mounted = true;
    
    initStockfish({
      depth: 20,
      multiPv: 3,
    }).then(() => {
      if (mounted) {
        setEngineStatus('ready');
      }
    }).catch((err) => {
      if (mounted) {
        setEngineStatus('error');
        setEngineError(err.message || 'Failed to initialize engine');
      }
    });
    
    return () => {
      mounted = false;
    };
  }, []);

  const analyzeCurrentPosition = useCallback((currentFen: string) => {
    if (engineStatus !== 'ready' || !isEngineReady()) {
      return;
    }
    if (isCurrentlyAnalyzing()) {
      stopAnalysis();
      setTimeout(() => analyzeCurrentPosition(currentFen), 200);
      return;
    }
    
    try {
      setIsAnalyzing(true);
      analyzePosition(
        currentFen,
        20, 
        (info: EngineInfo) => {
        if (info.multipv === 1 || !info.multipv) {
          setEvaluation(info.score);
          if (info.mate !== undefined) {
            setMate(info.mate);
          } else {
            setMate(null);
          }
          setDepth(info.depth);
        }

        const lines = getMultiPvLines();
        const linesWithSan = lines.map(line => {
          if (line.moves.length > 0 && line.sanMoves.length === 0) {
            try {
              const tempGame = new Chess(currentFen);
              const uciMove = line.moves[0];
              const from = uciMove.slice(0, 2);
              const to = uciMove.slice(2, 4);
              const promotion = uciMove.length > 4 ? uciMove[4] : undefined;
              const move = tempGame.move({ from, to, promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined });
              if (move) {
                return { ...line, sanMoves: [move.san] };
              }
            } catch {
              // If conversion fails, keep original
            }
          }
          return line;
        });
        setTopMoves(linesWithSan);
      },
      () => {
        setIsAnalyzing(false);
      }
    );
    } catch (error) {
      console.warn('[PlayContext] Analysis error:', error);
      setIsAnalyzing(false);
    }
  }, [engineStatus]);

  useEffect(() => {
    // Don't analyze while bot is thinking to avoid race conditions
    // Also skip analysis on starting position (no moves yet) to keep clean slate on new game
    if (phase === 'playing' && engineStatus === 'ready' && gameResult.type === 'ongoing' && !isBotThinking && moveHistory.length > 0) {
      // Longer delay to ensure bot move is complete
      const timer = setTimeout(() => {
        analyzeCurrentPosition(fen);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fen, phase, engineStatus, gameResult.type, isBotThinking, moveHistory.length, analyzeCurrentPosition]);

  const checkGameResult = useCallback((): GameResult => {
    const game = gameRef.current;
    
    if (game.isCheckmate()) {
      const winner: PlayerColor = game.turn() === 'w' ? 'black' : 'white';
      return { type: 'checkmate', winner };
    }
    
    if (game.isStalemate()) {
      return { type: 'draw', reason: 'stalemate' };
    }
    
    if (game.isInsufficientMaterial()) {
      return { type: 'draw', reason: 'insufficient' };
    }
    
    if (game.isThreefoldRepetition()) {
      return { type: 'draw', reason: 'threefold' };
    }
    
    if (game.isDraw()) {
      return { type: 'draw', reason: 'fifty-move' };
    }
    
    return { type: 'ongoing' };
  }, []);

  const makeBotMove = useCallback(async () => {
    if (isProcessingBotMove.current) {
      pendingBotMove.current = true;
      return;
    }

    if (engineStatus !== 'ready' || !isEngineReady()) {
      console.warn('Stockfish not ready, skipping bot move');
      return;
    }

    const currentGameVersion = gameVersionRef.current;
    
    const game = gameRef.current;
    const currentFen = game.fen();

    const result = checkGameResult();
    if (result.type !== 'ongoing') {
      setGameResult(result);
      return;
    }
    
    isProcessingBotMove.current = true;
    setIsBotThinking(true);
    
    stopAnalysis();

    let waitAttempts = 0;
    while (isCurrentlyAnalyzing() && waitAttempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 50));
      waitAttempts++;
    }
    
    try {
      const delay = 300 + Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delay));

      if (gameVersionRef.current !== currentGameVersion) {
        return;
      }
      
      let bestMoveUci: string;

      if (isStartingPosition(currentFen) && game.turn() === 'w') {
        const opening = getRandomOpeningMove();
        bestMoveUci = opening.uci;
      } else {
        const depth = BOT_DIFFICULTY_CONFIG[difficulty].depth;
        const result = await analyzeToBestMove(currentFen, depth);
        bestMoveUci = result.bestMove;

        if (gameVersionRef.current !== currentGameVersion) {
          return;
        }
      }

      const from = bestMoveUci.slice(0, 2);
      const to = bestMoveUci.slice(2, 4);
      const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;
      
      const move = game.move({ from, to, promotion });
      if (move) {
        setFen(game.fen());
        setMoveHistory(prev => [...prev, move.san]);

        const newResult = checkGameResult();
        if (newResult.type !== 'ongoing') {
          setGameResult(newResult);
        }
      }
    } catch (error) {
      console.error('Bot move error:', error);
    } finally {
      setIsBotThinking(false);
      isProcessingBotMove.current = false;

      if (pendingBotMove.current) {
        pendingBotMove.current = false;
        makeBotMove();
      }
    }
  }, [difficulty, checkGameResult, engineStatus]);

  useEffect(() => {
    if (
      phase === 'playing' && 
      engineStatus === 'ready' && 
      gameResult.type === 'ongoing' &&
      !isPlayerTurn &&
      !isBotThinking
    ) {
      makeBotMove();
    }
  }, [phase, engineStatus, gameResult.type, isPlayerTurn, isBotThinking, makeBotMove]);

  const setupGame = useCallback((color: PlayerColor, diff: BotDifficulty) => {
    stopAnalysis();

    gameVersionRef.current++;

    const game = new Chess();
    gameRef.current = game;
    
    setPlayerColor(color);
    setDifficulty(diff);
    setFen(game.fen());
    setMoveHistory([]);
    setGameResult({ type: 'ongoing' });
    setEvaluation(0);
    setMate(null);
    setTopMoves([]);
    setDepth(0);
    setIsAnalyzing(false);
    setIsBotThinking(false);

    isProcessingBotMove.current = false;
    pendingBotMove.current = false;

    resetChat();
    
    setPhase('playing');
  }, [resetChat]);

  const loadGame = useCallback((
    loadedFen: string,
    moves: string[],
    color?: PlayerColor,
    diff?: BotDifficulty,
    savedTopMoves?: MultiPvLine[] | null
  ) => {
    stopAnalysis();

    gameVersionRef.current++;

    const game = new Chess(loadedFen);
    gameRef.current = game;
    
    if (color) setPlayerColor(color);
    if (diff) setDifficulty(diff);
    setFen(game.fen());
    setMoveHistory(moves);
    setGameResult({ type: 'ongoing' });
    setEvaluation(0);
    setMate(null);
    // Restore top moves if provided from saved game
    setTopMoves(savedTopMoves || []);
    setDepth(0);
    setIsAnalyzing(false);
    setIsBotThinking(false);

    isProcessingBotMove.current = false;
    pendingBotMove.current = false;

    resetChat();
    
    setPhase('playing');
  }, [resetChat]);

  useEffect(() => {
    if (phase === 'playing' && gameResult.type === 'ongoing' && shouldTrigger(moveHistory.length)) {
      triggerCommentary(fen, moveHistory);
    }
  }, [moveHistory.length, fen, moveHistory, shouldTrigger, triggerCommentary, phase, gameResult.type]);

  const makePlayerMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (!isPlayerTurn || isBotThinking || gameResult.type !== 'ongoing') {
      return false;
    }
    
    const game = gameRef.current;
    
    try {
      stopAnalysis();
      
      const move = game.move({ from, to, promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined });
      if (move) {
        setFen(game.fen());
        setMoveHistory(prev => [...prev, move.san]);

        const newResult = checkGameResult();
        if (newResult.type !== 'ongoing') {
          setGameResult(newResult);
        }
        
        return true;
      }
    } catch {
      return false;
    }
    
    return false;
  }, [isPlayerTurn, isBotThinking, gameResult.type, checkGameResult]);

  const resetGame = useCallback(() => {
    stopAnalysis();
    resetChat();
    setupGame(playerColor, difficulty);
  }, [playerColor, difficulty, setupGame, resetChat]);

  const backToSetup = useCallback(() => {
    stopAnalysis();

    gameVersionRef.current++;
    const game = new Chess();
    gameRef.current = game;

    setFen(game.fen());
    setMoveHistory([]);
    setGameResult({ type: 'ongoing' });
    setEvaluation(0);
    setMate(null);
    setTopMoves([]);
    setDepth(0);
    setIsAnalyzing(false);
    setIsBotThinking(false);

    isProcessingBotMove.current = false;
    pendingBotMove.current = false;

    resetChat();

    setPhase('setup');
  }, [resetChat]);

  const toggleBestMoves = useCallback(() => {
    setShowBestMoves(prev => !prev);
  }, []);

  const value: PlayContextValue = {
    phase,
    playerColor,
    difficulty,
    fen,
    moveHistory,
    isPlayerTurn,
    isBotThinking,
    gameResult,
    evaluation,
    mate,
    topMoves,
    isAnalyzing,
    depth,
    showBestMoves,
    toggleBestMoves,
    chatMessages,
    isChatLoading,
    chatError,
    setupGame,
    loadGame,
    makePlayerMove,
    resetGame,
    backToSetup,
    engineStatus,
    engineError,
  };

  return (
    <PlayContext.Provider value={value}>
      {children}
    </PlayContext.Provider>
  );
}

export function usePlay(): PlayContextValue {
  const context = useContext(PlayContext);
  if (!context) {
    throw new Error('usePlay must be used within a PlayProvider');
  }
  return context;
}
