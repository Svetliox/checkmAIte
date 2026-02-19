import { Container, Card, CardContent } from '@/components/ui';

export default function FeaturesPage() {
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold mb-6">Features</h1>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">What is checkmAIte?</h2>
          <p className="mb-4">
            checkmAIte is your smart chess companion. Whether you want to play against a strong AI, analyze your games, or just have fun learning, checkmAIte makes chess accessible and enjoyable for everyone.
          </p>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Modes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Play vs Bot:</strong> Challenge the computer at different skill levels and get instant feedback on your moves.</li>
            <li><strong>Analysis:</strong> Review your games, see suggested moves, and understand where you can improve.</li>
          </ul>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">How does the engine work?</h2>
          <p>
            checkmAIte uses Stockfish, one of the world’s strongest chess engines, to power both play and analysis. The engine quickly evaluates positions and suggests the best moves, helping you learn and improve. You don’t need to know how it works behind the scenes—just enjoy smart, fast, and fair chess games!
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
