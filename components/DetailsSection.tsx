'use client';

import { Section, SectionHeading } from './Section';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { siteConfig } from '@/lib/siteConfig';
import { useState } from 'react';
import Image from 'next/image';

export function DetailsSection() {
  const [showQR, setShowQR] = useState(false);
  
  const addToCalendar = () => {
    // Create .ics file content for calendar
    const event = {
      title: `${siteConfig.couple.fullNames} Wedding`,
      description: `Join us for the wedding celebration of ${siteConfig.couple.fullNames}`,
      location: `${siteConfig.event.venue}, ${siteConfig.event.room}, ${siteConfig.event.city}`,
      start: '2026-03-28T18:00:00',
      end: '2026-03-28T21:00:00',
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${event.start.replace(/[-:]/g, '')}`,
      `DTEND:${event.end.replace(/[-:]/g, '')}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wedding-invitation.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Section id="details" background="gray">
      <SectionHeading subtitle="Join us for our special day">
        Event Details
      </SectionHeading>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
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
              <h3 className="font-semibold text-lg mb-2">Date & Time</h3>
              <p className="text-gray-600">{siteConfig.event.date} at {siteConfig.event.time}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={addToCalendar}
              >
                Add to Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

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
              <h3 className="font-semibold text-lg mb-2">Dress Code</h3>
              <p className="text-gray-600">{siteConfig.event.dressCode}</p>
            </div>
          </CardContent>
        </Card>

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
              <h3 className="font-semibold text-lg mb-2">Cashless Society</h3>
              <p className="text-gray-600 text-sm">Your presence is the greatest gift.</p>
              <p className="text-gray-600 text-sm">For those who wish to support us further,</p>
              <p className="text-gray-600 text-sm">Cash or bank transfer is sincerely appreciated.</p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setShowQR(true)}
              >
                QR PromptPay
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

      {/* Location Card */}
      <Card>
        <CardContent>
          <div className="text-center space-y-6">
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
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {siteConfig.event.venue}
              </h3>
            </div>

            <Button
              size="sm"
              onClick={() => window.open(siteConfig.event.mapsLink, '_blank')}
            >
              Google Maps
            </Button>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}
