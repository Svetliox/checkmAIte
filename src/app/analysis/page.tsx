


'use client';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent, Container } from '@/components/ui';
import { AnalysisPageContent } from './AnalysisPageContent';




/**
 * Analysis Page - Mode selection for analysis or play vs bot
 * This is a server component that exports metadata.
 * The actual content is rendered by the AnalysisPageContent client component
 * which provides Stockfish integration and real-time analysis.
 */
export default function AnalysisPage() {
  // Mode selection UI only; board is now at /analysis/board
  return (
    <Container size="md">
      <div className="py-16 flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold mb-2">Choose Analysis Mode</h1>
        <p className="text-lg text-foreground/70 mb-6 text-center max-w-xl">
          Select how you want to use the board: analyze any position with AI, or play a game against the computer with full statistics and evaluation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          {/* Analysis Mode */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Analysis Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-foreground/70">Play moves freely and get real-time AI analysis, move suggestions, and statistics.</p>
              <Link href="/analysis/board" className="w-full">
                <Button variant="primary" size="lg" className="w-full">Start Analysis</Button>
              </Link>
            </CardContent>
          </Card>
          {/* Play vs Bot Mode */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Play vs Bot</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-foreground/70">Play a full game against the computer. Choose your color, make moves, and see live evaluation and stats.</p>
              <Link href="/analysis/play-vs-bot" className="w-full">
                <Button variant="secondary" size="lg" className="w-full">Play vs Bot</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
