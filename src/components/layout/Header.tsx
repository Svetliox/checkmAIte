import Link from 'next/link';
import { Container } from '@/components/ui';
import { Navigation } from './Navigation';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-default bg-background/80 backdrop-blur-lg">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold transition-colors hover:text-accent-primary"
          >
            <ChessKingIcon className="h-8 w-8 text-accent-primary" />
            <span>
              check<span className="text-accent-primary">m</span>
              <span className="text-accent-secondary">AI</span>te
            </span>
          </Link>

          {/* Navigation */}
          <Navigation />
        </div>
      </Container>
    </header>
  );
}

function ChessKingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L12.5 5H13.5V6.5L15 7L14.5 8.5H16.5L16 10H8L7.5 8.5H9.5L9 7L10.5 6.5V5H11.5L12 2Z" />
      <path d="M6 11H18V13H17L16 20H8L7 13H6V11Z" />
      <path d="M5 21H19V23H5V21Z" />
    </svg>
  );
}
