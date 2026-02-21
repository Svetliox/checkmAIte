'use client';

import Link from 'next/link';
import { Container, Button } from '@/components/ui';
import { ChessBoard } from '@/components/chess';

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-surface-1 to-transparent" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-accent-primary/5 rounded-full blur-3xl translate-x-1/2" />
      </div>

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-2xl blur-2xl -z-10" />
              <div className="bg-surface-1 rounded-2xl p-6 border border-border-default">
                <div className="text-sm text-foreground/60 mb-4 text-center">
                  Try it yourself - make a move!
                </div>
                <ChessBoard
                  boardWidth={400}
                  interactive={true}
                  showCoordinates={true}
                />
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Elevate
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
                Your Chess Game?
              </span>
            </h2>

            <p className="mt-4 text-lg text-foreground/70">
              Join thousands of players who are improving their game with
              AI-powered analysis. Start for free, no credit card required.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Unlimited game analysis',
                'Real-time move suggestions',
                'Detailed accuracy reports',
                'Opening explorer access',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckIcon className="w-5 h-5 text-accent-success flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/analysis">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Analysis
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </div>

            <p className="mt-4 text-sm text-foreground/50">
              No account needed to get started
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
