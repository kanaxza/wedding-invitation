'use client';

import { Section, SectionHeading } from './Section';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

export function PhotoGallery() {
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const photos = [
    { id: 1, url: '/gallery/1.jpeg', alt: 'Som & Gann - Photo 1' },
    { id: 2, url: '/gallery/2.jpeg', alt: 'Som & Gann - Photo 2' },
    { id: 3, url: '/gallery/3.jpeg', alt: 'Som & Gann - Photo 3' },
    { id: 4, url: '/gallery/4.jpeg', alt: 'Som & Gann - Photo 4' },
    { id: 5, url: '/gallery/5.jpeg', alt: 'Som & Gann - Photo 5' },
    { id: 6, url: '/gallery/6.jpeg', alt: 'Som & Gann - Photo 6' },
    { id: 7, url: '/gallery/7.jpeg', alt: 'Som & Gann - Photo 7' },
  ];

  // Duplicate photos for seamless loop
  const duplicatedPhotos = [...photos, ...photos, ...photos];

  // Auto-scroll continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev - 1;
        const containerWidth = containerRef.current?.offsetWidth || 0;
        const photoWidth = containerWidth / 3; // 3 photos visible at once
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
        Our Moments
      </SectionHeading>
      
      <div className="max-w-6xl mx-auto overflow-hidden" ref={containerRef}>
        <div 
          className="flex transition-transform duration-100 ease-linear"
          style={{ transform: `translateX(${offset}px)` }}
        >
          {duplicatedPhotos.map((photo, index) => (
            <div
              key={`${photo.id}-${index}`}
              className="flex-shrink-0 w-1/3 px-2"
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
