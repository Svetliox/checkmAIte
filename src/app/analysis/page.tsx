import type { Metadata } from 'next';
import { AnalysisPageContent } from './AnalysisPageContent';

export const metadata: Metadata = {
  title: 'Analysis Board',
  description:
    'Analyze your chess games with AI-powered insights. Get real-time move suggestions and detailed statistics.',
};

/**
 * Analysis Page - Main chess analysis interface
 * 
 * This is a server component that exports metadata.
 * The actual content is rendered by the AnalysisPageContent client component
 * which provides Stockfish integration and real-time analysis.
 */
export default function AnalysisPage() {
  return <AnalysisPageContent />;
}
