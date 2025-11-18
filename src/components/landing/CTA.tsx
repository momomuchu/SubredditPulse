import Link from 'next/link';

export function CTA() {
  return (
    <section className="bg-gradient-hero text-hero-foreground relative overflow-hidden px-4 py-20 transition-colors sm:px-6 sm:py-24 lg:px-8">
      {/* Subtle background element */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span
          className="absolute top-1/2 left-1/2 block size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Headline - direct and clear */}
        <h2 className="text-hero-foreground mb-6 text-4xl leading-tight font-extrabold transition-colors sm:text-5xl md:text-6xl">
          Stop configuring.
          <br />
          Start shipping.
        </h2>

        {/* Subheadline - benefit-focused */}
        <p className="text-hero-muted mx-auto mb-10 max-w-2xl text-lg leading-relaxed transition-colors sm:text-xl">
          Join 100,000+ developers who chose to build features instead of boilerplate. Free forever, open source.
        </p>

        {/* CTA Button - single, strong */}
        <Link
          href="/sign-up/"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-10 py-5 text-lg font-bold text-gray-900 shadow-2xl transition-all duration-200 hover:scale-105"
        >
          Get Started — It's Free
          <svg
            className="size-6 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>

        {/* Trust signals - compact */}
        <div className="text-hero-muted mt-10 flex flex-wrap items-center justify-center gap-6 text-sm transition-colors">
          <div className="flex items-center gap-2">
            <svg className="text-hero-foreground size-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            No credit card
          </div>
          <div
            className="size-1 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--color-hero-muted)' }}
          />
          <div className="flex items-center gap-2">
            <svg className="text-hero-foreground size-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            MIT License
          </div>
          <div
            className="size-1 rounded-full transition-colors"
            style={{ backgroundColor: 'var(--color-hero-muted)' }}
          />
          <div className="flex items-center gap-2">
            <svg className="text-hero-foreground size-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Deploy in minutes
          </div>
        </div>
      </div>
    </section>
  );
}
