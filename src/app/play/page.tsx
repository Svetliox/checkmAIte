import { Metadata } from 'next';
import { PlayPageContent } from './PlayPageContent';

export const metadata: Metadata = {
  title: 'Play vs Bot | checkmAIte',
  description: 'Challenge the Stockfish chess engine. Choose your color, select difficulty, and test your skills!',
};

export default function PlayPage() {
  return <PlayPageContent />;
}
