import Link from 'next/link';
import { Container, Button } from '@/components/ui';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-background to-accent-secondary/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-primary/5 rounded-full blur-3xl" />
      </div>

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
              </span>
              Powered by Stockfish
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Master Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
                Chess Game
              </span>
              with AI Analysis
            </h1>

            <p className="mt-6 text-lg text-foreground/70 max-w-xl mx-auto lg:mx-0">
              Get real-time analysis of every move. Understand your strengths,
              identify weaknesses, and elevate your chess strategy with
              world-class AI insights.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/modes">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-border-default pt-8">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-accent-primary">
                  10M+
                </div>
                <div className="text-sm text-foreground/60">Games Analyzed</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-accent-secondary">
                  50K+
                </div>
                <div className="text-sm text-foreground/60">Active Players</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-accent-success">
                  99%
                </div>
                <div className="text-sm text-foreground/60">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Hero illustration - Chess board preview */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-3xl blur-3xl" />
            <div className="relative bg-surface-1 rounded-2xl p-6 border border-border-default shadow-2xl">
              {/* Mini board visualization using CSS grid */}
              <div className="aspect-square w-full max-w-md mx-auto">
                <ChessBoardIllustration />
              </div>
              {/* Analysis overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-surface-2/95 backdrop-blur-sm rounded-lg p-4 border border-border-default">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-foreground/60 uppercase tracking-wide">
                      Best Move
                    </div>
                    <div className="text-lg font-mono font-bold text-accent-success">
                      Nf3 → e5
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-foreground/60 uppercase tracking-wide">
                      Evaluation
                    </div>
                    <div className="text-lg font-mono font-bold text-accent-primary">
                      +0.42
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
}

function ChessBoardIllustration() {
  // Create an 8x8 chess board with pieces
  const board = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '', '♟', '♟', '♟'],
    ['', '', '', '', '♟', '', '', ''],
    ['', '', '', '', '♙', '', '', ''],
    ['', '', '♘', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '', '♙', '♙', '♙'],
    ['♖', '', '♗', '♕', '♔', '♗', '♘', '♖'],
  ];

  return (
    <div className="grid grid-cols-8 grid-rows-7 w-full h-full rounded-lg overflow-hidden">
      {board.flat().map((piece, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const isLight = (row + col) % 2 === 0;
        const isHighlighted =
          (row === 3 && col === 4) || // e4
          (row === 4 && col === 2); // c3 (knight)

        return (
          <div
            key={index}
            className="flex items-center justify-center text-3xl md:text-4xl lg:text-5xl min-h-[48px] min-w-[48px] md:min-h-[56px] md:min-w-[56px] lg:min-h-[64px] lg:min-w-[64px] transition-colors"
            style={{ backgroundColor: isLight ? '#f0d9b5' : '#b58863' }}
            aria-hidden={!piece}
          >
            {piece}
          </div>
        );
      })}
    </div>
  );
}
