import { Container, Card, CardContent } from '@/components/ui';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <Container className="py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          Everything you need to know about using checkmAIte, from basic chess notation to advanced features
        </p>
      </div>

      <div className="space-y-8">
        {/* Getting Started */}
        <Card className="border-accent-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🚀</span>
              <h2 className="text-2xl font-bold">Getting Started</h2>
            </div>
            <div className="space-y-4 text-foreground/80">
              <div>
                <h3 className="font-semibold text-lg mb-2">How to Play</h3>
                <p className="mb-2">Playing on checkmAIte is simple:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Navigate to the <strong>Play</strong> page from the menu</li>
                  <li>Choose your difficulty level (Easy, Medium, or Hard)</li>
                  <li>Select your color (White or Black)</li>
                  <li>Click pieces to select them, then click the destination square to move</li>
                  <li>You can also drag and drop pieces for faster gameplay</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Using the Analysis Board</h3>
                <p className="mb-2">The Analysis Board lets you study any position:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Go to the <strong>Analysis</strong> page</li>
                  <li>Make moves on the board or load a saved game</li>
                  <li>The engine automatically evaluates each position</li>
                  <li>Use the move history panel to navigate backward and forward</li>
                  <li>Check the best moves panel for engine recommendations</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chess Notation */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">♟️</span>
                <h2 className="text-2xl font-bold">Chess Piece Notation</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                  <span className="font-semibold">K</span>
                  <span className="text-foreground/70">King</span>
                </div>
                <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                  <span className="font-semibold">Q</span>
                  <span className="text-foreground/70">Queen</span>
                </div>
                <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                  <span className="font-semibold">R</span>
                  <span className="text-foreground/70">Rook</span>
                </div>
                <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                  <span className="font-semibold">B</span>
                  <span className="text-foreground/70">Bishop</span>
                </div>
                <div className="flex justify-between items-center border-b border-foreground/10 pb-2">
                  <span className="font-semibold">N</span>
                  <span className="text-foreground/70">Knight</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="font-semibold">(no letter)</span>
                  <span className="text-foreground/70">Pawn</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-accent-primary/10 rounded-lg">
                <p className="text-sm text-foreground/70">
                  <strong>Example:</strong> <code className="px-1 py-0.5 bg-surface-2 rounded">Nf3</code> means &quot;Knight moves to f3&quot;
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📝</span>
                <h2 className="text-2xl font-bold">Special Symbols</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-foreground/10 pb-2">
                  <span className="font-semibold">x</span>
                  <span className="text-foreground/70 text-right">Captures (e.g., Bxf7)</span>
                </div>
                <div className="flex justify-between items-start border-b border-foreground/10 pb-2">
                  <span className="font-semibold">+</span>
                  <span className="text-foreground/70 text-right">Check</span>
                </div>
                <div className="flex justify-between items-start border-b border-foreground/10 pb-2">
                  <span className="font-semibold">#</span>
                  <span className="text-foreground/70 text-right">Checkmate</span>
                </div>
                <div className="flex justify-between items-start border-b border-foreground/10 pb-2">
                  <span className="font-semibold">O-O</span>
                  <span className="text-foreground/70 text-right">Kingside castling</span>
                </div>
                <div className="flex justify-between items-start border-b border-foreground/10 pb-2">
                  <span className="font-semibold">O-O-O</span>
                  <span className="text-foreground/70 text-right">Queenside castling</span>
                </div>
                <div className="flex justify-between items-start pb-2">
                  <span className="font-semibold">=Q</span>
                  <span className="text-foreground/70 text-right">Pawn promotion to Queen</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-accent-secondary/10 rounded-lg">
                <p className="text-sm text-foreground/70">
                  <strong>Example:</strong> <code className="px-1 py-0.5 bg-surface-2 rounded">Qxh7+</code> means &quot;Queen captures on h7 with check&quot;
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Understanding the Engine */}
        <Card className="bg-gradient-to-br from-surface-1 to-surface-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🤖</span>
              <h2 className="text-2xl font-bold">Understanding the Engine Evaluation</h2>
            </div>
            <div className="space-y-4 text-foreground/80">
              <div>
                <h3 className="font-semibold text-lg mb-2">Position Evaluation</h3>
                <p className="mb-3">The engine shows position strength as a number:</p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 bg-accent-success/10 border border-accent-success/30 rounded">
                    <div className="font-bold text-accent-success mb-1">+2.5</div>
                    <div className="text-sm">White is better (2.5 pawns advantage)</div>
                  </div>
                  <div className="p-3 bg-surface-2 border border-foreground/20 rounded">
                    <div className="font-bold mb-1">0.0</div>
                    <div className="text-sm">Equal position</div>
                  </div>
                  <div className="p-3 bg-accent-danger/10 border border-accent-danger/30 rounded">
                    <div className="font-bold text-accent-danger mb-1">-1.8</div>
                    <div className="text-sm">Black is better (1.8 pawns advantage)</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Best Moves Panel</h3>
                <p>The best moves panel shows the top 3 moves the engine recommends, ranked from strongest to weakest. Each move shows:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>Move notation:</strong> The chess move in standard notation</li>
                  <li><strong>Evaluation:</strong> How good the move is (higher is better for White)</li>
                  <li><strong>Depth:</strong> How many moves ahead the engine calculated</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Guide */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚙️</span>
              <h2 className="text-2xl font-bold">Advanced Features</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span>💾</span> Saving Games
                </h3>
                <p className="text-foreground/80 mb-2">Save your games to review later:</p>
                <ol className="list-decimal pl-6 space-y-1 text-foreground/70">
                  <li>During any game, click the &quot;Save Game&quot; button</li>
                  <li>Give your game a descriptive name</li>
                  <li>Access saved games from your Account page</li>
                  <li>Load them back anytime to continue or analyze</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span>🎨</span> Board Themes
                </h3>
                <p className="text-foreground/80 mb-2">Customize your board appearance:</p>
                <ol className="list-decimal pl-6 space-y-1 text-foreground/70">
                  <li>Go to Account → Settings</li>
                  <li>Choose between Original and Modern themes</li>
                  <li>Your preference is saved automatically</li>
                  <li>Try both to see which you prefer!</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span>🔧</span> Analysis Depth
                </h3>
                <p className="text-foreground/80 mb-2">Control engine thinking depth:</p>
                <ul className="list-disc pl-6 space-y-1 text-foreground/70">
                  <li><strong>5-10:</strong> Fast, good for quick analysis</li>
                  <li><strong>11-15:</strong> Balanced, recommended for most</li>
                  <li><strong>16-25:</strong> Deep, tournament-level accuracy</li>
                </ul>
                <p className="text-sm text-foreground/60 mt-2">
                  Higher depth = stronger analysis but slower
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span>🧠</span> AI Chat Assistant
                </h3>
                <p className="text-foreground/80 mb-2">Get personalized chess insights:</p>
                <ul className="list-disc pl-6 space-y-1 text-foreground/70">
                  <li>The AI comments every few moves</li>
                  <li>Get strategic advice in plain language</li>
                  <li>Learn patterns and tactics naturally</li>
                  <li>Requires free Groq API key in settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Tricks */}
        <Card className="border-accent-success/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💡</span>
              <h2 className="text-2xl font-bold">Tips for Improvement</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-2 rounded-lg">
                <h3 className="font-semibold mb-2">🎯 Study Your Mistakes</h3>
                <p className="text-sm text-foreground/70">
                  After each game, use the Analysis mode to review where you went wrong. The best moves panel shows what you should have played.
                </p>
              </div>
              <div className="p-4 bg-surface-2 rounded-lg">
                <h3 className="font-semibold mb-2">📚 Practice Openings</h3>
                <p className="text-sm text-foreground/70">
                  Play the same opening multiple times against the bot. Repetition helps you memorize key positions and ideas.
                </p>
              </div>
              <div className="p-4 bg-surface-2 rounded-lg">
                <h3 className="font-semibold mb-2">⏱️ Think Before Moving</h3>
                <p className="text-sm text-foreground/70">
                  Don&apos;t rush! Even against the computer, take time to calculate. Check for tactics before making your move.
                </p>
              </div>
              <div className="p-4 bg-surface-2 rounded-lg">
                <h3 className="font-semibold mb-2">🔄 Analyze Positions Deeply</h3>
                <p className="text-sm text-foreground/70">
                  Use higher analysis depths for critical positions. Understanding why a move is best is more valuable than just knowing what it is.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">❓</span>
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="font-semibold mb-2">Why does the engine recommend a move I don&apos;t understand?</h3>
                <p className="text-foreground/70 text-sm">
                  Chess engines calculate millions of positions and sometimes find subtle tactics or strategic ideas. Use the AI chat assistant for explanations in plain language, or increase the analysis depth to 20+ for more accurate evaluations.
                </p>
              </div>
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="font-semibold mb-2">How strong is the bot on &quot;Hard&quot; difficulty?</h3>
                <p className="text-foreground/70 text-sm">
                  The Hard difficulty plays at approximately 2000+ ELO strength, which is expert-level. Easy is around 800-1200, and Medium is 1200-1600.
                </p>
              </div>
              <div className="border-b border-foreground/10 pb-4">
                <h3 className="font-semibold mb-2">Can I play against other people?</h3>
                <p className="text-foreground/70 text-sm">
                  Currently, checkmAIte focuses on solo play and analysis. Multiplayer features may be added in future updates!
                </p>
              </div>
              <div className="pb-4">
                <h3 className="font-semibold mb-2">Do I need to create an account?</h3>
                <p className="text-foreground/70 text-sm">
                  You can analyze positions without an account, but creating one lets you save games, customize preferences, and use the AI chat assistant with your own API key.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 text-center">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-3">Still Have Questions?</h2>
            <p className="text-foreground/70 mb-4">
              We&apos;re here to help! Check out our detailed documentation or reach out to the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-2 font-semibold text-white bg-accent-primary hover:bg-accent-primary/90 rounded-lg transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center px-6 py-2 font-semibold text-foreground border-2 border-foreground/20 hover:border-accent-primary hover:text-accent-primary rounded-lg transition-colors"
              >
                View All Features
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
