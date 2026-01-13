import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { DetailsSection } from '@/components/DetailsSection';
import { LocationSection } from '@/components/LocationSection';
import { PhotoGallery } from '@/components/PhotoGallery';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <DetailsSection />
      <LocationSection />
      <PhotoGallery />
      <ContactSection />
      <Footer />
    </main>
  );
}
