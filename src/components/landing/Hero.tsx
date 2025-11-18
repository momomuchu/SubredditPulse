import Link from 'next/link';

export function Hero() {
  return (
    <section className="bg-gradient-hero text-hero-foreground relative overflow-hidden px-4 py-24 transition-colors sm:px-6 sm:py-32 lg:px-8 lg:py-40">
      {/* Subtle background elements */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="absolute -top-40 left-1/2 block size-[600px] -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--color-primary)' }} />
        <span className="absolute right-0 -bottom-40 block size-[400px] rounded-full opacity-15 blur-3xl" style={{ background: 'var(--color-secondary)' }} />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge - smaller, cleaner */}
          <div
            className="border-hero-border text-hero-foreground mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-hero-foreground) 12%, transparent)' }}
          >
            <span className="relative flex size-2">
              <span
                className="absolute inline-flex size-full animate-ping rounded-full opacity-75 transition-colors"
                style={{ backgroundColor: 'var(--color-hero-foreground)' }}
              />
              <span
                className="relative inline-flex size-2 rounded-full transition-colors"
                style={{ backgroundColor: 'var(--color-hero-foreground)' }}
              />
            </span>
            Next.js 16 • TypeScript • Tailwind 4
          </div>

          {/* Headline - MUCH larger, more weight */}
          <h1 className="text-hero-foreground mb-6 text-5xl leading-[1.05] font-extrabold tracking-tight transition-colors sm:text-6xl md:text-7xl lg:text-8xl">
            Ship Your SaaS in
            {' '}
            <span className="inline-block bg-gradient-to-r bg-clip-text text-transparent transition-colors">
              Days, Not Months
            </span>
          </h1>

          {/* Subheadline - clearer value prop, smaller text */}
          <p className="text-hero-muted mx-auto mb-10 max-w-2xl text-lg leading-relaxed transition-colors sm:text-xl">
            The only Next.js boilerplate with auth, database, payments, and deployment already configured. Start building features, not infrastructure.
          </p>

          {/* CTA Buttons - clear hierarchy */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/sign-up/"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-gray-900 shadow-xl transition-transform duration-200 hover:scale-105 hover:shadow-2xl sm:w-auto"
            >
              Start Building Free
              <svg
                className="size-5 transition-transform duration-200 group-hover:translate-x-1"
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
          </div>

          {/* Trust indicators - simpler */}
          <div className="text-hero-muted mt-12 flex flex-wrap items-center justify-center gap-6 text-sm transition-colors">
            <div className="flex items-center gap-2">
              <svg className="text-hero-foreground size-4 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              14.5k+ Stars
            </div>
            <div
              className="size-1 rounded-full transition-colors"
              style={{ backgroundColor: 'var(--color-hero-muted)' }}
            />
            <div className="flex items-center gap-2">
              <svg className="text-hero-foreground size-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              100k+ Devs
            </div>
            <div
              className="size-1 rounded-full transition-colors"
              style={{ backgroundColor: 'var(--color-hero-muted)' }}
            />
            <div className="flex items-center gap-2">
              <svg className="text-hero-foreground size-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Production Ready
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
