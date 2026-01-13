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
      className="h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FBF7F0' }}
    >
      <div className="text-center max-w-4xl mx-auto w-full relative">
        {/* Wedding Logo */}
        <div className="flex justify-center mb-6">
          <Image 
            src="/logo.png" 
            alt="Wedding Logo" 
            width={800} 
            height={800}
            className="w-[85%] md:w-[70%] max-w-lg object-cover rounded-full md:rounded-lg drop-shadow-2xl aspect-square"
            priority
          />
        </div>
        
        <p className="text-sm uppercase tracking-widest mb-3" style={{ color: '#B18A3D' }}>
          You Are Invited To
        </p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif mb-3" style={{ color: '#B18A3D' }}>
          Wedding Reception
        </h1>
        <div className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6" style={{ color: '#B18A3D' }}>
          {siteConfig.couple.name1} & {siteConfig.couple.name2}
        </div>
        <div className="text-lg md:text-xl mb-2" style={{ color: '#B18A3D' }}>
          {siteConfig.event.date}
        </div>
        <div className="text-base md:text-lg mb-6" style={{ color: '#B18A3D' }}>
          {siteConfig.event.venue}, {siteConfig.event.city}
        </div>
        
        {/* RSVP Button */}
        <div className="mb-8">
          <Button
            size="lg"
            onClick={() => scrollToSection('rsvp')}
          >
            Respond Here
          </Button>
        </div>
        
        {/* Scroll Indicator */}
        <div 
          className="mt-12 animate-bounce flex flex-col items-center cursor-pointer"
          onClick={() => scrollToSection('details')}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="#B18A3D"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          <p className="text-xs mt-1" style={{ color: '#B18A3D' }}>See more...</p>
        </div>
      </div>
      
    </section>
  );
}
