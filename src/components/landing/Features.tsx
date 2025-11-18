export function Features() {
  // Grouped by category for better visual rhythm
  const coreFeatures = [
    {
      icon: '⚡',
      title: 'Auth & Database',
      description: 'NextAuth.js + DrizzleORM with PGlite. No Docker needed.',
    },
    {
      icon: '💳',
      title: 'Stripe Payments',
      description: 'Checkout sessions and webhooks already integrated.',
    },
    {
      icon: '🎨',
      title: 'Tailwind 4 + Theming',
      description: 'Custom design system with CSS variables and dark mode.',
    },
  ];

  const devExperience = [
    {
      icon: '🔒',
      title: 'TypeScript First',
      description: 'Full type safety across your entire stack.',
    },
    {
      icon: '🧪',
      title: 'Testing Ready',
      description: 'Vitest + Playwright pre-configured.',
    },
    {
      icon: '🌍',
      title: 'i18n Built-in',
      description: 'Multi-language support with next-intl.',
    },
  ];

  const production = [
    {
      icon: '📊',
      title: 'Monitoring',
      description: 'Sentry errors + PostHog analytics.',
    },
    {
      icon: '🛡️',
      title: 'Security',
      description: 'Arcjet bot protection and rate limiting.',
    },
    {
      icon: '🚀',
      title: 'Deploy Anywhere',
      description: 'Vercel, Netlify, or your own server.',
    },
  ];

  return (
    <section className="bg-bg-primary text-text-primary relative px-4 py-24 transition-colors sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header - stronger hierarchy */}
        <div className="mb-20 text-center">
          <h2 className="text-text-primary mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Everything you need.
            {' '}
            <span className="text-text-secondary">Nothing you don't.</span>
          </h2>
          <p className="text-text-secondary mx-auto max-w-2xl text-lg">
            Stop wiring up auth for the 10th time. Ship features instead.
          </p>
        </div>

        {/* Core Features - larger, more prominent */}
        <div className="mb-16">
          <h3 className="text-text-secondary mb-8 text-sm font-semibold tracking-wider uppercase">
            Core Stack
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            {coreFeatures.map(feature => (
              <div
                key={feature.title}
                className="group border-surface-border bg-surface-card hover:border-primary relative rounded-2xl border p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="text-text-on-surface mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-text-muted-on-surface text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Experience - medium prominence */}
        <div className="mb-16">
          <h3 className="text-text-secondary mb-8 text-sm font-semibold tracking-wider uppercase">
            Developer Experience
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {devExperience.map(feature => (
              <div
                key={feature.title}
                className="border-surface-border bg-bg-secondary hover:border-primary hover:bg-surface-card rounded-xl border p-6 transition-all duration-200 hover:shadow-lg"
              >
                <div className="mb-3 text-3xl">{feature.icon}</div>
                <h3 className="text-text-on-surface mb-2 text-lg font-bold">{feature.title}</h3>
                <p className="text-text-muted-on-surface text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Production Features - compact */}
        <div>
          <h3 className="text-text-secondary mb-8 text-sm font-semibold tracking-wider uppercase">
            Production Ready
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {production.map(feature => (
              <div
                key={feature.title}
                className="border-surface-border bg-surface-card hover:border-primary flex items-start gap-4 rounded-xl border p-6 transition-all duration-200 hover:shadow-md"
              >
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <h3 className="text-text-on-surface mb-1 text-base font-bold">{feature.title}</h3>
                  <p className="text-text-muted-on-surface text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA - subtle */}
        <div className="mt-20 text-center">
          <p className="text-text-secondary text-base">
            Plus MDX articles, S3 storage, logging, Storybook, and more
          </p>
        </div>
      </div>
    </section>
  );
}
