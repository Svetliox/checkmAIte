'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Card, CardHeader, CardTitle, CardContent, Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';
import { AIChatPanel } from '@/components/chess';
import { AnalysisBoard } from './AnalysisBoard';
import { AnalysisProvider, useAnalysis, type PlayStatistics } from './AnalysisContext';


export function AnalysisPageContent() {
  return (
    <AnalysisProvider>
      <AnalysisLayout />
    </AnalysisProvider>
  );
}

function AnalysisLayout() {
  const searchParams = useSearchParams();
  const loadGameId = searchParams.get('loadGame');
  const hasLoadedRef = useRef(false);
  
  const {
    status,
    error,
    currentFen,
    analysis,
    statistics,
    whiteAccuracy,
    blackAccuracy,
    moveHistory,
    chatMessages,
    isChatLoading,
    chatError,
    loadGame,
  } = useAnalysis();

  // Load game from URL param
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (loadGameId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      setIsLoadingGame(true);
      setLoadError(null);
      
      fetch(`/api/saved-game?id=${loadGameId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.success || !data.game) {
            throw new Error(data.error || 'Game not found');
          }
          const game = data.game;
          const parsedMoveHistory = JSON.parse(game.moveHistory) as string[];
          const parsedStatistics = JSON.parse(game.statistics) as PlayStatistics;
          const parsedTopMoves = game.topMoves ? JSON.parse(game.topMoves) : null;
          loadGame(
            game.fen, 
            parsedMoveHistory, 
            parsedStatistics, 
            game.evaluationScore,
            game.evaluation ?? null,
            parsedTopMoves
          );
        })
        .catch((err: Error) => {
          setLoadError(err.message || 'Failed to load game');
        })
        .finally(() => {
          setIsLoadingGame(false);
        });
    }
  }, [loadGameId, loadGame]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [gameName, setGameName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Determine turn from FEN
  const getTurn = (fen: string) => fen.split(' ')[1] === 'w' ? 'white' : 'black';

  const handleSaveGame = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      // Get analysis depth from localStorage
      const savedDepth = typeof window !== 'undefined' 
        ? localStorage.getItem('checkmaite_analysis_depth') 
        : null;
      const depth = savedDepth ? savedDepth : '10';
      
      const res = await fetch('/api/saved-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gameName.trim() || undefined,
          fen: currentFen,
          turn: getTurn(currentFen),
          moveHistory,
          statistics,
          evaluationScore: analysis?.evaluation ?? 0,
          gameType: 'analysis',
          evaluation: analysis?.evaluation ?? null,
          topMoves: analysis?.topMoves ?? null,
          difficulty: depth,
          playerColor: null, // Not applicable for analysis mode
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save');
      setSaveSuccess(true);
      setTimeout(() => {
        setShowModal(false);
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

  const closeModal = () => {
    setShowModal(false);
    setGameName('');
    setSaveError('');
    setSaveSuccess(false);
  };

  return (
      <div className="py-8">
        <Container size="2xl">
          {/* Loading game overlay */}
          {isLoadingGame && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-surface-1 rounded-2xl shadow-2xl p-8 flex flex-col items-center">
                <svg className="w-12 h-12 animate-spin text-accent-primary mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-lg font-semibold text-foreground">Loading saved game...</p>
              </div>
            </div>
          )}

          {/* Load game error */}
          {loadError && (
            <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/30 text-accent-danger flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Failed to load game: {loadError}</span>
              <button 
                onClick={() => setLoadError(null)} 
                className="ml-auto hover:bg-accent-danger/20 rounded-full p-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Page header with Save button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analysis Board</h1>
              <p className="mt-2 text-foreground/70">
                Play moves and get real-time AI analysis
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              className="gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Game
            </Button>
          </div>

          {/* Save game modal */}
          <Modal open={showModal} onClose={closeModal}>
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
                <Button variant="ghost" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveGame} isLoading={saving}>
                  Save Game
                </Button>
              </ModalFooter>
            )}
          </Modal>
          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-accent-danger/10 border border-accent-danger text-accent-danger">
              Engine Error: {error}
            </div>
          )}
          {/* Main content grid - 3 columns: Chat | Board | Panels */}
          <div className="grid lg:grid-cols-[280px_1fr_350px] gap-6">
            {/* Left column: AI Chat */}
            <div className="hidden lg:block">
              <AIChatPanel
                messages={chatMessages}
                isLoading={isChatLoading}
                error={chatError}
                className="h-[600px]"
              />
            </div>
            {/* Center column: Chess board */}
            <div className="flex justify-center">
              <Card variant="bordered" padding="lg" className="flex-shrink-0">
                <AnalysisBoard />
              </Card>
            </div>
            {/* Right column: Evaluation and Statistics panels */}
            <div className="space-y-6">
              <EvaluationPanel 
                status={status}
                analysis={analysis}
              />
              <StatisticsPanel 
                statistics={statistics}
                whiteAccuracy={whiteAccuracy}
                blackAccuracy={blackAccuracy}
                totalMoves={moveHistory.length}
              />
            </div>
          </div>
        </Container>
      </div>
  );
}

function EvaluationPanel({ 
  status, 
  analysis 
}: { 
  status: string;
  analysis: ReturnType<typeof useAnalysis>['analysis'];
}) {

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
    // Sigmoid-like conversion: score of ±500cp maps to ~10%/90%
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
