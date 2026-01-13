import { Section, SectionHeading } from './Section';
import { Card, CardContent } from './Card';
import { siteConfig } from '@/lib/siteConfig';

export function DetailsSection() {
  return (
    <Section id="details" background="gray">
      <SectionHeading subtitle="Join us for our special day">
        Event Details
      </SectionHeading>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-primary-600 mb-3">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-primary-600 mb-3">
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
              <div className="text-primary-600 mb-3">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
