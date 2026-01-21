'use client';

import { Suspense } from 'react';
import { RSVPSection } from './RSVPSection';
import { LoadingSpinner } from './LoadingSpinner';

export function RSVPSectionWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center py-20"><LoadingSpinner /></div>}>
      <RSVPSection />
    </Suspense>
  );
}
