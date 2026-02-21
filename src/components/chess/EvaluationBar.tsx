

'use client';

import { cn } from '@/lib/utils';

interface EvaluationBarProps {
  evaluation: number;
  mate: number | null;
  orientation?: 'white' | 'black';
  depth?: number;
  targetDepth?: number;
  isAnalyzing?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function formatEval(score: number, mate: number | null): string {
  if (mate !== null) {
    return mate > 0 ? `M${mate}` : `M${Math.abs(mate)}`;
  }
  // Convert centipawns to pawns
  const pawns = score / 100;
  return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
}

function getEvalBarWidth(score: number, mate: number | null): number {
  if (mate !== null) {
    return mate > 0 ? 100 : 0;
  }
  // Sigmoid-like conversion: score of ±500cp maps to ~10%/90%
  const winProb = 50 + 50 * (2 / (1 + Math.exp(-0.004 * score)) - 1);
  return Math.min(100, Math.max(0, winProb));
}

export function EvaluationBar({
  evaluation,
  mate,
  orientation = 'white',
  depth,
  targetDepth,
  isAnalyzing = false,
  size = 'md',
  className,
}: EvaluationBarProps) {
  const barWidth = getEvalBarWidth(evaluation, mate);
  const evalText = formatEval(evaluation, mate);
  
  const adjustedBarWidth = orientation === 'black' ? 100 - barWidth : barWidth;
  
  const sizeClasses = {
    sm: 'h-4 text-xs',
    md: 'h-6 text-sm',
    lg: 'h-8 text-base',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Evaluation bar */}
      <div className={cn(
        'relative bg-surface-2 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className="absolute inset-y-0 left-0 bg-white transition-all duration-300"
          style={{ width: `${adjustedBarWidth}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold">
          {/* Use cyan color matching the analysis board */}
          <span 
            style={{ 
              color: '#00e5ff',
              textShadow: '0 0 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)' 
            }}
          >
            {evalText}
          </span>
        </div>
      </div>
      
      {/* Depth indicator (optional) */}
      {depth !== undefined && targetDepth !== undefined && (
        <div className="flex justify-between text-xs text-foreground/60">
          <span>Depth</span>
          <span className="font-mono">
            {depth}/{targetDepth}
            {isAnalyzing && (
              <span className="ml-1 text-accent-primary animate-pulse">•</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
