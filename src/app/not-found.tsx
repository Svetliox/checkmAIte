import Link from 'next/link';
import { Container, Button } from '@/components/ui';

/**
 * 404 Not Found page
 * Displayed when a route doesn't exist
 */
export default function NotFound() {
  return (
    <div className="py-20">
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          {/* Chess-themed 404 */}
          <div className="relative mb-8">
            <div className="text-8xl font-bold text-surface-2">404</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">
              ♚
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          
          <p className="text-foreground/60 max-w-md mb-8">
            Looks like this move leads nowhere. The page you&apos;re looking for
            doesn&apos;t exist or has been moved to a different square.
          </p>

          {/* Chess-themed suggestions */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <SuggestionCard
              icon="♟"
              title="Start Fresh"
              description="Begin a new analysis"
              href="/analysis"
            />
            <SuggestionCard
              icon="♜"
              title="Go Home"
              description="Return to the homepage"
              href="/"
            />
          </div>

          <Link href="/">
            <Button size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}

function SuggestionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="p-4 rounded-xl bg-surface-1 border border-border-default hover:border-accent-primary transition-colors w-40"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-foreground/60">{description}</div>
    </Link>
  );
}
