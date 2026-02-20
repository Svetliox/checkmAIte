'use client';

// =============================================================================
// checkmAIte - Client Providers
// =============================================================================
// Wraps the app with client-side context providers
// =============================================================================

import { SessionProvider, useSession } from 'next-auth/react';
import { type ReactNode, useEffect, useRef } from 'react';
import { preloadStockfish } from '@/hooks/useStockfishPreload';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Inner component that handles session-based preloading.
 * Separated to ensure useSession works within SessionProvider.
 */
function StockfishPreloader({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const hasTriggeredPreload = useRef(false);

  useEffect(() => {
    // Preload Stockfish when user becomes authenticated
    if (status === 'authenticated' && !hasTriggeredPreload.current) {
      hasTriggeredPreload.current = true;
      
      // Use requestIdleCallback for non-blocking preload
      const schedulePreload = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 50));
      schedulePreload(() => {
        preloadStockfish();
      });
    }
  }, [status]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <StockfishPreloader>{children}</StockfishPreloader>
    </SessionProvider>
  );
}
