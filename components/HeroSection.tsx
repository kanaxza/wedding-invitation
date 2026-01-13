'use client';

import { siteConfig } from '@/lib/siteConfig';
import { Button } from './Button';
import Image from 'next/image';

export function HeroSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="h-screen flex items-center justify-center px-4 pt-8"
      style={{ backgroundColor: '#FBF7F0' }}
    >
      <div className="text-center max-w-4xl mx-auto w-full">
        {/* Wedding Logo */}
        <div className="flex justify-center mb-6">
          <Image 
            src="/logo.png" 
            alt="Wedding Logo" 
            width={800} 
            height={800}
            className="w-[85%] md:w-[70%] max-w-lg object-contain"
            priority
          />
        </div>
        
        <p className="text-sm uppercase tracking-widest text-gray-600 mb-3">
          You Are Invited To
        </p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-3">
          Wedding Reception
        </h1>
        <div className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary-600 mb-6">
          {siteConfig.couple.name1} & {siteConfig.couple.name2}
        </div>
        <div className="text-lg md:text-xl text-gray-700 mb-2">
          {siteConfig.event.date}
        </div>
        <div className="text-base md:text-lg text-gray-600 mb-6">
          {siteConfig.event.venue}, {siteConfig.event.city}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            size="lg"
            onClick={() => scrollToSection('rsvp')}
            className="min-w-[200px]"
          >
            Respond Here
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.open(siteConfig.event.mapsLink, '_blank')}
            className="min-w-[200px]"
          >
            Get Directions
          </Button>
        </div>
      </div>
    </section>
  );
}
