import { Navigation } from '@/components/Navigation';
import { HeroSectionWrapper } from '@/components/HeroSectionWrapper';
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
      <HeroSectionWrapper />
      <DetailsSection />
      <RSVPSectionWrapper />
      <PhotoGallery />
      <ContactSection />
      <LanguageToggle />
      <Footer />
    </main>
  );
}
