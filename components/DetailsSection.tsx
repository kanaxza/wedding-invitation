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
              <h3 className="font-semibold text-lg mb-2">Date</h3>
              <p className="text-gray-600">{siteConfig.event.date}</p>
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Time</h3>
              <p className="text-gray-600">{siteConfig.event.time}</p>
              <p className="text-sm text-gray-500 mt-1">
                Registration from {siteConfig.event.registrationTime}
              </p>
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
              <h3 className="font-semibold text-lg mb-2">Venue</h3>
              <p className="text-gray-600">{siteConfig.event.venue}</p>
              <p className="text-sm text-gray-500 mt-1">
                {siteConfig.event.room}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
