'use client';

import { siteConfig } from '@/lib/siteConfig';

export function Navigation() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 backdrop-blur-sm border-b border-gray-200 z-50" style={{ backgroundColor: 'rgba(251, 247, 240, 0.95)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => scrollToSection('hero')}
            className="font-serif text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
          >
            {siteConfig.couple.fullNames}
          </button>
          <div className="hidden md:flex space-x-8">
            {[
              { id: 'details', label: 'Details' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'location', label: 'Location' },
              { id: 'rsvp', label: 'RSVP' },
              { id: 'contact', label: 'Contact' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
