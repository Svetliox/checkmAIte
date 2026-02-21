"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SavedGame } from "@/types";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface SavedGamesListProps {
  games: SavedGame[];
  initialOrder: string;
}

export default function SavedGamesList({ games, initialOrder }: SavedGamesListProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [gameList, setGameList] = useState(games);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'single' | 'all';
    gameId?: string;
    gameName?: string;
  }>({ open: false, type: 'single' });

  // Load game mode selection modal
  const [loadModal, setLoadModal] = useState<{
    open: boolean;
    game: SavedGame | null;
  }>({ open: false, game: null });

  const sortedGames = [...gameList].sort((a, b) => {
    if (order === "asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const openDeleteAllModal = () => {
    setConfirmModal({ open: true, type: 'all' });
  };

  const openDeleteOneModal = (id: string, name: string) => {
    setConfirmModal({ open: true, type: 'single', gameId: id, gameName: name });
  };

  const closeModal = () => {
    setConfirmModal({ open: false, type: 'single' });
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    setError(null);
    try {
      const res = await fetch("/api/saved-game?all=true", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete games');
      setGameList([]);
      closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete games';
      setError(message);
    } finally {
      setDeletingAll(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/saved-game?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete game');
      setGameList(gameList.filter(game => game.id !== id));
      closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete game';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirm = () => {
    if (confirmModal.type === 'all') {
      handleDeleteAll();
    } else if (confirmModal.gameId) {
      handleDeleteOne(confirmModal.gameId);
    }
  };

  const getMoveCount = (moveHistory: string) => {
    try {
      return JSON.parse(moveHistory).length;
    } catch {
      return 0;
    }
  };

  const openLoadModal = (game: SavedGame) => {
    setLoadModal({ open: true, game });
  };

  const closeLoadModal = () => {
    setLoadModal({ open: false, game: null });
  };

  const handleLoadInMode = (mode: 'analysis' | 'play') => {
    if (!loadModal.game) return;
    if (mode === 'analysis') {
      router.push(`/analysis?loadGame=${loadModal.game.id}`);
    } else {
      router.push(`/play?loadGame=${loadModal.game.id}`);
    }
    closeLoadModal();
  };

  return (
    <section className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Saved Games</h1>
            <p className="text-foreground/60 mt-1">
              {gameList.length} {gameList.length === 1 ? 'game' : 'games'} saved
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2">
              <label htmlFor="order-select" className="text-sm font-medium text-foreground/70">
                Sort:
              </label>
              <select
                id="order-select"
                className="bg-surface-2 text-foreground font-medium focus:outline-none cursor-pointer
                  [&>option]:bg-surface-1 [&>option]:text-foreground"
                value={order}
                onChange={e => setOrder(e.target.value)}
                aria-label="Sort saved games"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openDeleteAllModal}
              disabled={deletingAll || gameList.length === 0}
              className="text-accent-danger border-accent-danger/30 hover:bg-accent-danger/10 hover:border-accent-danger"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete All
            </Button>
          </div>
        </div>
      </header>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/30 text-accent-danger flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-auto hover:bg-accent-danger/20 rounded-full p-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Games list */}
      {sortedGames.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-2 flex items-center justify-center">
            <svg className="w-8 h-8 text-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-foreground/60 text-lg">No saved games yet</p>
          <p className="text-foreground/40 text-sm mt-1">
            Save a game from the Analysis Board to see it here
          </p>
          <Link href="/analysis">
            <Button variant="primary" className="mt-6">
              Go to Analysis Board
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4">
          {sortedGames.map(game => (
            <li
              key={game.id}
              className="group relative border border-border-default rounded-xl bg-gradient-to-br from-surface-1 to-surface-2 
                shadow-sm hover:shadow-lg hover:border-accent-primary/30 transition-all duration-200
                focus-within:ring-2 focus-within:ring-accent-primary/50"
            >
              <div className="p-5">
                {/* Top row: Name and actions */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg text-foreground truncate group-hover:text-accent-primary transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-sm text-foreground/50 mt-0.5">
                      {Intl.DateTimeFormat(undefined, { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      }).format(new Date(game.createdAt))}
                    </p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openLoadModal(game)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
                        bg-accent-primary text-white shadow-sm
                        hover:bg-accent-primary/90 hover:shadow-md
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                        transition-all active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Load
                    </button>
                    <button
                      className="p-2 rounded-lg text-foreground/50 hover:text-accent-danger hover:bg-accent-danger/10
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-danger
                        transition-colors disabled:opacity-50"
                      onClick={() => openDeleteOneModal(game.id, game.name)}
                      disabled={deletingId === game.id}
                      aria-label={`Delete ${game.name}`}
                    >
                      {deletingId === game.id ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3/50">
                    <span className={`w-3 h-3 rounded-full ${game.turn === 'white' ? 'bg-white border border-border-default' : 'bg-gray-800'}`} />
                    <span className="text-foreground/70">
                      {game.turn === 'white' ? 'White' : 'Black'} to move
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3/50">
                    <svg className="w-4 h-4 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-foreground/70">
                      {getMoveCount(game.moveHistory)} moves
                    </span>
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm
                    ${game.evaluationScore >= 0 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {game.evaluationScore >= 0 ? '+' : ''}{(game.evaluationScore / 100).toFixed(2)}
                  </div>
                  
                  {/* Game type badge */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                    ${game.gameType === 'vsBot' 
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {game.gameType === 'vsBot' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        vs Bot
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Analysis
                      </>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        onConfirm={handleConfirm}
        onCancel={closeModal}
        title={confirmModal.type === 'all' ? 'Delete All Games' : 'Delete Game'}
        message={
          confirmModal.type === 'all'
            ? `Are you sure you want to delete all ${gameList.length} saved games? This action cannot be undone.`
            : `Are you sure you want to delete "${confirmModal.gameName}"? This action cannot be undone.`
        }
        confirmLabel={confirmModal.type === 'all' ? 'Delete All' : 'Delete'}
        variant="danger"
        isLoading={confirmModal.type === 'all' ? deletingAll : deletingId === confirmModal.gameId}
      />

      {/* Load Mode Selection Modal */}
      <Modal open={loadModal.open} onClose={closeLoadModal} className="max-w-md">
        <ModalHeader>Choose Mode</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {loadModal.game && (
              <div className="p-4 rounded-lg bg-surface-2 border border-border/50">
                <h3 className="font-medium text-foreground">
                  {loadModal.game.name}
                </h3>
                <p className="text-sm text-foreground/50">
                  {Intl.DateTimeFormat(undefined, { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  }).format(new Date(loadModal.game.createdAt))}
                </p>
              </div>
            )}
            
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
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={closeLoadModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </section>
  );
}