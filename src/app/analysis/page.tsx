import type { Metadata } from 'next';
import { AnalysisPageContent } from './AnalysisPageContent';

export const metadata: Metadata = {
  title: 'Analysis Board',
  description:
    'Analyze your chess games with AI-powered insights. Get real-time move suggestions and detailed statistics.',
};

export default function AnalysisPage() {
  return <AnalysisPageContent />;
}
