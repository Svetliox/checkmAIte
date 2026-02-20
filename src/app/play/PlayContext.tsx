/**
 * Play vs Bot Context
 * 
 * Provides game state management for playing against Stockfish.
 * Handles turn logic, bot move generation, and game results.
 */

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

// ============================================
// Types
// ============================================

type GamePhase = 'setup' | 'playing' | 'ended';

interface PlayContextValue {
  // Game phase
  phase: GamePhase;
  
  // Game settings
  playerColor: PlayerColor;
  difficulty: BotDifficulty;
  
  // Game state
  fen: string;
  moveHistory: string[];
  isPlayerTurn: boolean;
  isBotThinking: boolean;
  gameResult: GameResult;
  
  // Analysis state (for evaluation bar and hints)
  evaluation: number;
  mate: number | null;
  topMoves: MultiPvLine[];
  isAnalyzing: boolean;
  depth: number;
  
  // Best moves visibility
  showBestMoves: boolean;
  toggleBestMoves: () => void;
  
  // AI Chat state
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  chatError: string | null;
  
  // Actions
  setupGame: (color: PlayerColor, difficulty: BotDifficulty) => void;
  makePlayerMove: (from: string, to: string, promotion?: string) => boolean;
  resetGame: () => void;
  backToSetup: () => void;
  
  // Engine status
  engineStatus: 'loading' | 'ready' | 'error';
  engineError: string | null;
}

const PlayContext = createContext<PlayContextValue | null>(null);

// ============================================
// Provider Component
// ============================================

interface PlayProviderProps {
  children: ReactNode;
}

export function PlayProvider({ children }: PlayProviderProps) {
  // Game phase
  const [phase, setPhase] = useState<GamePhase>('setup');
  
  // Game settings
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white');
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  
  // Game state
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult>({ type: 'ongoing' });
  
  // Analysis state
  const [evaluation, setEvaluation] = useState(0);
  const [mate, setMate] = useState<number | null>(null);
  const [topMoves, setTopMoves] = useState<MultiPvLine[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [depth, setDepth] = useState(0);
  
  // Best moves toggle
  const [showBestMoves, setShowBestMoves] = useState(true);
  
  // Engine status
  const [engineStatus, setEngineStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [engineError, setEngineError] = useState<string | null>(null);
  
  // AI Chat integration
  const {
    messages: chatMessages,
    isLoading: isChatLoading,
    error: chatError,
    triggerCommentary,
    resetChat,
    shouldTrigger,
  } = useAIChat({ gameMode: 'vsBot' });
  
  // Refs to track latest state in callbacks
  const isProcessingBotMove = useRef(false);
  const pendingBotMove = useRef(false);
  const gameVersionRef = useRef(0);

  // Calculate if it's player's turn
  const currentTurn = gameRef.current.turn();
  const isPlayerTurn = phase === 'playing' && 
    gameResult.type === 'ongoing' &&
    ((currentTurn === 'w' && playerColor === 'white') || 
     (currentTurn === 'b' && playerColor === 'black'));

  // ============================================
  // Initialize Stockfish
  // ============================================
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

  // ============================================
  // Run position analysis (for evaluation bar and hints)
  // ============================================
  const analyzeCurrentPosition = useCallback((currentFen: string) => {
    // Double-check both React state and actual engine state
    if (engineStatus !== 'ready' || !isEngineReady()) {
      return;
    }
    
    // Don't start analysis if engine is already busy
    if (isCurrentlyAnalyzing()) {
      stopAnalysis();
      // Wait a bit and retry
      setTimeout(() => analyzeCurrentPosition(currentFen), 200);
      return;
    }
    
    try {
      setIsAnalyzing(true);
      analyzePosition(
        currentFen,
        20, // Analysis depth
        (info: EngineInfo) => {
        // Update evaluation from analysis
        if (info.multipv === 1 || !info.multipv) {
          setEvaluation(info.score);
          if (info.mate !== undefined) {
            setMate(info.mate);
          } else {
            setMate(null);
          }
          setDepth(info.depth);
        }
        
        // Get top moves and convert UCI to SAN
        const lines = getMultiPvLines();
        const linesWithSan = lines.map(line => {
          // Try to convert first move from UCI to SAN
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
      // Engine not ready or other error - silently ignore
      console.warn('[PlayContext] Analysis error:', error);
      setIsAnalyzing(false);
    }
  }, [engineStatus]);

  // Analyze position when FEN changes
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

  // ============================================
  // Check game result
  // ============================================
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

  // ============================================
  // Bot move generation
  // ============================================
  const makeBotMove = useCallback(async () => {
    if (isProcessingBotMove.current) {
      pendingBotMove.current = true;
      return;
    }
    
    // Check if engine is ready
    if (engineStatus !== 'ready' || !isEngineReady()) {
      console.warn('Stockfish not ready, skipping bot move');
      return;
    }
    
    // Capture current game version to detect if game was reset
    const currentGameVersion = gameVersionRef.current;
    
    const game = gameRef.current;
    const currentFen = game.fen();
    
    // Check if game is over
    const result = checkGameResult();
    if (result.type !== 'ongoing') {
      setGameResult(result);
      return;
    }
    
    isProcessingBotMove.current = true;
    setIsBotThinking(true);
    
    // Stop any ongoing analysis and wait for it to finish
    stopAnalysis();
    
    // Wait until engine is free (with timeout)
    let waitAttempts = 0;
    while (isCurrentlyAnalyzing() && waitAttempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 50));
      waitAttempts++;
    }
    
    try {
      // Artificial delay for natural feel (0.3-0.8 seconds)
      const delay = 300 + Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Check if game was reset during delay
      if (gameVersionRef.current !== currentGameVersion) {
        return;
      }
      
      let bestMoveUci: string;
      
      // Use random opening move for first move as White
      if (isStartingPosition(currentFen) && game.turn() === 'w') {
        const opening = getRandomOpeningMove();
        bestMoveUci = opening.uci;
      } else {
        // Use Stockfish for regular moves
        const depth = BOT_DIFFICULTY_CONFIG[difficulty].depth;
        const result = await analyzeToBestMove(currentFen, depth);
        bestMoveUci = result.bestMove;
        
        // Check again after Stockfish analysis
        if (gameVersionRef.current !== currentGameVersion) {
          return;
        }
      }
      
      // Parse UCI move and make it
      const from = bestMoveUci.slice(0, 2);
      const to = bestMoveUci.slice(2, 4);
      const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;
      
      const move = game.move({ from, to, promotion });
      if (move) {
        setFen(game.fen());
        setMoveHistory(prev => [...prev, move.san]);
        
        // Check for game end
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
      
      // Process pending bot move if any
      if (pendingBotMove.current) {
        pendingBotMove.current = false;
        makeBotMove();
      }
    }
  }, [difficulty, checkGameResult, engineStatus]);

  // Trigger bot move when it's bot's turn
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

  // ============================================
  // Actions
  // ============================================
  const setupGame = useCallback((color: PlayerColor, diff: BotDifficulty) => {
    // Stop any ongoing analysis
    stopAnalysis();
    
    // Increment game version to invalidate any in-flight bot moves
    gameVersionRef.current++;
    
    // Reset game state
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
    
    // Reset processing flags
    isProcessingBotMove.current = false;
    pendingBotMove.current = false;
    
    // Reset AI chat
    resetChat();
    
    setPhase('playing');
  }, [resetChat]);

  // Trigger AI commentary every 5 moves
  useEffect(() => {
    // Only trigger during active gameplay
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
      // Stop any ongoing analysis before making move
      stopAnalysis();
      
      const move = game.move({ from, to, promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined });
      if (move) {
        setFen(game.fen());
        setMoveHistory(prev => [...prev, move.san]);
        
        // Check for game end
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
    // Restart with same settings
    stopAnalysis();
    resetChat();
    setupGame(playerColor, difficulty);
  }, [playerColor, difficulty, setupGame, resetChat]);

  const backToSetup = useCallback(() => {
    // Stop all analysis
    stopAnalysis();
    
    // Increment game version to invalidate any in-flight bot moves
    gameVersionRef.current++;
    
    // Reset game instance
    const game = new Chess();
    gameRef.current = game;
    
    // Reset all state to initial values
    setFen(game.fen());
    setMoveHistory([]);
    setGameResult({ type: 'ongoing' });
    setEvaluation(0);
    setMate(null);
    setTopMoves([]);
    setDepth(0);
    setIsAnalyzing(false);
    setIsBotThinking(false);
    
    // Reset processing flags
    isProcessingBotMove.current = false;
    pendingBotMove.current = false;
    
    // Reset AI chat
    resetChat();
    
    // Go to setup phase
    setPhase('setup');
  }, [resetChat]);

  const toggleBestMoves = useCallback(() => {
    setShowBestMoves(prev => !prev);
  }, []);

  // ============================================
  // Context Value
  // ============================================
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

// ============================================
// Hook
// ============================================
export function usePlay(): PlayContextValue {
  const context = useContext(PlayContext);
  if (!context) {
    throw new Error('usePlay must be used within a PlayProvider');
  }
  return context;
}
