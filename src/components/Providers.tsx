'use client';

// =============================================================================
// checkmAIte - Client Providers
// =============================================================================
// Wraps the app with client-side context providers
// =============================================================================

import { SessionProvider } from 'next-auth/react';
import { type ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
