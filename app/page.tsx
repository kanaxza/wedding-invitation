import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { DetailsSection } from '@/components/DetailsSection';
import { ScheduleSection } from '@/components/ScheduleSection';
import { LocationSection } from '@/components/LocationSection';
import { RSVPSection } from '@/components/RSVPSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <DetailsSection />
      <LocationSection />
      <ScheduleSection />
      <RSVPSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
