import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { DetailsSection } from '@/components/DetailsSection';
import { PhotoGallery } from '@/components/PhotoGallery';
import { RSVPSection } from '@/components/RSVPSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { LanguageToggle } from '@/components/LanguageToggle';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <DetailsSection />
      <Suspense fallback={<div className="flex justify-center items-center py-20"><LoadingSpinner /></div>}>
        <RSVPSection />
      </Suspense>
      <PhotoGallery />
      <ContactSection />
      <LanguageToggle />
      <Footer />
    </main>
  );
}
