'use client';

import { useLanguage } from '@/lib/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="py-12 flex justify-center gap-4" style={{ backgroundColor: '#FBF7F0' }}>
      <button
        onClick={() => setLanguage('th')}
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        style={{ 
          background: language === 'th'
            ? 'linear-gradient(135deg, #C99A4D 0%, #A67C38 50%, #8B6B29 100%)'
            : '#E5E5E5',
          opacity: language === 'th' ? 1 : 0.5,
        }}
        aria-label="Switch to Thai"
      >
        <span className="text-4xl">🇹🇭</span>
      </button>
      <button
        onClick={() => setLanguage('en')}
        className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        style={{ 
          background: language === 'en' 
            ? 'linear-gradient(135deg, #C99A4D 0%, #A67C38 50%, #8B6B29 100%)'
            : '#E5E5E5',
          opacity: language === 'en' ? 1 : 0.5,
        }}
        aria-label="Switch to English"
      >
        <span className="text-4xl">🇬🇧</span>
      </button>
    </div>
  );
}
