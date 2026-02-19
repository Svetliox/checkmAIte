import { Metadata } from 'next';
import { ModesPageContent } from './ModesPageContent';

export const metadata: Metadata = {
  title: 'Choose Mode | checkmAIte',
  description: 'Select your chess experience: analyze games with AI or play against the Stockfish engine.',
};

export default function ModesPage() {
  return <ModesPageContent />;
}
