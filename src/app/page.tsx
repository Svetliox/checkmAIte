import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CTASection } from '@/components/home/CTASection';

/**
 * Homepage - checkmAIte Chess Analysis
 * 
 * This is a Server Component that renders the main marketing homepage.
 * It showcases the key features and provides CTAs to start analyzing.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
