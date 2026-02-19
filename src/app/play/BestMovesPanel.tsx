/**
 * Best Moves Panel Component
 * 
 * Toggleable panel showing the top suggested moves for the player.
 * Can be hidden to make the game more challenging.
 */

'use client';

import { Card, CardContent, Button } from '@/components/ui';
import { type MultiPvLine } from '@/types';
import { cn } from '@/lib/utils';

interface BestMovesPanelProps {
  /** Top moves from engine analysis */
  topMoves: MultiPvLine[];
  /** Whether the panel content is visible */
  showMoves: boolean;
  /** Toggle visibility callback */
  onToggle: () => void;
  /** Whether engine is currently analyzing */
  isAnalyzing?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function BestMovesPanel({
  topMoves,
  showMoves,
  onToggle,
  isAnalyzing = false,
  className,
}: BestMovesPanelProps) {
  return (
    <Card variant="bordered" className={className}>
      <CardContent className="p-4">
        {/* Header with toggle button */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground/80 uppercase tracking-wide">
            Hints
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-xs"
          >
            {showMoves ? 'Hide' : 'Show'}
          </Button>
        </div>

        {/* Moves list */}
        {showMoves ? (
          <div className="space-y-2">
            {topMoves.length > 0 ? (
              topMoves.slice(0, 3).map((line, i) => (
                <MoveRow key={line.rank} rank={i + 1} line={line} />
              ))
            ) : (
              // Loading state
              <LoadingMoves isAnalyzing={isAnalyzing} />
            )}
          </div>
        ) : (
          <div className="text-sm text-foreground/50 text-center py-4">
            Hints are hidden
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Move Row Component
// ============================================

interface MoveRowProps {
  rank: number;
  line: MultiPvLine;
}

function MoveRow({ rank, line }: MoveRowProps) {
  const scoreColor = line.mate 
    ? (line.mate > 0 ? 'text-accent-success' : 'text-accent-danger')
    : line.score > 0 
      ? 'text-accent-success' 
      : line.score < 0 
        ? 'text-accent-danger' 
        : 'text-foreground';

  const scoreText = line.mate 
    ? `M${Math.abs(line.mate)}` 
    : (line.score >= 0 ? '+' : '') + (line.score / 100).toFixed(2);

  return (
    <div className="flex items-center justify-between p-2 rounded bg-surface-2 text-sm">
      <span className="flex items-center gap-2">
        <span className="text-foreground/50 w-4">{rank}.</span>
        <span className="font-mono font-medium">
          {line.sanMoves[0] || line.moves[0]?.slice(0, 4) || '...'}
        </span>
      </span>
      <span className={cn('font-mono', scoreColor)}>
        {scoreText}
      </span>
    </div>
  );
}

// ============================================
// Loading State
// ============================================

interface LoadingMovesProps {
  isAnalyzing: boolean;
}

function LoadingMoves({ isAnalyzing }: LoadingMovesProps) {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-2 rounded bg-surface-2 text-sm"
        >
          <span className="flex items-center gap-2">
            <span className="text-foreground/50 w-4">{i}.</span>
            <span className="font-mono font-medium text-foreground/30">
              {isAnalyzing ? '...' : '—'}
            </span>
          </span>
          <span className="font-mono text-foreground/30">
            —
          </span>
        </div>
      ))}
    </>
  );
}
