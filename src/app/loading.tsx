import { Container, Button } from '@/components/ui';

export default function Loading() {
  return (
    <div className="py-20">
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-surface-2 rounded-full" />
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
              ♟
            </div>
          </div>
          
          <p className="mt-6 text-foreground/60 animate-pulse">
            Loading...
          </p>
        </div>
      </Container>
    </div>
  );
}
