import { Container, Card, CardContent } from '@/components/ui';

export default function FeaturesPage() {
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold mb-6">Features</h1>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Meet checkmAIte: Your Chess Sidekick</h2>
          <p className="mb-4">
            Ever wished you had a chess buddy who never gets tired, never spills coffee on the board, and always knows the best move? Enter <strong>checkmAIte</strong>—your digital mate, check specialist, and witty motivator. Whether you’re a grandmaster or just here for the memes, checkmAIte’s got your back.
          </p>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Modes: Choose Your Adventure</h2>
          <ul className="list-none pl-0 space-y-3">
            <li>
              <span className="inline-block mr-2">🤖</span>
              <strong>Play vs Bot:</strong> Battle Stockfish, the chess engine that eats pawns for breakfast. Pick your difficulty, play as white or black, and get instant feedback. If you win, brag. If you lose, blame the bot (it’s probably cheating).
            </li>
            <li>
              <span className="inline-block mr-2">🔍</span>
              <strong>Analysis:</strong> Relive your glorious victories or epic blunders. See what moves you missed, get hints, and let checkmAIte gently roast your mistakes (with love).
            </li>
          </ul>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Engine Magic: Stockfish Under the Hood</h2>
          <p>
            Behind the scenes, checkmAIte runs on <strong>Stockfish</strong>—the chess engine so smart, it makes your phone feel insecure. It analyzes positions, finds the best moves, and never asks for a day off. You don’t need to understand the code (unless you’re a robot). Just enjoy the ride, learn, and let checkmAIte help you level up your chess game!
          </p>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Why checkmAIte?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Always ready to play, analyze, and banter.</li>
            <li>Helps you spot checks, mates, and missed opportunities.</li>
            <li>Improves your chess skills (and your sense of humor).</li>
            <li>Doesn’t judge your opening choices. Much.</li>
          </ul>
        </CardContent>
      </Card>
    </Container>
  );
}
