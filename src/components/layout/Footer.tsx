import Link from 'next/link';
import { Container } from '@/components/ui';

const footerLinks = {
  product: [
    { href: '/analysis', label: 'Analysis Board' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Show my perfect 404 page!' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-surface-1">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold"
              >
                <ChessKingIcon className="h-7 w-7 text-accent-primary" />
                <span>
                  check<span className="text-accent-primary">m</span>
                  <span className="text-accent-secondary">AI</span>te
                </span>
              </Link>
              <p className="mt-4 text-sm text-foreground/60">
                Master your chess game with AI-powered analysis. Get real-time
                insights and improve your play.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-border-default flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-foreground/50">
              © {new Date().getFullYear()} checkmAIte. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/Svetliox/checkmAIte"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/50 hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <GitHubIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
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

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
