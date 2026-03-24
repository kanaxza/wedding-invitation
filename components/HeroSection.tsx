'use client';

import { siteConfig } from '@/lib/siteConfig';
import { Button } from './Button';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export function HeroSection() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const [inviteeName, setInviteeName] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');
  const [tableLabel, setTableLabel] = useState<string>('');
  const [showTablePopup, setShowTablePopup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setIsLoading(true);
      fetch(`/api/invitations/verify?code=${code}`)
        .then(r => r.json())
        .then((inviteData) => {
          if (inviteData.ok && inviteData.inviteeName) {
            setInviteeName(inviteData.inviteeName);
            setGroupName(inviteData.groupName || '');
            if (inviteData.tableLabel) {
              setTableLabel(inviteData.tableLabel);
              setShowTablePopup(true);
            }
          }
        })
        .catch((err) => {
          console.error('Error fetching invitee:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('code')]);
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <LoadingSpinner />
          </div>
        </div>
      )}

      {/* Table Label Popup */}
      {showTablePopup && tableLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="text-4xl mb-4">🪑</div>
            {inviteeName && (
              <p className="text-lg font-semibold mb-1" style={{ color: '#B18A3D' }}>
                {t('hiName')}{inviteeName}!
              </p>
            )}
            {groupName && (
              <p className="text-lg font-semibold mb-3" style={{ color: '#B18A3D' }}>({groupName})</p>
            )}
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('yourTable')}</h2>
            <div className="my-4 py-4 px-6 rounded-xl" style={{ backgroundColor: '#F9F3E8', border: '2px solid #B18A3D' }}>
              <span className="text-5xl font-bold" style={{ color: '#B18A3D' }}>{tableLabel}</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">{t('yourTablePopupDesc')}</p>
            <button
              onClick={() => setShowTablePopup(false)}
              className="w-full py-2 px-4 rounded-lg font-medium text-white"
              style={{ backgroundColor: '#B18A3D' }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
      
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
        
        <div className="h-6"></div>
        
        {inviteeName && language === 'th' && (
          <div className="mb-5">
            <p className="text-xl md:text-2xl" style={{ color: '#B18A3D' }}>
              สวัสดี <span className="font-bold" style={{ fontSize: '120%' }}>{inviteeName}</span>,
            </p>
            {groupName && (
              <p className="text-lg md:text-xl font-semibold" style={{ color: '#B18A3D' }}>({groupName})</p>
            )}
            {tableLabel && (
              <div className="inline-flex flex-col items-center mt-2 px-6 py-3 rounded-xl" style={{ backgroundColor: '#F9F3E8', border: '2px solid #B18A3D' }}>
                <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: '#8B6B29' }}>{t('yourTable')}</p>
                <p className="text-3xl font-bold" style={{ color: '#B18A3D' }}>{tableLabel}</p>
              </div>
            )}
            <p className="text-xl md:text-2xl mt-2" style={{ color: '#B18A3D' }}>
              บ่าวสาวขอเรียนเชิญร่วมงาน
            </p>
          </div>
        )}
        {inviteeName && language === 'en' && (
          <div className="mb-5">
            <p className="text-xl md:text-2xl" style={{ color: '#B18A3D' }}>
              Hello <span className="font-bold" style={{ fontSize: '120%' }}>{inviteeName}</span>,
            </p>
            {groupName && (
              <p className="text-lg md:text-xl font-semibold" style={{ color: '#B18A3D' }}>({groupName})</p>
            )}
            {tableLabel && (
              <div className="inline-flex flex-col items-center mt-2 px-6 py-3 rounded-xl" style={{ backgroundColor: '#F9F3E8', border: '2px solid #B18A3D' }}>
                <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: '#8B6B29' }}>{t('yourTable')}</p>
                <p className="text-3xl font-bold" style={{ color: '#B18A3D' }}>{tableLabel}</p>
              </div>
            )}
            <p className="text-xl md:text-2xl mt-2" style={{ color: '#B18A3D' }}>
              We would like to invite you to join our celebration
            </p>
          </div>
        )}
        {!inviteeName && (
          <p className="text-sm uppercase tracking-widest mb-3" style={{ color: '#B18A3D' }}>
            {t('invitedTo')}
          </p>
        )}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif mb-3" style={{ color: '#B18A3D' }}>
          {t('weddingReception')}
        </h1>
        <div className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6" style={{ color: '#B18A3D' }}>
          {t('coupleName1')} & {t('coupleName2')}
        </div>
        <div className="text-lg md:text-xl mb-2" style={{ color: '#B18A3D' }}>
          {t('eventDate')}
        </div>
        <div className="text-base md:text-lg mb-6" style={{ color: '#B18A3D' }}>
          {t('venue')}, {t('city')}
        </div>
        
        {/* RSVP Button */}
        <div className="mb-8">
          <Button
            size="lg"
            onClick={() => scrollToSection('rsvp')}
          >
            {t('respondHere')}
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
          <p className="text-xs mt-1" style={{ color: '#B18A3D' }}>{t('seeMore')}</p>
        </div>
      </div>
      
    </section>
    </>
  );
}
