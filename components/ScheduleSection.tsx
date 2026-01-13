import { Section, SectionHeading } from './Section';
import { siteConfig } from '@/lib/siteConfig';

export function ScheduleSection() {
  return (
    <Section id="schedule">
      <SectionHeading subtitle="Timeline of events for the day">
        Schedule
      </SectionHeading>
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200" />

          {siteConfig.schedule.map((item, index) => (
            <div key={index} className="relative flex gap-6 mb-8 last:mb-0">
              {/* Time circle */}
              <div className="flex-shrink-0 w-16 pt-1">
                <div className="relative z-10 w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  {item.time}
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow pb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
