/**
 * Modes Selection Page Content
 * 
 * Allows users to choose between Analysis mode and Play vs Bot mode.
 * Pre-initializes Stockfish so it's ready when user enters Play mode.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Card, CardContent } from '@/components/ui';
import { initStockfish, isEngineReady } from '@/lib/chess/stockfish';

export function ModesPageContent() {
  // Check if engine is already ready (from previous navigation)
  const [engineStatus, setEngineStatus] = useState<'loading' | 'ready' | 'error'>(() => {
    const alreadyReady = isEngineReady();
    console.log('[ModesPage] Initial render - isEngineReady():', alreadyReady);
    return alreadyReady ? 'ready' : 'loading';
  });

  // Pre-initialize Stockfish when modes page loads
  useEffect(() => {
    console.log('[ModesPage] useEffect running - isEngineReady():', isEngineReady());
    
    // Skip if already ready
    if (isEngineReady()) {
      console.log('[ModesPage] Engine already ready, skipping init');
      setEngineStatus('ready');
      return;
    }

    console.log('[ModesPage] Starting Stockfish initialization...');
    let mounted = true;

    initStockfish({
      depth: 20,
      multiPv: 3,
    }).then(() => {
      console.log('[ModesPage] Stockfish initialized successfully at', new Date().toISOString());
      if (mounted) {
        setEngineStatus('ready');
      }
    }).catch((err) => {
      console.error('[ModesPage] Failed to initialize Stockfish:', err);
      if (mounted) {
        setEngineStatus('error');
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const isEngineLoading = engineStatus === 'loading';
  console.log('[ModesPage] Rendering with engineStatus:', engineStatus, 'isEngineLoading:', isEngineLoading);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center">
      <Container size="lg">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Mode</h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Analyze your games with powerful AI insights, or test your skills against Stockfish.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Analysis Mode Card */}
          <Link href="/analysis" className="block group">
            <Card 
              variant="bordered" 
              className="h-full transition-all duration-300 hover:border-accent-primary hover:shadow-lg hover:shadow-accent-primary/10 group-hover:scale-[1.02]"
            >
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center mb-6">
                    <svg
                      className="w-10 h-10 text-accent-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-accent-primary transition-colors">
                    Analysis Mode
                  </h2>
                  
                  {/* Description */}
                  <p className="text-foreground/70 mb-6">
                    Get real-time engine evaluation, explore variations, and understand the best moves in any position.
                  </p>
                  
                  {/* Features */}
                  <ul className="text-sm text-foreground/60 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckIcon />
                      <span>Real-time Stockfish analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon />
                      <span>Move accuracy tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon />
                      <span>Top 3 best moves display</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Play vs Bot Card */}
          <div className="relative">
            {/* Loading indicator above card */}
            {isEngineLoading && (
              <div className="absolute -top-8 left-0 right-0 flex items-center justify-center gap-2 text-sm text-foreground/60">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Starting chess engine...</span>
              </div>
            )}

            {isEngineLoading ? (
              <div className="cursor-not-allowed">
                <Card 
                  variant="bordered" 
                  className="h-full opacity-50 grayscale"
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-secondary/20 to-accent-warning/20 flex items-center justify-center mb-6">
                        <svg
                          className="w-10 h-10 text-accent-secondary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-2xl font-bold mb-3">
                        Play vs Bot
                      </h2>
                      
                      {/* Description */}
                      <p className="text-foreground/70 mb-6">
                        Challenge the Stockfish engine at different difficulty levels. Choose your color and test your skills!
                      </p>
                      
                      {/* Features */}
                      <ul className="text-sm text-foreground/60 space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckIcon />
                          <span>Play as White or Black</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckIcon />
                          <span>Easy, Medium, Hard difficulty</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckIcon />
                          <span>Real-time evaluation bar</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Link href="/play" className="block group">
                <Card 
                  variant="bordered" 
                  className="h-full transition-all duration-300 hover:border-accent-secondary hover:shadow-lg hover:shadow-accent-secondary/10 group-hover:scale-[1.02]"
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                      {/* Icon */}
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-secondary/20 to-accent-warning/20 flex items-center justify-center mb-6">
                        <svg
                          className="w-10 h-10 text-accent-secondary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-2xl font-bold mb-3 group-hover:text-accent-secondary transition-colors">
                        Play vs Bot
                      </h2>
                      
                      {/* Description */}
                      <p className="text-foreground/70 mb-6">
                        Challenge the Stockfish engine at different difficulty levels. Choose your color and test your skills!
                      </p>
                      
                      {/* Features */}
                      <ul className="text-sm text-foreground/60 space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckIcon />
                          <span>Play as White or Black</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckIcon />
                          <span>Easy, Medium, Hard difficulty</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckIcon />
                          <span>Real-time evaluation bar</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center mt-12 text-sm text-foreground/50">
          You can switch between modes anytime using the navigation menu.
        </p>
      </Container>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg 
      className="w-4 h-4 text-accent-success" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 13l4 4L19 7" 
      />
    </svg>
  );
}
