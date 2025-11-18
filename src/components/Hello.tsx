import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';

export const Hello = async () => {
  const t = await getTranslations('Dashboard');
  const session = await auth();
  const email = session?.user?.email ?? '';
  const identifierFromEmail = email ? email.split('@')[0] ?? '' : '';
  const baseIdentifier = session?.user?.name || identifierFromEmail || t('guest_label');

  return (
    <section className="border-surface-border bg-surface-card text-text-on-surface shadow-elevated relative overflow-hidden rounded-3xl border p-8 transition-colors">
      <div
        className="pointer-events-none absolute -top-24 -right-32 hidden size-[28rem] rounded-full bg-[var(--color-primary)] opacity-30 blur-3xl sm:inline"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-1/2 size-[26rem] -translate-x-1/2 rounded-full bg-[var(--color-secondary)] opacity-20 blur-[160px]"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6">
        <span className="text-text-muted-on-surface inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6l7 4-7 4-7-4 7-4zm0 8l7-4m-7 4l-7-4m7 4v6m0-6L5 10m7 4l7-4"
            />
          </svg>
          {t('badge_label')}
        </span>

        <h1 className="text-text-on-surface text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          {t('greeting_title', { name: baseIdentifier })}
        </h1>

        <p className="text-text-muted-on-surface max-w-2xl text-base sm:text-lg">
          {t('greeting_subtitle')}
        </p>

        <div className="border-surface-border/70 bg-bg-secondary/60 text-text-muted-on-surface flex w-full flex-wrap items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition-colors dark:bg-slate-900/40">
          <span className="text-text-on-surface font-medium">
            {t('email_caption')}
          </span>
          <code className="text-text-on-surface rounded-lg bg-white/20 px-2 py-1 text-sm font-medium dark:bg-white/10">
            {email || t('guest_label')}
          </code>
        </div>
      </div>
    </section>
  );
};
