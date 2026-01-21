import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { DetailsSection } from '@/components/DetailsSection';
import { PhotoGallery } from '@/components/PhotoGallery';
import { RSVPSectionWrapper } from '@/components/RSVPSectionWrapper';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <DetailsSection />
      <RSVPSectionWrapper />
      <PhotoGallery />
      <ContactSection />
      <LanguageToggle />
      <Footer />
    </main>
  );
}
