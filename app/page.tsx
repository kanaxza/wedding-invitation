import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { DetailsSection } from '@/components/DetailsSection';
import { PhotoGallery } from '@/components/PhotoGallery';
import { RSVPSection } from '@/components/RSVPSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <DetailsSection />
      <RSVPSection />
      <PhotoGallery />
      <ContactSection />
      <LanguageToggle />
      <Footer />
    </main>
  );
}
