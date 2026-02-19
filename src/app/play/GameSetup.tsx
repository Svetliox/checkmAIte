/**
 * Game Setup Component
 * 
 * Allows user to select their color and difficulty level before starting a game.
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { type PlayerColor, type BotDifficulty, BOT_DIFFICULTY_CONFIG } from '@/types';
import { cn } from '@/lib/utils';

interface GameSetupProps {
  onStartGame: (color: PlayerColor, difficulty: BotDifficulty) => void;
  engineStatus: 'loading' | 'ready' | 'error';
  engineError: string | null;
}

export function GameSetup({ onStartGame, engineStatus, engineError }: GameSetupProps) {
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('white');
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>('medium');

  const handleStart = () => {
    if (engineStatus === 'ready') {
      onStartGame(selectedColor, selectedDifficulty);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card variant="bordered" padding="lg">
        <CardContent className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Play vs Bot</h2>
            <p className="text-foreground/70">
              Choose your settings and challenge Stockfish
            </p>
          </div>

          {/* Engine Status */}
          {engineStatus === 'loading' && (
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-surface-2">
              <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-foreground/70">Loading chess engine...</span>
            </div>
          )}

          {engineStatus === 'error' && (
            <div className="py-3 px-4 rounded-lg bg-accent-danger/10 border border-accent-danger text-accent-danger text-sm">
              Engine Error: {engineError || 'Failed to load'}
            </div>
          )}

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Play as</label>
            <div className="grid grid-cols-2 gap-4">
              <ColorButton
                color="white"
                selected={selectedColor === 'white'}
                onClick={() => setSelectedColor('white')}
              />
              <ColorButton
                color="black"
                selected={selectedColor === 'black'}
                onClick={() => setSelectedColor('black')}
              />
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Difficulty</label>
            <div className="space-y-2">
              {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((diff) => (
                <DifficultyButton
                  key={diff}
                  difficulty={diff}
                  selected={selectedDifficulty === diff}
                  onClick={() => setSelectedDifficulty(diff)}
                />
              ))}
            </div>
          </div>

          {/* Start Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={engineStatus !== 'ready'}
          >
            {engineStatus === 'loading' ? 'Loading...' : 'Start Game'}
          </Button>

          {/* Info */}
          <p className="text-xs text-center text-foreground/50">
            {selectedColor === 'white' 
              ? "You'll make the first move"
              : "Stockfish will make the first move"
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Color Button Component
// ============================================

interface ColorButtonProps {
  color: PlayerColor;
  selected: boolean;
  onClick: () => void;
}

function ColorButton({ color, selected, onClick }: ColorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all',
        selected
          ? 'border-accent-primary bg-accent-primary/10'
          : 'border-border-default bg-surface-1 hover:border-border-hover'
      )}
    >
      {/* Chess piece representation */}
      <div className={cn(
        'w-16 h-16 rounded-lg flex items-center justify-center text-4xl',
        color === 'white' 
          ? 'bg-white text-gray-900 shadow-md' 
          : 'bg-gray-900 text-white'
      )}>
        ♔
      </div>
      <span className={cn(
        'font-medium capitalize',
        selected ? 'text-accent-primary' : 'text-foreground'
      )}>
        {color}
      </span>
    </button>
  );
}

// ============================================
// Difficulty Button Component
// ============================================

interface DifficultyButtonProps {
  difficulty: BotDifficulty;
  selected: boolean;
  onClick: () => void;
}

function DifficultyButton({ difficulty, selected, onClick }: DifficultyButtonProps) {
  const config = BOT_DIFFICULTY_CONFIG[difficulty];
  
  const descriptions: Record<BotDifficulty, string> = {
    easy: 'Good for beginners',
    medium: 'Challenging for casual players',
    hard: 'For experienced players',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left',
        selected
          ? 'border-accent-primary bg-accent-primary/10'
          : 'border-border-default bg-surface-1 hover:border-border-hover'
      )}
    >
      <div>
        <div className={cn(
          'font-medium',
          selected ? 'text-accent-primary' : 'text-foreground'
        )}>
          {config.label}
        </div>
        <div className="text-sm text-foreground/60">
          {descriptions[difficulty]}
        </div>
      </div>
      <div className="text-xs text-foreground/40 font-mono">
        Depth {config.depth}
      </div>
    </button>
  );
}
