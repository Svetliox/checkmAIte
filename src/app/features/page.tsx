import { Container, Card, CardContent } from '@/components/ui';

export default function FeaturesPage() {
  return (
    <Container className="py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Your Complete Chess Companion
        </h1>
        <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
          Whether you&apos;re learning your first opening or perfecting endgame technique, checkmAIte gives you everything you need to play, analyze, and improve—all in one place.
        </p>
      </div>

      <div className="space-y-8">
        {/* Hero Feature */}
        <Card className="border-2 border-accent-primary/30 bg-gradient-to-br from-surface-2 to-surface-1">
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-purple-500 flex items-center justify-center text-3xl">
                🧠
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">AI-Powered Chess Coach</h2>
                <p className="text-lg text-foreground/80">
                  Get personalized insights and friendly commentary throughout your games. Our AI assistant analyzes your moves and provides helpful tips in plain language—no chess jargon required.
                </p>
              </div>
            </div>
            <div className="pl-20 space-y-2 text-foreground/70">
              <p>✓ Receive strategic advice every few moves</p>
              <p>✓ Understand why moves are good or bad</p>
              <p>✓ Learn patterns and tactics naturally through play</p>
            </div>
          </CardContent>
        </Card>

        {/* Game Modes */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:border-accent-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🎮</span>
                <h2 className="text-2xl font-bold">Play Against the Computer</h2>
              </div>
              <p className="text-foreground/80 mb-4">
                Challenge our chess engine at your own pace. Choose your difficulty level, pick your color, and start playing. Perfect for practice or when you need a reliable opponent.
              </p>
              <ul className="space-y-2 text-foreground/70">
                <li>• Multiple difficulty levels from beginner to master</li>
                <li>• Play as White or Black</li>
                <li>• Instant move feedback and position evaluation</li>
                <li>• Save and resume games anytime</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:border-accent-secondary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🔍</span>
                <h2 className="text-2xl font-bold">Deep Game Analysis</h2>
              </div>
              <p className="text-foreground/80 mb-4">
                Review any game move by move with professional-grade analysis tools. See what you missed, explore variations, and understand where critical moments happened.
              </p>
              <ul className="space-y-2 text-foreground/70">
                <li>• Move-by-move position evaluation</li>
                <li>• Identify mistakes, blunders, and brilliancies</li>
                <li>• Explore alternative lines and continuations</li>
                <li>• Visual evaluation bar showing position strength</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Power Features */}
        <Card className="bg-gradient-to-br from-surface-1 to-surface-2">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Powerful Features for Serious Players</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">⚙️</div>
                <h3 className="text-xl font-semibold mb-2">Customizable Analysis</h3>
                <p className="text-foreground/70">
                  Control how deep the engine thinks. Adjust analysis depth from quick evaluations (5 moves ahead) to tournament-level depth (25+ moves) based on your needs.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">💾</div>
                <h3 className="text-xl font-semibold mb-2">Save & Load Games</h3>
                <p className="text-foreground/70">
                  Never lose a game in progress. Save your matches, come back anytime, and build your personal game library. Review past games to track improvement.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="text-xl font-semibold mb-2">Personalize Your Board</h3>
                <p className="text-foreground/70">
                  Choose between classic and modern board themes. Customize your experience to match your style and make the game visually yours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Tools */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">📊</span>
                <h2 className="text-2xl font-bold">Real-Time Statistics</h2>
              </div>
              <p className="text-foreground/80 mb-4">
                Track your performance with detailed stats. See your accuracy, spot patterns in your play, and monitor how you&apos;re improving over time.
              </p>
              <ul className="space-y-2 text-foreground/70">
                <li>• Move accuracy percentage</li>
                <li>• Opening repertoire tracking</li>
                <li>• Mistake frequency analysis</li>
                <li>• Performance trends over time</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🎯</span>
                <h2 className="text-2xl font-bold">Best Moves Panel</h2>
              </div>
              <p className="text-foreground/80 mb-4">
                See the top moves for any position instantly. Compare your choice with what the engine recommends and understand the differences in evaluation.
              </p>
              <ul className="space-y-2 text-foreground/70">
                <li>• Top 3 move suggestions ranked by strength</li>
                <li>• Evaluation scores for each option</li>
                <li>• Detailed move notation</li>
                <li>• Compare alternatives side by side</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stockfish Engine */}
        <Card className="border-2 border-accent-success/30">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-success to-emerald-600 flex items-center justify-center text-4xl">
                  ⚡
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Powered by Stockfish</h2>
                <p className="text-lg text-foreground/80 mb-4">
                  Under the hood, checkmAIte uses <strong>Stockfish</strong>—the world&apos;s strongest open-source chess engine. With an estimated rating over 3500 ELO, it&apos;s stronger than any human grandmaster.
                </p>
                <p className="text-foreground/70">
                  This means you get world-class analysis for every position, accurate evaluations, and suggestions that rival professional commentary. Best of all, it runs right in your browser—no downloads, no installations, just pure chess power.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Choose checkmAIte */}
        <Card className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Why Players Love checkmAIte</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-sm text-foreground/70">Instant analysis and smooth gameplay with no lag</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🎓</div>
                <h3 className="font-semibold mb-2">Learn as You Play</h3>
                <p className="text-sm text-foreground/70">Improve naturally with contextual feedback</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-semibold mb-2">Your Data, Your Control</h3>
                <p className="text-sm text-foreground/70">Secure account with customizable preferences</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🌐</div>
                <h3 className="font-semibold mb-2">Play Anywhere</h3>
                <p className="text-sm text-foreground/70">Works perfectly on desktop, tablet, or mobile</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-2 border-accent-primary bg-gradient-to-br from-surface-2 via-accent-primary/5 to-surface-2">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Elevate Your Chess Game?</h2>
            <p className="text-lg text-foreground/70 mb-6 max-w-2xl mx-auto">
              Join chess players around the world who are improving their skills with checkmAIte. Start playing smarter today—completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/play"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-accent-primary hover:bg-accent-primary/90 rounded-lg transition-colors"
              >
                Start Playing Now
              </a>
              <a
                href="/analysis"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-foreground border-2 border-foreground/20 hover:border-accent-primary hover:text-accent-primary rounded-lg transition-colors"
              >
                Try Analysis Board
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
