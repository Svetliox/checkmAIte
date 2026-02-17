import type { Metadata } from 'next';
import { Container, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { AnalysisBoard } from './AnalysisBoard';

export const metadata: Metadata = {
  title: 'Analysis Board',
  description:
    'Analyze your chess games with AI-powered insights. Get real-time move suggestions and detailed statistics.',
};

/**
 * Analysis Page - Main chess analysis interface
 * 
 * This page provides the full analysis board with move history,
 * evaluation, and statistics panels.
 */
export default function AnalysisPage() {
  return (
    <div className="py-8">
      <Container size="xl">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analysis Board</h1>
          <p className="mt-2 text-foreground/70">
            Play moves and get real-time AI analysis
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Chess board and controls */}
          <div>
            <Card variant="bordered" padding="lg">
              <AnalysisBoard />
            </Card>
          </div>

          {/* Side panels */}
          <div className="space-y-6">
            {/* Evaluation panel */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Evaluation bar */}
                  <div className="relative h-6 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-white transition-all duration-300"
                      style={{ width: '52%' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold">
                      <span className="text-surface-1">+0.3</span>
                    </div>
                  </div>
                  
                  {/* Engine info */}
                  <div className="text-sm text-foreground/60">
                    <div className="flex justify-between">
                      <span>Engine</span>
                      <span className="text-accent-success">Stockfish 16</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Depth</span>
                      <span>20/44</span>
                    </div>
                  </div>

                  {/* Best moves */}
                  <div className="pt-4 border-t border-border-default">
                    <div className="text-xs text-foreground/60 uppercase tracking-wide mb-2">
                      Top Moves
                    </div>
                    <div className="space-y-2">
                      {[
                        { move: 'Nf3', eval: '+0.32', depth: 20 },
                        { move: 'd4', eval: '+0.28', depth: 20 },
                        { move: 'Nc3', eval: '+0.24', depth: 20 },
                      ].map((line, i) => (
                        <div
                          key={line.move}
                          className="flex items-center justify-between p-2 rounded bg-surface-2 text-sm"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-foreground/50 w-4">{i + 1}.</span>
                            <span className="font-mono font-medium">{line.move}</span>
                          </span>
                          <span className="font-mono text-accent-success">
                            {line.eval}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics panel */}
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <StatBox label="Moves" value="0" />
                  <StatBox label="Accuracy" value="—" />
                  <StatBox label="Blunders" value="0" color="text-accent-danger" />
                  <StatBox label="Best Moves" value="0" color="text-accent-success" />
                </div>
                
                <div className="mt-4 p-3 rounded-lg bg-surface-2 text-center text-sm text-foreground/60">
                  Statistics will update as you play moves
                </div>
              </CardContent>
            </Card>

            {/* Coming soon features */}
            <Card variant="bordered" className="bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-accent-primary" />
                  </div>
                  <div>
                    <div className="font-medium">AI Coach Coming Soon</div>
                    <div className="text-sm text-foreground/60">
                      Get personalized improvement tips
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

function StatBox({
  label,
  value,
  color = 'text-foreground',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-surface-2 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-foreground/60 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
