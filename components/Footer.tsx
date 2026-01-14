'use client';

import { useLanguage } from '@/lib/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-gray-400">
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
