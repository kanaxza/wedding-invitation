import { WeddingLogo } from '@/components/WeddingLogo';
import { PhotoGallery } from '@/components/PhotoGallery';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="flex justify-center py-12">
        <WeddingLogo className="w-40 h-40 text-stone-600" />
      </div>
      <PhotoGallery />
    </main>
  );
}
