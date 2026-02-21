'use client';

import { useEffect } from 'react';
import { Container, Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Error Boundary]', error);
  }, [error]);

  return (
    <div className="py-20">
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-20 h-20 rounded-full bg-accent-danger/10 flex items-center justify-center mb-6">
            <span className="text-4xl">♔</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
          
          <p className="text-foreground/60 max-w-md mb-8">
            We encountered an unexpected error. Don&apos;t worry, your game progress
            is saved locally.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 rounded-lg bg-surface-2 text-left max-w-lg w-full overflow-auto">
              <p className="text-sm font-mono text-accent-danger">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-foreground/50 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={reset}>Try Again</Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
