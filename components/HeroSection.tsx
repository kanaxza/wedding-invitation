import Image from 'next/image';

export function HeroSection() {
  return (
    <section
      id="hero"
      className="h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FBF7F0' }}
    >
      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="Wedding Logo"
          width={800}
          height={800}
          className="w-[85%] md:w-[70%] max-w-lg object-cover rounded-full md:rounded-lg drop-shadow-2xl aspect-square"
          priority
        />
      </div>
    </section>
  );
}
