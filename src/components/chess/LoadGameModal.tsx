/**
 * Load Game Modal
 * 
 * Displays a list of saved games that the user can select to load.
 * Used in the modes selection page.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '@/components/ui';
import { SavedGame, SavedGameType } from '@/types';

interface LoadGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoadGameModal({ isOpen, onClose }: LoadGameModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [games, setGames] = useState<SavedGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<SavedGame | null>(null);

  useEffect(() => {
    if (isOpen && session?.user) {
      fetchGames();
    }
    if (!isOpen) {
      setSelectedGame(null);
    }
  }, [isOpen, session]);

  const fetchGames = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/saved-game?order=desc');
      if (!response.ok) {
        throw new Error('Failed to fetch saved games');
      }
      const data = await response.json();
      setGames(data.games || []);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load saved games');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadGame = (gameId: string) => {
    router.push(`/analysis?loadGame=${gameId}`);
    onClose();
  };

  const handleSelectGame = (game: SavedGame) => {
    setSelectedGame(game);
  };

  const handleLoadInMode = (mode: 'analysis' | 'play') => {
    if (!selectedGame) return;
    if (mode === 'analysis') {
      router.push(`/analysis?loadGame=${selectedGame.id}`);
    } else {
      router.push(`/play?loadGame=${selectedGame.id}`);
    }
    onClose();
  };

  const handleBackToList = () => {
    setSelectedGame(null);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGameTypeBadge = (gameType?: SavedGameType) => {
    if (gameType === 'vsBot') {
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
          vs Bot
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary">
        Analysis
      </span>
    );
  };

  if (!session?.user) {
    return (
      <Modal open={isOpen} onClose={onClose} className="max-w-lg">
        <ModalHeader>Load Game</ModalHeader>
        <ModalBody>
          <div className="text-center py-8">
            <p className="text-foreground/70 mb-4">
              Please sign in to access your saved games.
            </p>
            <Button onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </div>
        </ModalBody>
      </Modal>
    );
  }

  return (
    <Modal open={isOpen} onClose={onClose} className="max-w-lg">
      <ModalHeader>
        {selectedGame ? 'Choose Mode' : 'Load Game'}
      </ModalHeader>
      <ModalBody>
        {selectedGame ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-surface-2 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground">
                  {selectedGame.name}
                </h3>
                {getGameTypeBadge(selectedGame.gameType)}
              </div>
              <p className="text-sm text-foreground/50">
                {formatDate(selectedGame.createdAt)}
              </p>
            </div>
            
            <p className="text-sm text-foreground/70 text-center">
              How would you like to continue this game?
            </p>
            
            <div className="grid gap-3">
              <button
                onClick={() => handleLoadInMode('analysis')}
                className="w-full p-4 rounded-lg bg-surface-2 hover:bg-surface-2/80 border border-border/50 hover:border-accent-primary/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground group-hover:text-accent-primary transition-colors">
                      Analysis Mode
                    </h4>
                    <p className="text-sm text-foreground/50">
                      Review moves with AI assistance and engine analysis
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleLoadInMode('play')}
                className="w-full p-4 rounded-lg bg-surface-2 hover:bg-surface-2/80 border border-border/50 hover:border-purple-500/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground group-hover:text-purple-400 transition-colors">
                      Play vs Bot
                    </h4>
                    <p className="text-sm text-foreground/50">
                      Continue playing against the computer
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchGames}>
              Try Again
            </Button>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-2 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-foreground/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </div>
            <p className="text-foreground/70 mb-2">No saved games yet</p>
            <p className="text-sm text-foreground/50">
              Start playing or analyzing to save your games!
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => handleSelectGame(game)}
                className="w-full text-left p-4 rounded-lg bg-surface-2 hover:bg-surface-2/80 border border-border/50 hover:border-accent-primary/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground group-hover:text-accent-primary transition-colors truncate">
                        {game.name}
                      </h3>
                      {getGameTypeBadge(game.gameType)}
                    </div>
                    <p className="text-sm text-foreground/50">
                      {formatDate(game.createdAt)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-foreground/40 group-hover:text-accent-primary transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {selectedGame ? (
          <Button variant="ghost" onClick={handleBackToList}>
            Back
          </Button>
        ) : null}
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
