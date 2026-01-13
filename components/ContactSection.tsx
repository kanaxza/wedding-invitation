import { Section, SectionHeading } from './Section';
import { Card, CardContent } from './Card';
import { siteConfig } from '@/lib/siteConfig';

export function ContactSection() {
  return (
    <Section id="contact" background="gray">
      <SectionHeading subtitle="Get in touch with us">Contact</SectionHeading>
      <Card>
        <CardContent>
          <div className="text-center space-y-6">
            <p className="text-gray-600">
              If you have any questions or need assistance, please feel free to reach out:
            </p>

            <div className="max-w-xs mx-auto">
              <div>
                <div className="text-primary-600 mb-2">
                  <svg
                    className="w-8 h-8 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                <p className="text-gray-600 text-sm">{siteConfig.contact.phone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}
