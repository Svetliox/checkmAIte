import { Container, Card, CardContent } from '@/components/ui';

export default function HelpPage() {
  return (
    <Container className="py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Help: Chess Notations & Hints</h1>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Chess Piece Annotations</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>K</strong> – King</li>
            <li><strong>Q</strong> – Queen</li>
            <li><strong>R</strong> – Rook</li>
            <li><strong>B</strong> – Bishop</li>
            <li><strong>N</strong> – Knight</li>
            <li><strong>(no letter)</strong> – Pawn</li>
          </ul>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Special Moves</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>0-0</strong> – Kingside castling (short castling)</li>
            <li><strong>0-0-0</strong> – Queenside castling (long castling)</li>
            <li><strong>x</strong> – A piece captures another (e.g., Nxe5 means Knight captures on e5)</li>
            <li><strong>+</strong> – Check</li>
            <li><strong>#</strong> – Checkmate</li>
          </ul>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Best Moves & Hints</h2>
          <p>
            When you see a “best move” or a hint, it means the computer suggests this move as the strongest option in the current position. Hints help you learn and improve by showing you what a chess master (or engine) would play next!
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
