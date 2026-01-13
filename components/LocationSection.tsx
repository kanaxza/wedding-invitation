'use client';

import { Section, SectionHeading } from './Section';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { siteConfig } from '@/lib/siteConfig';

export function LocationSection() {
  return (
    <Section id="location" background="gray">
      <SectionHeading subtitle="Find us here">Location</SectionHeading>
      <Card>
        <CardContent>
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {siteConfig.event.venue}
              </h3>
              <p className="text-lg text-gray-600">{siteConfig.event.room}</p>
              <p className="text-gray-500">{siteConfig.event.city}</p>
            </div>

            <Button
              size="lg"
              onClick={() => window.open(siteConfig.event.mapsLink, '_blank')}
            >
              Open in Google Maps
            </Button>

            {/* Optional: Embedded map */}
            <div className="mt-8 rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5911234567891!2d100.54876!3d13.746331!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ0JzQ2LjgiTiAxMDDCsDMyJzU1LjUiRQ!5e0!3m2!1sen!2sth!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Venue Location"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-12 text-center">
        <Card>
          <CardContent>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Dress Code
            </h3>
            <p className="text-lg text-gray-600">{siteConfig.event.dressCode}</p>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
