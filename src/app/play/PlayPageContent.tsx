/**
 * Play vs Bot Page Content
 * 
 * Main layout for playing against Stockfish with:
 * - Game setup screen
 * - Chess board with controls
 * - Always-visible evaluation bar
 * - Toggleable best moves panel
 * - AI chat companion
 * - Game result display
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Container, Card, CardContent, Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';
import { EvaluationBar, AIChatPanel } from '@/components/chess';
import { PlayProvider, usePlay } from './PlayContext';
import { GameSetup } from './GameSetup';
import { PlayBoard } from './PlayBoard';
import { BestMovesPanel } from './BestMovesPanel';
import { BOT_DIFFICULTY_CONFIG, PlayerColor, BotDifficulty } from '@/types';

interface PlayPageContentProps {
  loadGameId?: string;
}

export function PlayPageContent({ loadGameId }: PlayPageContentProps) {
  return (
    <PlayProvider>
      <PlayLayout loadGameId={loadGameId} />
    </PlayProvider>
  );
}

interface PlayLayoutProps {
  loadGameId?: string;
}

function PlayLayout({ loadGameId }: PlayLayoutProps) {
  const {
    phase,
    engineStatus,
    engineError,
    setupGame,
    loadGame,
    playerColor,
    difficulty,
    evaluation,
    mate,
    topMoves,
    isAnalyzing,
    depth,
    showBestMoves,
    toggleBestMoves,
    gameResult,
    resetGame,
    backToSetup,
    moveHistory,
    chatMessages,
    isChatLoading,
    chatError,
    fen,
    isBotThinking,
  } = usePlay();

  // Track if we've already loaded a game
  const hasLoadedRef = useRef(false);
  const [isLoadingGame, setIsLoadingGame] = useState(!!loadGameId);
  const [isLoadedGame, setIsLoadedGame] = useState(false);

  // Load saved game when loadGameId is provided
  useEffect(() => {
    if (!loadGameId || hasLoadedRef.current || engineStatus !== 'ready') return;

    const fetchAndLoadGame = async () => {
      try {
        const res = await fetch(`/api/saved-game?id=${loadGameId}`);
        if (!res.ok) {
          console.error('Failed to fetch saved game');
          setIsLoadingGame(false);
          return;
        }
        const data = await res.json();
        const game = data.game;
        if (!game) {
          setIsLoadingGame(false);
          return;
        }

        hasLoadedRef.current = true;
        setIsLoadedGame(true);

        // Parse JSON fields from database
        const parsedMoveHistory = typeof game.moveHistory === 'string' 
          ? JSON.parse(game.moveHistory) as string[]
          : (game.moveHistory || []);
        const parsedTopMoves = game.topMoves && typeof game.topMoves === 'string'
          ? JSON.parse(game.topMoves)
          : game.topMoves;

        // Extract player color and difficulty from saved game
        const savedColor = game.playerColor as PlayerColor | undefined;
        const savedDifficultyRaw = game.difficulty;
        
        // Validate difficulty is a valid BotDifficulty
        // (analysis mode games may have depth numbers like "10" instead)
        const validDifficulties: BotDifficulty[] = ['easy', 'medium', 'hard'];
        const savedDifficulty = validDifficulties.includes(savedDifficultyRaw as BotDifficulty)
          ? (savedDifficultyRaw as BotDifficulty)
          : 'medium';

        loadGame(
          game.fen,
          parsedMoveHistory,
          savedColor || 'white',
          savedDifficulty,
          parsedTopMoves
        );
      } catch (err) {
        console.error('Error loading saved game:', err);
      } finally {
        setIsLoadingGame(false);
      }
    };

    fetchAndLoadGame();
  }, [loadGameId, engineStatus, loadGame]);

  // Save game modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [gameName, setGameName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getTurn = (fenStr: string) => fenStr.split(' ')[1] === 'w' ? 'white' : 'black';

  const handleSaveGame = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/saved-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gameName.trim() || undefined,
          fen,
          turn: getTurn(fen),
          moveHistory,
          statistics: {
            totalMoves: moveHistory.length,
            blunders: 0,
            mistakes: 0,
            inaccuracies: 0,
            bestMoves: 0,
            whiteCpLosses: [],
            blackCpLosses: [],
          },
          evaluationScore: evaluation,
          gameType: 'vsBot',
          evaluation: evaluation ?? null,
          topMoves: topMoves.length > 0 ? topMoves : null,
          difficulty: difficulty, // 'easy', 'medium', or 'hard'
          playerColor: playerColor, // 'white' or 'black'
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save');
      setSaveSuccess(true);
      setTimeout(() => {
        setShowSaveModal(false);
        setGameName('');
        setSaveSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving game';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const closeSaveModal = () => {
    setShowSaveModal(false);
    setGameName('');
    setSaveError('');
    setSaveSuccess(false);
  };

  // Show loading state when loading a saved game
  if (isLoadingGame || (loadGameId && engineStatus === 'loading' && !hasLoadedRef.current)) {
    return (
      <div className="py-12">
        <Container size="lg">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-3 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-foreground/70">Loading saved game...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <div className="py-12">
        <Container size="lg">
          <GameSetup
            onStartGame={setupGame}
            engineStatus={engineStatus}
            engineError={engineError}
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container size="2xl">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Play vs Bot</h1>
              <p className="text-foreground/70 text-sm mt-1">
                Playing as {playerColor} • {BOT_DIFFICULTY_CONFIG[difficulty]?.label || 'Medium'} difficulty
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowSaveModal(true)}
                className="gap-2"
                disabled={isBotThinking}
                title={isBotThinking ? 'Wait for bot to finish thinking' : undefined}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Game
              </Button>
              {!isLoadedGame && (
                <Button variant="outline" size="sm" onClick={backToSetup}>
                  Change Settings
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Save game modal */}
        <Modal open={showSaveModal} onClose={closeSaveModal}>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent-primary/10 text-accent-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              Save Game
            </div>
          </ModalHeader>
          <ModalBody>
            {saveSuccess ? (
              <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-foreground">Game Saved!</p>
                <p className="text-foreground/60 text-sm mt-1">Your game has been saved successfully</p>
              </div>
            ) : (
              <>
                <label htmlFor="game-name" className="block text-sm font-medium text-foreground/70 mb-2">
                  Game Name
                </label>
                <input
                  id="game-name"
                  className="w-full px-4 py-3 rounded-xl border border-border-default bg-surface-2 text-foreground
                    placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary
                    transition-all"
                  type="text"
                  value={gameName}
                  onChange={e => setGameName(e.target.value)}
                  placeholder="Enter a name (optional)"
                  disabled={saving}
                  autoFocus
                />
                <p className="text-xs text-foreground/50 mt-2">
                  Leave blank for auto-generated name
                </p>
                {saveError && (
                  <div className="mt-4 p-3 rounded-lg bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {saveError}
                  </div>
                )}
              </>
            )}
          </ModalBody>
          {!saveSuccess && (
            <ModalFooter>
              <Button variant="ghost" onClick={closeSaveModal} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveGame} isLoading={saving}>
                Save Game
              </Button>
            </ModalFooter>
          )}
        </Modal>

        {/* Main game layout - 3 columns: Chat | Board | Controls */}
        <div className="grid lg:grid-cols-[280px_1fr_300px] gap-6">
          {/* Left column: AI Chat */}
          <div className="hidden lg:block">
            <AIChatPanel
              messages={chatMessages}
              isLoading={isChatLoading}
              error={chatError}
              className="h-[580px]"
            />
          </div>

          {/* Center column: Evaluation bar + Board */}
          <div className="space-y-4">
            {/* Evaluation bar - ALWAYS VISIBLE */}
            <Card variant="bordered">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <EvaluationBar
                      evaluation={evaluation}
                      mate={mate}
                      orientation={playerColor}
                      depth={depth}
                      targetDepth={20}
                      isAnalyzing={isAnalyzing}
                      size="lg"
                    />
                  </div>
                  <StatusIndicator />
                </div>
              </CardContent>
            </Card>

            {/* Chess board */}
            <Card variant="bordered" padding="lg">
              <PlayBoard />
            </Card>

            {/* Game result display removed: now handled in PlayBoard below the board */}
          </div>

          {/* Right column: Controls and hints */}
          <div className="space-y-4">
            {/* Best moves panel - TOGGLEABLE */}
            <BestMovesPanel
              topMoves={topMoves}
              showMoves={showBestMoves}
              onToggle={toggleBestMoves}
              isAnalyzing={isAnalyzing}
            />

            {/* Move history */}
            <MoveHistoryPanel moves={moveHistory} />
          </div>
        </div>
      </Container>
    </div>
  );
}

function StatusIndicator() {
  const { isPlayerTurn, isBotThinking, gameResult, playerColor } = usePlay();

  if (gameResult.type !== 'ongoing') {
    return (
      <span className="text-sm font-medium text-foreground/60">
        Game Over
      </span>
    );
  }

  if (isBotThinking) {
    return (
      <span className="text-sm font-medium text-accent-warning flex items-center gap-2">
        <span className="w-2 h-2 bg-accent-warning rounded-full animate-pulse" />
        Bot thinking
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-accent-success flex items-center gap-2">
      <span className="w-2 h-2 bg-accent-success rounded-full" />
      {isPlayerTurn ? 'Your turn' : `${playerColor === 'white' ? 'Black' : 'White'}'s turn`}
    </span>
  );
}

interface GameResultCardProps {
  result: ReturnType<typeof usePlay>['gameResult'];
  playerColor: string;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

function GameResultCard({ result, playerColor, onPlayAgain, onNewGame }: GameResultCardProps) {
  let title = '';
  let description = '';
  let titleColor = 'text-foreground';

  if (result.type === 'checkmate') {
    const playerWon = result.winner === playerColor;
    title = playerWon ? 'You Win!' : 'You Lose';
    description = 'Checkmate';
    titleColor = playerWon ? 'text-accent-success' : 'text-accent-danger';
  } else if (result.type === 'draw') {
    title = 'Draw';
    const reasons: Record<string, string> = {
      stalemate: 'By stalemate',
      insufficient: 'Insufficient material',
      threefold: 'Threefold repetition',
      'fifty-move': 'Fifty-move rule',
    };
    description = reasons[result.reason] || 'Game drawn';
    titleColor = 'text-accent-warning';
  }

  return (
    <Card variant="bordered" className="bg-surface-1">
      <CardContent className="p-6 text-center">
        <h2 className={`text-2xl font-bold mb-1 ${titleColor}`}>{title}</h2>
        <p className="text-foreground/70 mb-4">{description}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onNewGame}>
            New Game
          </Button>
          <Button onClick={onPlayAgain}>
            Play Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface MoveHistoryPanelProps {
  moves: string[];
}

function MoveHistoryPanel({ moves }: MoveHistoryPanelProps) {
  if (moves.length === 0) {
    return (
      <Card variant="bordered">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium text-foreground/80 uppercase tracking-wide mb-3">
            Moves
          </h3>
          <p className="text-sm text-foreground/50 text-center py-4">
            No moves yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const movePairs: { number: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <Card variant="bordered">
      <CardContent className="p-4">
        <h3 className="text-base font-semibold text-foreground/90 tracking-wide mb-2">
          <span className="inline-block align-middle mr-2">♟️</span>Moves
        </h3>
        <div className="rounded-lg bg-surface-2/60 border border-border-default px-2 py-2 shadow-inner">
          <div className="flex text-xs font-semibold mb-2 pl-8 pr-2">
            <span className="w-16 text-left text-foreground/60">White</span>
            <span className="w-16 text-left text-foreground/60">Black</span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-border-default">
            {movePairs.map((pair) => (
              <div
                key={pair.number}
                className="flex text-[15px] font-mono items-center py-1 hover:bg-surface-1/60 rounded transition-colors"
              >
                <span className="w-8 text-foreground/40 text-right pr-1">{pair.number}.</span>
                <span className="w-16 text-left text-accent-primary font-medium">{pair.white || ''}</span>
                <span className="w-16 text-left text-accent-secondary font-medium">{pair.black || ''}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
