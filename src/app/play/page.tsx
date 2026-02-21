import { Metadata } from 'next';
import { PlayPageContent } from './PlayPageContent';

export const metadata: Metadata = {
  title: 'Play vs Bot | checkmAIte',
  description: 'Challenge the Stockfish chess engine. Choose your color, select difficulty, and test your skills!',
};

interface PlayPageProps {
  searchParams: Promise<{ loadGame?: string }>;
}

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const params = await searchParams;
  return <PlayPageContent loadGameId={params.loadGame} />;
}
