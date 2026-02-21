'use client';

import { cn } from '@/lib/utils';
import type { AnalyzedMove, GameHistoryEntry, MoveClassification } from '@/types';

interface MoveHistoryProps {
  history: GameHistoryEntry[];
  selectedMoveIndex?: number;
  onMoveClick?: (moveIndex: number) => void;
  showEvaluation?: boolean;
  maxHeight?: string;
}

export function MoveHistory({
  history,
  selectedMoveIndex,
  onMoveClick,
  showEvaluation = true,
  maxHeight = '400px',
}: MoveHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-foreground/50 text-sm">
        No moves yet. Start playing to see the move history.
      </div>
    );
  }

  return (
    <div
      className="overflow-y-auto"
      style={{ maxHeight }}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface-1 border-b border-border-default">
          <tr>
            <th className="px-2 py-2 text-left font-medium text-foreground/70 w-10">
              #
            </th>
            <th className="px-2 py-2 text-left font-medium text-foreground/70">
              White
            </th>
            <th className="px-2 py-2 text-left font-medium text-foreground/70">
              Black
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, index) => (
            <tr key={entry.moveNumber} className="border-b border-border-default/50">
              <td className="px-2 py-1.5 text-foreground/50">
                {entry.moveNumber}
              </td>
              <td className="px-2 py-1.5">
                {entry.whiteMove && (
                  <MoveCell
                    move={entry.whiteMove}
                    isSelected={selectedMoveIndex === index * 2}
                    showEvaluation={showEvaluation}
                    onClick={() => onMoveClick?.(index * 2)}
                  />
                )}
              </td>
              <td className="px-2 py-1.5">
                {entry.blackMove && (
                  <MoveCell
                    move={entry.blackMove}
                    isSelected={selectedMoveIndex === index * 2 + 1}
                    showEvaluation={showEvaluation}
                    onClick={() => onMoveClick?.(index * 2 + 1)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface MoveCellProps {
  move: AnalyzedMove;
  isSelected?: boolean;
  showEvaluation?: boolean;
  onClick?: () => void;
}

function MoveCell({ move, isSelected, showEvaluation, onClick }: MoveCellProps) {
  const classificationColors: Record<MoveClassification, string> = {
    best: 'text-accent-success',
    excellent: 'text-accent-success/80',
    good: 'text-foreground',
    inaccuracy: 'text-accent-warning',
    mistake: 'text-orange-500',
    blunder: 'text-accent-danger',
    book: 'text-accent-secondary',
  };

  const classificationIcons: Record<MoveClassification, string> = {
    best: '!!',
    excellent: '!',
    good: '',
    inaccuracy: '?!',
    mistake: '?',
    blunder: '??',
    book: '📖',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2 py-0.5 rounded transition-colors text-left w-full',
        isSelected
          ? 'bg-accent-primary/20 text-accent-primary'
          : 'hover:bg-surface-2',
        classificationColors[move.classification]
      )}
    >
      <span className="font-mono">
        {move.move.san}
        {classificationIcons[move.classification] && (
          <span className="ml-0.5 text-xs">
            {classificationIcons[move.classification]}
          </span>
        )}
      </span>
      {showEvaluation && (
        <span className="ml-2 text-xs text-foreground/50">
          {move.evaluation > 0 ? '+' : ''}
          {(move.evaluation / 100).toFixed(2)}
        </span>
      )}
    </button>
  );
}

// Export a demo history for testing
export function createDemoHistory(): GameHistoryEntry[] {
  return [
    {
      moveNumber: 1,
      whiteMove: {
        move: { from: 'e2', to: 'e4', san: 'e4' },
        position: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        classification: 'book',
        evaluation: 20,
        bestMove: { from: 'e2', to: 'e4', san: 'e4' },
        centipawnLoss: 0,
      },
      blackMove: {
        move: { from: 'e7', to: 'e5', san: 'e5' },
        position: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
        classification: 'book',
        evaluation: 15,
        bestMove: { from: 'e7', to: 'e5', san: 'e5' },
        centipawnLoss: 0,
      },
    },
    {
      moveNumber: 2,
      whiteMove: {
        move: { from: 'g1', to: 'f3', san: 'Nf3' },
        position: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
        classification: 'best',
        evaluation: 25,
        bestMove: { from: 'g1', to: 'f3', san: 'Nf3' },
        centipawnLoss: 0,
      },
      blackMove: {
        move: { from: 'b8', to: 'c6', san: 'Nc6' },
        position: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        classification: 'good',
        evaluation: 20,
        bestMove: { from: 'b8', to: 'c6', san: 'Nc6' },
        centipawnLoss: 5,
      },
    },
  ];
}
