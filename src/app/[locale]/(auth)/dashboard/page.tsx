import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { CreditsPurchase } from '@/components/dashboard/CreditsPurchase';
import { ManageBillingButton } from '@/components/dashboard/ManageBillingButton';
import { Hello } from '@/components/Hello';
import { getI18nPath } from '@/utils/Helpers';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function Dashboard(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('Dashboard');
  const profileUrl = getI18nPath('/dashboard/user-profile/', locale);

  const quickActions = [
    {
      key: 'new',
      title: t('action_new_project'),
      description: t('action_new_project_desc'),
      href: '#',
      icon: (
        <svg className="text-primary size-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    },
    {
      key: 'docs',
      title: t('action_view_docs'),
      description: t('action_view_docs_desc'),
      href: '#',
      icon: (
        <svg className="text-primary size-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-9a1.5 1.5 0 00-1.5-1.5h-6.75M19.5 14.25l-7.5 7.5m7.5-7.5h-6a1.5 1.5 0 01-1.5-1.5v-6m0 0L4.5 3.75m6 2.25L4.5 12"
          />
        </svg>
      ),
    },
    {
      key: 'settings',
      title: t('action_open_settings'),
      description: t('action_open_settings_desc'),
      href: profileUrl,
      icon: (
        <svg className="text-primary size-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93a8.001 8.001 0 012.383 1.377c.331.287.81.375 1.205.17l.764-.382a1.125 1.125 0 011.45.516l.548.986c.275.494.106 1.12-.331 1.45l-.764.547c-.36.258-.53.71-.45 1.146a8.014 8.014 0 010 2.753c-.08.436.09.888.45 1.146l.764.547c.437.33.606.956.331 1.45l-.548.986a1.125 1.125 0 01-1.45.516l-.764-.382c-.395-.205-.874-.117-1.205.17a8.001 8.001 0 01-2.383 1.377c-.396.166-.71.506-.78.93l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.383-.764-.78-.93a8.003 8.003 0 01-2.382-1.377c-.332-.287-.81-.375-1.206-.17l-.764.382a1.125 1.125 0 01-1.45-.516l-.548-.986c-.275-.494-.106-1.12.331-1.45l.764-.547c.36-.258.53-.71.45-1.146a8.014 8.014 0 010-2.753c.08-.436-.09-.888-.45-1.146l-.764-.547a1.125 1.125 0 01-.331-1.45l.548-.986a1.125 1.125 0 011.45-.516l.764.382c.395.205.874.117 1.206-.17a8.001 8.001 0 012.382-1.377c.397-.166.71-.506.781-.93l.149-.894z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <main className="bg-bg-primary text-text-primary relative min-h-screen px-6 py-12 transition-colors sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="absolute top-[-6rem] right-[-12rem] hidden size-[28rem] rounded-full bg-[var(--color-primary)] opacity-20 blur-[120px] lg:inline" />
        <span className="absolute bottom-[-10rem] left-[-8rem] hidden size-[24rem] rounded-full bg-[var(--color-secondary)] opacity-15 blur-[140px] md:inline" />
      </div>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Hello />
          <aside className="border-surface-border bg-surface-card text-text-on-surface shadow-elevated rounded-3xl border p-6 transition-colors">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-text-muted-on-surface text-sm font-semibold tracking-wider uppercase">
                  {t('quick_actions_title')}
                </p>
                <h2 className="text-text-on-surface mt-2 text-xl font-semibold">
                  {t('quick_actions_subtitle')}
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {quickActions.map(action => (
                  <Link
                    key={action.key}
                    href={action.href}
                    className="group hover:border-primary/40 focus:ring-primary/40 flex items-start gap-3 rounded-xl border border-transparent bg-white/5 px-4 py-3 text-sm transition-all hover:-translate-y-0.5 hover:bg-white/10 focus:ring-2 focus:outline-none dark:bg-slate-900/40"
                  >
                    <span className="text-primary mt-1">
                      {action.icon}
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-text-on-surface group-hover:text-primary font-semibold">
                        {action.title}
                      </span>
                      <span className="text-text-muted-on-surface text-xs">
                        {action.description}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <article className="border-surface-border bg-surface-card text-text-on-surface shadow-elevated flex flex-col gap-5 rounded-3xl border p-6 transition-colors">
            <div className="flex flex-col gap-2">
              <p className="text-text-muted-on-surface text-sm font-semibold tracking-wider uppercase">
                {t('manage_account_label')}
              </p>
              <h2 className="text-2xl leading-tight font-semibold sm:text-3xl">
                {t('manage_account_title')}
              </h2>
              <p className="text-text-muted-on-surface text-sm sm:text-base">
                {t('manage_account_subtitle')}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[auto,1fr]">
              <ManageBillingButton variant="primary" />
              <Link
                href={profileUrl}
                className="text-text-on-surface hover:text-primary focus:ring-primary/40 inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 focus:ring-2 focus:outline-none"
              >
                <svg
                  className="text-primary size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.25h13.5M5.25 9.75h13.5M9 14.25h9"
                  />
                </svg>
                {t('manage_account_profile_cta')}
              </Link>
            </div>

            <ul className="text-text-muted-on-surface space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="bg-primary mt-1 size-1.5 rounded-full" />
                <span>{t('manage_account_point_billing')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary mt-1 size-1.5 rounded-full" />
                <span>{t('manage_account_point_profile')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary mt-1 size-1.5 rounded-full" />
                <span>{t('manage_account_point_security')}</span>
              </li>
            </ul>
          </article>

          <CreditsPurchase />
        </div>
      </section>
    </main>
  );
}
