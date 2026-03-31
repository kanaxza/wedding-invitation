import { HeroSectionWrapper } from '@/components/HeroSectionWrapper';
import { PhotoGallery } from '@/components/PhotoGallery';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSectionWrapper />
      <PhotoGallery />
    </main>
  );
}
