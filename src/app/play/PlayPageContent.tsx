/**
 * Play vs Bot Page Content
 * 
 * Main layout for playing against Stockfish with:
 * - Game setup screen
 * - Chess board with controls
 * - Always-visible evaluation bar
 * - Toggleable best moves panel
 * - Game result display
 */

'use client';

import { Container, Card, CardContent, Button } from '@/components/ui';
import { EvaluationBar } from '@/components/chess';
import { PlayProvider, usePlay } from './PlayContext';
import { GameSetup } from './GameSetup';
import { PlayBoard } from './PlayBoard';
import { BestMovesPanel } from './BestMovesPanel';
import { BOT_DIFFICULTY_CONFIG } from '@/types';

/**
 * Main play page with context provider
 */
export function PlayPageContent() {
  return (
    <PlayProvider>
      <PlayLayout />
    </PlayProvider>
  );
}

/**
 * Layout component that consumes play context
 */
function PlayLayout() {
  const {
    phase,
    engineStatus,
    engineError,
    setupGame,
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
  } = usePlay();

  // Setup phase - show game setup screen
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

  // Playing or ended phase - show game UI
  return (
    <div className="py-8">
      <Container size="xl">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Play vs Bot</h1>
              <p className="text-foreground/70 text-sm mt-1">
                Playing as {playerColor} • {BOT_DIFFICULTY_CONFIG[difficulty].label} difficulty
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={backToSetup}>
              Change Settings
            </Button>
          </div>
        </div>

        {/* Main game layout */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Left column: Evaluation bar + Board */}
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

            {/* Game result display */}
            {gameResult.type !== 'ongoing' && (
              <GameResultCard
                result={gameResult}
                playerColor={playerColor}
                onPlayAgain={resetGame}
                onNewGame={backToSetup}
              />
            )}
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

// ============================================
// Status Indicator
// ============================================

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

// ============================================
// Game Result Card
// ============================================

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

// ============================================
// Move History Panel
// ============================================

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

  // Group moves into pairs (white, black)
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
        <h3 className="text-sm font-medium text-foreground/80 uppercase tracking-wide mb-3">
          Moves
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {movePairs.map((pair) => (
            <div key={pair.number} className="flex text-sm font-mono">
              <span className="w-8 text-foreground/50">{pair.number}.</span>
              <span className="w-16">{pair.white || ''}</span>
              <span className="w-16 text-foreground/80">{pair.black || ''}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
