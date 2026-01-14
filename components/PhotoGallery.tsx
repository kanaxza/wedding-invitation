'use client';

import { Section, SectionHeading } from './Section';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export function PhotoGallery() {
  const { t } = useLanguage();
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const photos = [
    { id: 1, url: '/gallery/sg1.jpeg', alt: 'Som & Gann - Photo 1' },
    { id: 2, url: '/gallery/sg2.jpeg', alt: 'Som & Gann - Photo 2' },
    { id: 3, url: '/gallery/sg3.jpeg', alt: 'Som & Gann - Photo 3' },
    { id: 4, url: '/gallery/sg4.jpeg', alt: 'Som & Gann - Photo 4' },
    { id: 5, url: '/gallery/sg5.jpeg', alt: 'Som & Gann - Photo 5' },
    { id: 6, url: '/gallery/sg6.jpeg', alt: 'Som & Gann - Photo 6' },
    { id: 7, url: '/gallery/sg7.jpeg', alt: 'Som & Gann - Photo 7' },
    { id: 8, url: '/gallery/sg8.jpeg', alt: 'Som & Gann - Photo 8' },
    { id: 9, url: '/gallery/sg9.jpeg', alt: 'Som & Gann - Photo 9' },
    { id: 10, url: '/gallery/sg10.jpeg', alt: 'Som & Gann - Photo 10' },
    { id: 11, url: '/gallery/sg11.jpeg', alt: 'Som & Gann - Photo 11' },
    { id: 12, url: '/gallery/sg12.jpeg', alt: 'Som & Gann - Photo 12' },
    { id: 13, url: '/gallery/sg13.jpeg', alt: 'Som & Gann - Photo 13' },
    { id: 14, url: '/gallery/sg14.jpeg', alt: 'Som & Gann - Photo 14' },
    { id: 15, url: '/gallery/sg15.jpeg', alt: 'Som & Gann - Photo 15' },
  ];

  // Duplicate photos for seamless loop
  const duplicatedPhotos = [...photos, ...photos, ...photos];

  // Auto-scroll continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev - 1;
        const containerWidth = containerRef.current?.offsetWidth || 0;
        const photoWidth = containerWidth * 0.55; // 55% width (10% bigger than 50%)
        const totalWidth = photoWidth * photos.length;
        
        // Reset to middle set when reaching end
        if (Math.abs(newOffset) >= totalWidth) {
          return 0;
        }
        return newOffset;
      });
    }, 30); // Smooth continuous scroll

    return () => clearInterval(interval);
  }, [photos.length]);

  return (
    <Section id="gallery">
      <SectionHeading subtitle="">
        {t('ourMoments')}
      </SectionHeading>
      
      <div className="max-w-7xl mx-auto overflow-hidden" ref={containerRef}>
        <div 
          className="flex transition-transform duration-100 ease-linear"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {duplicatedPhotos.map((photo, index) => (
            <div
              key={`${photo.id}-${index}`}
              className="flex-shrink-0 w-[55%] px-2"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
