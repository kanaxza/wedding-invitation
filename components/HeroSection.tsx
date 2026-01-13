'use client';

import { siteConfig } from '@/lib/siteConfig';
import { Button } from './Button';

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
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4 pt-16"
    >
      <div className="text-center max-w-4xl mx-auto">
        <p className="text-sm uppercase tracking-widest text-gray-600 mb-4">
          You Are Invited To
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 mb-4">
          Wedding Reception
        </h1>
        <div className="text-5xl md:text-6xl lg:text-7xl font-serif text-primary-600 mb-8">
          {siteConfig.couple.name1} & {siteConfig.couple.name2}
        </div>
        <div className="text-xl md:text-2xl text-gray-700 mb-4">
          {siteConfig.event.date}
        </div>
        <div className="text-lg md:text-xl text-gray-600 mb-8">
          {siteConfig.event.venue}, {siteConfig.event.city}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button
            size="lg"
            onClick={() => scrollToSection('rsvp')}
            className="min-w-[200px]"
          >
            RSVP Now
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
