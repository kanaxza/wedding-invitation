import { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  background?: 'white' | 'gray';
}

export function Section({
  id,
  children,
  className = '',
  background = 'white',
}: SectionProps) {
  const bgColor = background === 'gray' ? 'bg-gray-50' : 'bg-white';

  return (
    <section id={id} className={`section-padding ${bgColor} ${className}`}>
      <div className="max-w-4xl mx-auto">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  children: ReactNode;
  subtitle?: string;
}

export function SectionHeading({ children, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
        {children}
      </h2>
      {subtitle && (
        <p className="text-gray-600 text-lg mt-2">{subtitle}</p>
      )}
    </div>
  );
}
