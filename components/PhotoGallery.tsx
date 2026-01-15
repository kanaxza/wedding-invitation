'use client';

import { Section, SectionHeading } from './Section';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export function PhotoGallery() {
  const { t } = useLanguage();
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const photos = [
    { id: 1, url: '/gallery/s_g1.JPG', alt: 'Som & Gann - Photo 1' },
    { id: 2, url: '/gallery/s_g2.jpeg', alt: 'Som & Gann - Photo 2' },
    { id: 3, url: '/gallery/s_g3.jpeg', alt: 'Som & Gann - Photo 3' },
    { id: 4, url: '/gallery/s_g4.jpeg', alt: 'Som & Gann - Photo 4' },
    { id: 5, url: '/gallery/s_g5.jpeg', alt: 'Som & Gann - Photo 5' },
    { id: 6, url: '/gallery/s_g6.jpeg', alt: 'Som & Gann - Photo 6' },
    { id: 7, url: '/gallery/s_g7.jpeg', alt: 'Som & Gann - Photo 7' },
    { id: 8, url: '/gallery/s_g8.jpeg', alt: 'Som & Gann - Photo 8' },
    { id: 9, url: '/gallery/s_g9.jpeg', alt: 'Som & Gann - Photo 9' },
    { id: 10, url: '/gallery/s_g10.jpeg', alt: 'Som & Gann - Photo 10' },
    { id: 11, url: '/gallery/s_g11.jpeg', alt: 'Som & Gann - Photo 11' },
    { id: 12, url: '/gallery/s_g12.jpeg', alt: 'Som & Gann - Photo 12' },
    { id: 13, url: '/gallery/s_g13.jpeg', alt: 'Som & Gann - Photo 13' },
    { id: 14, url: '/gallery/s_g14.jpeg', alt: 'Som & Gann - Photo 14' },
    { id: 15, url: '/gallery/s_g15.jpeg', alt: 'Som & Gann - Photo 15' },
    { id: 16, url: '/gallery/s_g16.jpeg', alt: 'Som & Gann - Photo 16' },
  ];

  // Duplicate photos for seamless loop
  const duplicatedPhotos = [...photos, ...photos, ...photos];

  // Auto-scroll continuously (20% faster)
  useEffect(() => {
    if (isPaused) return;
    
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
    }, 24); // 20% faster (30ms * 0.8 = 24ms)

    return () => clearInterval(interval);
  }, [photos.length, isPaused]);

  // Handle manual scrolling
  const handleManualScroll = () => {
    setIsPaused(true);
    
    // Clear existing timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    
    // Resume auto-scroll after 2 seconds of no interaction
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2000);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setOffset((prev) => prev - e.deltaY * 0.5);
    handleManualScroll();
  };

  const handleTouchStart = useRef({ x: 0, scrollLeft: 0 });
  
  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = {
      x: e.touches[0].clientX,
      scrollLeft: offset
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    const walk = (handleTouchStart.current.x - x) * 2;
    setOffset(handleTouchStart.current.scrollLeft - walk);
    handleManualScroll();
  };

  return (
    <Section id="gallery">
      <SectionHeading subtitle="">
        {t('ourMoments')}
      </SectionHeading>
      
      <div 
        className="max-w-7xl mx-auto overflow-hidden cursor-grab active:cursor-grabbing" 
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
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
