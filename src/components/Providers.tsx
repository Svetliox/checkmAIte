
'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { type ReactNode, useEffect, useRef } from 'react';
import { preloadStockfish } from '@/hooks/useStockfishPreload';

interface ProvidersProps {
  children: ReactNode;
}

function StockfishPreloader({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const hasTriggeredPreload = useRef(false);

  useEffect(() => {
    if (status === 'authenticated' && !hasTriggeredPreload.current) {
      hasTriggeredPreload.current = true;
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
