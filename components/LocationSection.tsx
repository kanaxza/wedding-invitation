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
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}
