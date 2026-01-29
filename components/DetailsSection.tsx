'use client';

import { Section, SectionHeading } from './Section';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { siteConfig } from '@/lib/siteConfig';
import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';

export function DetailsSection() {
  const { t } = useLanguage();
  const [showQR, setShowQR] = useState(false);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const [showOpenInBrowser, setShowOpenInBrowser] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  const isWebView = () => {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const standalone = (window.navigator as any).standalone;
    
    // Check if it's real Safari (has 'version/' in UA)
    const isRealSafari = userAgent.includes('safari') && userAgent.includes('version/');
    
    // Detect common webview indicators
    const isInApp = (
      userAgent.includes('line') || // LINE app
      userAgent.includes('instagram') || // Instagram
      userAgent.includes('fbav') || // Facebook
      userAgent.includes('fban') || // Facebook
      userAgent.includes('messenger') || // Messenger
      userAgent.includes('twitter') || // Twitter
      userAgent.includes('wv') || // Generic webview
      userAgent.includes('micromessenger') || // WeChat
      userAgent.includes('kakaotalk') // KakaoTalk
    );
    
    // If it's real Safari, it's not a webview
    if (isRealSafari) {
      return false;
    }
    
    return isInApp;
  };
  
  const addToCalendar = () => {
    // Check if in webview, show open in browser prompt
    if (isWebView()) {
      setShowOpenInBrowser(true);
    } else {
      setShowCalendarOptions(true);
    }
  };
  
  const copyUrlToClipboard = () => {
    const url = window.location.href;
    
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert(t('urlCopied'));
      }).catch(() => {
        // Fallback if clipboard API fails
        fallbackCopyText(url);
      });
    } else {
      // Use fallback for environments without Clipboard API
      fallbackCopyText(url);
    }
  };
  
  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert(t('urlCopied'));
    } catch (err) {
      alert('Could not copy link. Please copy manually: ' + text);
    }
    
    document.body.removeChild(textArea);
  };
  
  const openInBrowser = () => {
    const url = window.location.href;
    // Try to open in external browser
    window.open(url, '_blank');
  };

  const addToGoogleCalendar = () => {
    const event = {
      title: `${siteConfig.couple.fullNames} Wedding`,
      description: `Join us for the wedding celebration of ${siteConfig.couple.fullNames}`,
      location: `${siteConfig.event.venue}, ${siteConfig.event.room}, ${siteConfig.event.city}`,
      start: '20260328T180000',
      end: '20260328T210000',
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
    setShowCalendarOptions(false);
  };

  const addToAppleCalendar = () => {
    // Create .ics file for Apple Calendar
    const event = {
      title: `${siteConfig.couple.fullNames} Wedding`,
      description: `Join us for the wedding celebration of ${siteConfig.couple.fullNames}`,
      location: `${siteConfig.event.venue}, ${siteConfig.event.room}, ${siteConfig.event.city}`,
      start: '20260328T180000',
      end: '20260328T210000',
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Invitation//EN',
      'BEGIN:VEVENT',
      `DTSTART:${event.start}`,
      `DTEND:${event.end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wedding-invitation.ics';
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowCalendarOptions(false);
  };

  const addToOutlookCalendar = () => {
    const event = {
      title: `${siteConfig.couple.fullNames} Wedding`,
      description: `Join us for the wedding celebration of ${siteConfig.couple.fullNames}`,
      location: `${siteConfig.event.venue}, ${siteConfig.event.room}, ${siteConfig.event.city}`,
      start: '2026-03-28T18:00:00',
      end: '2026-03-28T21:00:00',
    };

    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${event.start}&enddt=${event.end}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(outlookUrl, '_blank');
    setShowCalendarOptions(false);
  };

  return (
    <Section id="details" background="gray" className="!pb-3 lg:!pb-5">
      <SectionHeading subtitle={t('eventDetailsSubtitle')}>
        {t('eventDetails')}
      </SectionHeading>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Date & Time Card */}
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="mb-3" style={{ color: '#A67C38' }}>
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('dateTime')}</h3>
              <p className="text-gray-600">{t('eventDate')} at {t('eventTime')}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={addToCalendar}
              >
                {t('addToCalendar')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="mb-3" style={{ color: '#A67C38' }}>
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('venue')}</h3>
              <p className="text-gray-600 text-sm">{t('city')}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => window.open(siteConfig.event.mapsLink, '_blank')}
              >
                {t('googleMaps')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dress Code Card */}
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="mb-3" style={{ color: '#A67C38' }}>
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('dressCode')}</h3>
              <p className="text-xs text-gray-500 italic mb-2">{t('clickColorToSee')}</p>
              {/* Dress Code Colors - All in one line */}
              <div className="flex justify-center items-center gap-2 mb-3">
                <button
                  onClick={() => {
                    const color = t('colorNavyBlue');
                    console.log('Navy Blue clicked:', color);
                    setSelectedColor(color);
                  }}
                  className="w-12 h-12 flex-shrink-0 rounded-full shadow-lg border-2 border-gray-200 hover:scale-110 transition-transform cursor-pointer" 
                  style={{ backgroundColor: '#04084F' }} 
                  title="Navy Blue"
                  aria-label="Navy Blue"
                />
                <button
                  onClick={() => {
                    const color = t('colorSilverGray');
                    console.log('Silver/Gray clicked:', color);
                    setSelectedColor(color);
                  }}
                  className="hover:scale-110 transition-transform cursor-pointer"
                  aria-label="Silver/Gray"
                >
                  <Image 
                    src="/dresscode/texture-2.jpg" 
                    alt="Texture 2" 
                    width={48} 
                    height={48} 
                    className="w-12 h-12 flex-shrink-0 rounded-full shadow-lg border-2 border-gray-200 object-cover"
                  />
                </button>
                <button
                  onClick={() => {
                    const color = t('colorGold');
                    console.log('Gold clicked:', color);
                    setSelectedColor(color);
                  }}
                  className="hover:scale-110 transition-transform cursor-pointer"
                  aria-label="Gold"
                >
                  <Image 
                    src="/dresscode/texture-1.jpg" 
                    alt="Texture 1" 
                    width={48} 
                    height={48} 
                    className="w-12 h-12 flex-shrink-0 rounded-full shadow-lg border-2 border-gray-200 object-cover"
                  />
                </button>
                <button
                  onClick={() => {
                    const color = t('colorPastelPink');
                    console.log('Pastel Pink clicked:', color);
                    setSelectedColor(color);
                  }}
                  className="w-12 h-12 flex-shrink-0 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer" 
                  style={{ 
                    background: 'linear-gradient(145deg, #F5D1E0, #F0BBD3)', 
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(240, 187, 211, 0.5), inset 2px 2px 4px rgba(255,255,255,0.3)' 
                  }} 
                  title="Pastel Metallic Pink"
                  aria-label="Pastel Pink"
                />
                <button
                  onClick={() => {
                    const color = t('colorBronze');
                    console.log('Bronze clicked:', color);
                    setSelectedColor(color);
                  }}
                  className="hover:scale-110 transition-transform cursor-pointer"
                  aria-label="Bronze"
                >
                  <Image 
                    src="/dresscode/texture-3.jpg" 
                    alt="Texture 3" 
                    width={48} 
                    height={48} 
                    className="w-12 h-12 flex-shrink-0 rounded-full shadow-lg border-2 border-gray-200 object-cover"
                  />
                </button>
              </div>
              {selectedColor && (
                <p className="text-sm font-medium mb-2" style={{ color: '#A67C38' }}>
                  {selectedColor}
                </p>
              )}
              <p className="text-gray-600 text-sm">{t('dressCodeDescription')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Dining Style Card */}
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="mb-3 flex justify-center" style={{ color: '#A67C38' }}>
                <Image 
                  src="/dining-icon.png" 
                  alt="Chinese Banquet Table" 
                  width={60} 
                  height={60}
                  className="w-14 h-14"
                />
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('diningStyle')}</h3>
              <p className="text-gray-600 text-sm">{t('diningStyleDescription')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Cashless Society Card */}
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="mb-3" style={{ color: '#A67C38' }}>
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t('cashlessSociety')}</h3>
              <p className="text-gray-600 text-sm">{t('cashlessText1')}</p>
              <p className="text-gray-600 text-sm">{t('cashlessText2')}</p>
              <p className="text-gray-600 text-sm">{t('cashlessText3')}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => setShowQR(true)}
              >
                {t('qrPromptPay')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-right mb-2">
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center">
              <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden">
                <Image
                  src="/QRPrompty.JPG"
                  alt="QR PromptPay"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-lg font-semibold text-gray-900">วิหค เป็ดแก้ว</p>
              <p className="text-md text-gray-600">Wihok Pedkaew</p>
            </div>
          </div>
        </div>
      )}

      {/* Open in Browser Modal */}
      {showOpenInBrowser && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowOpenInBrowser(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('openInBrowserTitle')}</h3>
              <p className="text-gray-600 mb-4 text-sm whitespace-pre-line">
                {t('openInBrowserMessage')}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-3">{t('howToOpen')}</p>
                <p className="text-sm text-blue-800 whitespace-pre-line leading-relaxed">
                  {t('howToOpenInstructions')}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={copyUrlToClipboard}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t('copyUrl')}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowOpenInBrowser(false)}
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Options Modal */}
      {showCalendarOptions && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCalendarOptions(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('addToCalendar')}</h3>
              <p className="text-gray-600 mb-4">
                {t('selectCalendarApp')}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={addToGoogleCalendar}
              >
                <>
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018 0-3.878 3.132-7.018 7-7.018 1.89 0 3.47.697 4.682 1.829l-1.974 1.978v-.004c-.735-.702-1.667-1.062-2.708-1.062-2.31 0-4.187 1.956-4.187 4.273 0 2.315 1.877 4.277 4.187 4.277 2.096 0 3.522-1.202 3.816-2.852H12.14v-2.737h6.585c.088.47.135.96.135 1.474 0 4.01-2.677 6.86-6.72 6.86z"/>
                  </svg>
                  <span>Google Calendar</span>
                </>
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={addToAppleCalendar}
              >
                <>
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span>Apple Calendar</span>
                </>
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={addToOutlookCalendar}
              >
                <>
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.29.14.46.42.18.28.18.59v.17q-.07-.02-.14-.02zm-8.25-6.13q0-.41-.3-.7-.29-.3-.7-.3H7.13q-.42 0-.71.3-.3.29-.3.7V7q0 .41.3.7.29.3.71.3h7.62q.41 0 .7-.3.3-.29.3-.7v-.13zm0 11.25V9.38q0-.46-.3-.8-.3-.32-.75-.32H7.13q-.46 0-.8.33-.32.33-.32.8V12h6.87l.87-.5q.28-.14.57-.14.42 0 .71.29.3.29.3.71v4.38q0 .42-.3.71-.29.29-.71.29-.28 0-.57-.14l-.87-.5H6v4.5h10.88zm8.13-11.24q0-.42-.29-.71-.3-.29-.71-.29h-7.62q-.42 0-.71.29-.29.29-.29.71v11.24q0 .42.29.71.29.29.71.29h7.62q.41 0 .71-.29.29-.29.29-.71V5.88zm-8.25 7.34q0-.66.26-1.2.25-.55.69-.94.44-.39 1.04-.61.59-.22 1.26-.22.88 0 1.55.38.68.38 1.06 1.07.38.68.38 1.58v4.12q0 .4-.3.7-.29.3-.7.3-.41 0-.7-.3-.3-.3-.3-.7v-4.12q0-.88-.63-1.44-.63-.55-1.55-.55-.32 0-.6.1-.29.1-.51.29-.22.18-.36.44-.13.26-.13.57v4.12q0 .4-.3.7-.29.3-.7.3-.41 0-.7-.3-.3-.3-.3-.7V13.22z"/>
                </svg>
                <span>Outlook Calendar</span>
                </>
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowCalendarOptions(false)}
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
