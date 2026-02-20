/**
 * Stockfish Preload Hook
 * 
 * Provides a way to preload the Stockfish engine before it's needed.
 * Triggered on user login to ensure engine is ready when user navigates to /modes.
 */

'use client';

import { useEffect, useRef } from 'react';
import { initStockfish, isEngineReady } from '@/lib/chess/stockfish';

/**
 * Preload Stockfish engine silently in the background.
 * Safe to call multiple times - will only initialize once.
 */
export async function preloadStockfish(): Promise<void> {
  // Skip if already ready
  if (isEngineReady()) {
    console.log('[StockfishPreload] Engine already ready, skipping preload');
    return;
  }

  console.log('[StockfishPreload] Starting background preload...');
  
  try {
    await initStockfish({
      depth: 20,
      multiPv: 3,
    });
    console.log('[StockfishPreload] Preload complete');
  } catch (error) {
    // Silently log - preload failures shouldn't interrupt the user
    console.warn('[StockfishPreload] Preload failed (will retry on /modes):', error);
  }
}

/**
 * React hook that preloads Stockfish when a condition is met.
 * 
 * @param shouldPreload - Whether to trigger preloading (e.g., user is authenticated)
 */
export function useStockfishPreload(shouldPreload: boolean): void {
  const hasPreloaded = useRef(false);

  useEffect(() => {
    // Only preload once per session
    if (!shouldPreload || hasPreloaded.current) {
      return;
    }

    // Skip if already ready (e.g., from previous navigation)
    if (isEngineReady()) {
      hasPreloaded.current = true;
      return;
    }

    hasPreloaded.current = true;
    
    // Use requestIdleCallback for non-blocking preload, fallback to setTimeout
    const schedulePreload = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
    
    schedulePreload(() => {
      preloadStockfish();
    });
  }, [shouldPreload]);
}
