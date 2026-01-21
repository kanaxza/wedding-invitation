'use client';

import { Suspense } from 'react';
import { HeroSection } from './HeroSection';
import { LoadingSpinner } from './LoadingSpinner';

export function HeroSectionWrapper() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#FBF7F0' }}><LoadingSpinner /></div>}>
      <HeroSection />
    </Suspense>
  );
}
