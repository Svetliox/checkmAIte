/**
 * Analysis Page Client Content
 * 
 * Client-side wrapper that provides AnalysisContext and renders
 * live evaluation data from Stockfish.
 */

'use client';

import { Container, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { AnalysisBoard } from './AnalysisBoard';
import { AnalysisProvider, useAnalysis } from './AnalysisContext';

/**
 * Main analysis page layout with context provider
 */
export function AnalysisPageContent() {
  return (
    <AnalysisProvider>
      <AnalysisLayout />
    </AnalysisProvider>
  );
}

/**
 * Layout component that consumes analysis context
 */
function AnalysisLayout() {
  const { 
    status, 
    error, 
    analysis, 
    statistics, 
    whiteAccuracy, 
    blackAccuracy,
    moveHistory,
  } = useAnalysis();

  return (
    <div className="py-8">
      <Container size="xl">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analysis Board</h1>
          <p className="mt-2 text-foreground/70">
            Play moves and get real-time AI analysis
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-accent-danger/10 border border-accent-danger text-accent-danger">
            Engine Error: {error}
          </div>
        )}

        {/* Main content grid */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Chess board and controls */}
          <div>
            <Card variant="bordered" padding="lg">
              <AnalysisBoard />
            </Card>
          </div>

          {/* Side panels */}
          <div className="space-y-6">
            {/* Evaluation panel */}
            <EvaluationPanel 
              status={status}
              analysis={analysis}
            />

            {/* Statistics panel */}
            <StatisticsPanel 
              statistics={statistics}
              whiteAccuracy={whiteAccuracy}
              blackAccuracy={blackAccuracy}
              totalMoves={moveHistory.length}
            />

            {/* Coming soon features */}
            <Card variant="bordered" className="bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <div className="font-medium">AI Coach Coming Soon</div>
                    <div className="text-sm text-foreground/60">
                      Get personalized improvement tips
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

/**
 * Evaluation Panel - Shows engine analysis results
 */
function EvaluationPanel({ 
  status, 
  analysis 
}: { 
  status: string;
  analysis: ReturnType<typeof useAnalysis>['analysis'];
}) {
  // Format evaluation score
  const formatEval = (score: number, mate: number | null): string => {
    if (mate !== null) {
      return mate > 0 ? `M${mate}` : `M${mate}`;
    }
    // Convert centipawns to pawns
    const pawns = score / 100;
    return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
  };

  // Calculate evaluation bar width (0-100%)
  const getEvalBarWidth = (score: number, mate: number | null): number => {
    if (mate !== null) {
      return mate > 0 ? 100 : 0;
    }
    // Sigmoid-like conversion: score of ±500cp maps to ~10%/90%
    const winProb = 50 + 50 * (2 / (1 + Math.exp(-0.004 * score)) - 1);
    return Math.min(100, Math.max(0, winProb));
  };

  // Get eval color based on advantage
  const getEvalColor = (score: number, mate: number | null): string => {
    if (mate !== null) {
      return mate > 0 ? 'text-accent-success' : 'text-accent-danger';
    }
    if (score > 100) return 'text-accent-success';
    if (score < -100) return 'text-accent-danger';
    return 'text-foreground';
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
          {/* Evaluation bar */}
          <div className="relative h-6 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white transition-all duration-300"
              style={{ width: `${getEvalBarWidth(evalScore, mateIn)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold">
              <span style={{ color: '#00e5ff', textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)' }}>
                {formatEval(evalScore, mateIn)}
              </span>
            </div>
          </div>
          
          {/* Engine info */}
          <div className="text-sm text-foreground/60">
            <div className="flex justify-between">
              <span>Engine</span>
              <span className={status === 'ready' || status === 'analyzing' ? 'text-accent-success' : 'text-foreground/40'}>
                {status === 'loading' ? 'Loading...' : 
                 status === 'error' ? 'Error' : 'Stockfish 18'}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Depth</span>
              <span className="font-mono">
                {depth}/{targetDepth}
                {status === 'analyzing' && (
                  <span className="ml-1 text-accent-primary animate-pulse">•</span>
                )}
              </span>
            </div>
          </div>

          {/* Best moves */}
          <div className="pt-4 border-t border-border-default">
            <div className="text-xs text-foreground/60 uppercase tracking-wide mb-2">
              Top Moves
            </div>
            <div className="space-y-2">
              {topMoves.length > 0 ? (
                topMoves.slice(0, 3).map((line, i) => (
                  <div
                    key={line.rank}
                    className="flex items-center justify-between p-2 rounded bg-surface-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-foreground/50 w-4">{i + 1}.</span>
                      <span className="font-mono font-medium">
                        {line.sanMoves[0] || line.moves[0]?.slice(0, 4) || '...'}
                      </span>
                    </span>
                    <span className={`font-mono ${
                      line.mate ? (line.mate > 0 ? 'text-accent-success' : 'text-accent-danger') :
                      line.score > 0 ? 'text-accent-success' : 
                      line.score < 0 ? 'text-accent-danger' : 'text-foreground'
                    }`}>
                      {line.mate 
                        ? `M${line.mate}` 
                        : (line.score >= 0 ? '+' : '') + (line.score / 100).toFixed(2)
                      }
                    </span>
                  </div>
                ))
              ) : (
                // Loading state
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-surface-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-foreground/50 w-4">{i}.</span>
                      <span className="font-mono font-medium text-foreground/30">
                        {status === 'loading' ? '...' : '—'}
                      </span>
                    </span>
                    <span className="font-mono text-foreground/30">
                      —
                    </span>
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

/**
 * Statistics Panel - Shows game statistics
 */
function StatisticsPanel({
  statistics,
  whiteAccuracy,
  blackAccuracy,
  totalMoves,
}: {
  statistics: ReturnType<typeof useAnalysis>['statistics'];
  whiteAccuracy: number;
  blackAccuracy: number;
  totalMoves: number;
}) {
  // Format accuracy display
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
          <StatBox 
            label="Blunders" 
            value={statistics.blunders.toString()} 
            color={statistics.blunders > 0 ? 'text-accent-danger' : undefined}
          />
          <StatBox 
            label="Best Moves" 
            value={statistics.bestMoves.toString()} 
            color={statistics.bestMoves > 0 ? 'text-accent-success' : undefined}
          />
        </div>
        
        {/* Detailed accuracy by color */}
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
          <div className="mt-4 p-3 rounded-lg bg-surface-2 text-center text-sm text-foreground/60">
            Statistics will update as you play moves
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatBox({
  label,
  value,
  color = 'text-foreground',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-surface-2 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-foreground/60 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
