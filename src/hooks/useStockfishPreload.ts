

'use client';

import { useEffect, useRef } from 'react';
import { initStockfish, isEngineReady } from '@/lib/chess/stockfish';

export async function preloadStockfish(): Promise<void> {

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
    console.warn('[StockfishPreload] Preload failed (will retry on /modes):', error);
  }
}

export function useStockfishPreload(shouldPreload: boolean): void {
  const hasPreloaded = useRef(false);

  useEffect(() => {
    if (!shouldPreload || hasPreloaded.current) {
      return;
    }
    if (isEngineReady()) {
      hasPreloaded.current = true;
      return;
    }
    hasPreloaded.current = true;
    const schedulePreload = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
    schedulePreload(() => {
      preloadStockfish();
    });
  }, [shouldPreload]);
}
