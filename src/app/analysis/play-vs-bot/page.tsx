

'use client';
import { useState } from 'react';
import { PlayVsBotProvider, usePlayVsBot } from './PlayVsBotContext';
import { ChessBoard } from '@/components/chess';
import { Button, Card, CardHeader, CardTitle, CardContent, Container } from '@/components/ui';



export default function PlayVsBotPage() {
  return (
    <PlayVsBotProvider>
      <Container size="xl">
        <div className="py-12 flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold mb-2">Play vs Bot</h1>
          <p className="text-lg text-foreground/70 mb-6 text-center max-w-xl">
            Play a full chess game against the computer. Choose your color, make moves, and see live evaluation and stats.
          </p>
          <PlayVsBotMain />
        </div>
      </Container>
    </PlayVsBotProvider>
  );
}

function PlayVsBotMain() {
  const {
    userColor,
    setUserColor,
    currentFen,
    moveHistory,
    isBotTurn,
    makeUserMove,
    resetGame,
    gameOver,
    winner,
    status,
    analysis,
    statistics,
    whiteAccuracy,
    blackAccuracy,
  } = usePlayVsBot();
  const [colorChosen, setColorChosen] = useState(false);

  // Color selection UI
  if (!colorChosen) {
    return (
      <Card variant="bordered" className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Choose Your Color</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 items-center">
            <Button variant="primary" size="lg" className="w-full" onClick={() => { setUserColor('white'); setColorChosen(true); }}>
              Play as White
            </Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => { setUserColor('black'); setColorChosen(true); }}>
              Play as Black
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Board move handler
  const handleMove = (move: { from: string; to: string; san: string }) => {
    if (isBotTurn || gameOver) return;
    makeUserMove(move.san);
  };

  // Board orientation
  const orientation = userColor;

  // Game status
  let gameStatus = '';
  if (gameOver) {
    if (winner === 'draw') gameStatus = 'Draw!';
    else if (winner) gameStatus = `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`;
  } else if (isBotTurn) {
    gameStatus = 'Bot thinking...';
  } else {
    gameStatus = 'Your move';
  }

  return (
    <div className="grid lg:grid-cols-[1fr_350px] gap-6 w-full">
      {/* Chess board and controls */}
      <div>
        <Card variant="bordered" padding="lg">
          <div className="flex flex-col items-center gap-4">
            <ChessBoard
              position={currentFen}
              orientation={orientation}
              interactive={!isBotTurn && !gameOver}
              boardWidth={520}
              onMove={handleMove}
              showCoordinates={true}
              showControls={true}
              onNewGame={resetGame}
              canUndo={false}
            />
            <div className="text-sm font-medium text-foreground/80">{gameStatus}</div>
            {gameOver && (
              <Button variant="primary" size="md" onClick={resetGame}>New Game</Button>
            )}
          </div>
        </Card>
        {/* Move history */}
        {moveHistory.length > 0 && (
          <div className="w-full max-w-md mt-6">
            <div className="text-sm text-foreground/60 mb-2">Move History</div>
            <div className="p-3 rounded-lg bg-surface-2 font-mono text-sm overflow-x-auto whitespace-normal break-words" style={{ maxHeight: '120px' }}>
              {moveHistory.map((move, i) => (
                <span key={i} className="inline-block max-w-[80px] truncate align-top">
                  {i % 2 === 0 && (
                    <span className="text-foreground/50 mr-1">{Math.floor(i / 2) + 1}.</span>
                  )}
                  <span className="mr-2">{move}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Side panels */}
      <div className="space-y-6">
        <EvaluationPanel status={status} analysis={analysis} />
        <StatisticsPanel statistics={statistics} whiteAccuracy={whiteAccuracy} blackAccuracy={blackAccuracy} totalMoves={moveHistory.length} />
      </div>
    </div>
  );
}

// Reuse evaluation/statistics panels from analysis mode
function EvaluationPanel({ status, analysis }: { status: string; analysis: any }) {
  // Format evaluation score
  const formatEval = (score: number, mate: number | null): string => {
    if (mate !== null) {
      return mate > 0 ? `M${mate}` : `M${mate}`;
    }
    const pawns = score / 100;
    return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
  };
  const getEvalBarWidth = (score: number, mate: number | null): number => {
    if (mate !== null) {
      return mate > 0 ? 100 : 0;
    }
    const winProb = 50 + 50 * (2 / (1 + Math.exp(-0.004 * score)) - 1);
    return Math.min(100, Math.max(0, winProb));
  };
  const evalScore = analysis?.evaluation || 0;
  const mateIn = analysis?.mate || null;
  const depth = analysis?.depth || 0;
  const targetDepth = analysis?.targetDepth || 20;
  const topMoves = analysis?.topMoves || [];
  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>Evaluation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative h-6 bg-surface-2 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-white transition-all duration-300" style={{ width: `${getEvalBarWidth(evalScore, mateIn)}%` }} />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold">
              <span style={{ color: '#00e5ff', textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)' }}>{formatEval(evalScore, mateIn)}</span>
            </div>
          </div>
          <div className="text-sm text-foreground/60">
            <div className="flex justify-between">
              <span>Engine</span>
              <span className={status === 'ready' || status === 'analyzing' ? 'text-accent-success' : 'text-foreground/40'}>
                {status === 'loading' ? 'Loading...' : status === 'error' ? 'Error' : 'Stockfish 18'}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Depth</span>
              <span className="font-mono">{depth}/{targetDepth}{status === 'analyzing' && (<span className="ml-1 text-accent-primary animate-pulse">•</span>)}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-border-default">
            <div className="text-xs text-foreground/60 uppercase tracking-wide mb-2">Top Moves</div>
            <div className="space-y-2">
              {topMoves.length > 0 ? (
                topMoves.slice(0, 3).map((line: any, i: number) => (
                  <div key={line.rank} className="flex items-center justify-between p-2 rounded bg-surface-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-foreground/50 w-4">{i + 1}.</span>
                      <span className="font-mono font-medium">{line.sanMoves[0] || line.moves[0]?.slice(0, 4) || '...'}</span>
                    </span>
                    <span className={`font-mono ${line.mate ? (line.mate > 0 ? 'text-accent-success' : 'text-accent-danger') : line.score > 0 ? 'text-accent-success' : line.score < 0 ? 'text-accent-danger' : 'text-foreground'}`}>
                      {line.mate ? `M${line.mate}` : (line.score >= 0 ? '+' : '') + (line.score / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-surface-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-foreground/50 w-4">{i}.</span>
                      <span className="font-mono font-medium text-foreground/30">...</span>
                    </span>
                    <span className="font-mono text-foreground/30">—</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatisticsPanel({ statistics, whiteAccuracy, blackAccuracy, totalMoves }: { statistics: any; whiteAccuracy: number; blackAccuracy: number; totalMoves: number; }) {
  const formatAccuracy = (): string => {
    if (totalMoves === 0) return '—';
    const avg = (whiteAccuracy + blackAccuracy) / 2;
    return `${avg.toFixed(1)}%`;
  };
  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Moves" value={totalMoves.toString()} />
          <StatBox label="Accuracy" value={formatAccuracy()} />
          <StatBox label="Blunders" value={statistics.blunders.toString()} color={statistics.blunders > 0 ? 'text-accent-danger' : undefined} />
          <StatBox label="Best Moves" value={statistics.bestMoves.toString()} color={statistics.bestMoves > 0 ? 'text-accent-success' : undefined} />
        </div>
        {totalMoves > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 p-3 rounded-lg bg-surface-2">
            <div className="text-center">
              <div className="text-xs text-foreground/60 mb-1">White</div>
              <div className="font-bold">{whiteAccuracy.toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-foreground/60 mb-1">Black</div>
              <div className="font-bold">{blackAccuracy.toFixed(1)}%</div>
            </div>
          </div>
        )}
        {totalMoves === 0 && (
          <div className="mt-4 p-3 rounded-lg bg-surface-2 text-center text-sm text-foreground/60">Statistics will update as you play moves</div>
        )}
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value, color = 'text-foreground' }: { label: string; value: string; color?: string; }) {
  return (
    <div className={`p-3 rounded-lg bg-surface-2 text-center`}>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-foreground/60 uppercase tracking-wide">{label}</div>
    </div>
  );
}