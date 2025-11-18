import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { DemoBanner } from '@/components/DemoBanner';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { AppConfig } from '@/utils/AppConfig';
import '@/styles/global.css';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });

  return (
    <>
      <DemoBanner />
      <BaseTemplate
        leftNav={(
          <>
            <li>
              <Link
                href="/"
                className="text-text-primary hover:text-primary text-lg font-semibold transition-colors"
              >
                {AppConfig.name}
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
              >
                {t('home_link')}
              </Link>
            </li>
            <li>
              <Link
                href="/about/"
                className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
              >
                {t('about_link')}
              </Link>
            </li>
          </>
        )}
        rightNav={(
          <>
            <li>
              <Link
                href="/sign-in/"
                className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
              >
                {t('sign_in_link')}
              </Link>
            </li>
            <li>
              <Link
                href="/sign-up/"
                className="text-primary-foreground rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold shadow-sm transition-colors hover:bg-[var(--color-primary-strong)]"
              >
                {t('sign_up_link')}
              </Link>
            </li>
            <li>
              <DarkModeToggle />
            </li>
            <li>
              <ThemeSwitcher />
            </li>
            <li>
              <LocaleSwitcher />
            </li>
          </>
        )}
      >
        {props.children}

        <footer className="border-surface-border bg-bg-secondary border-t transition-colors">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-text-secondary text-sm transition-colors">
                {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}.`}
              </div>
              <div className="flex gap-6">
                <Link
                  href="/privacy/"
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                >
                  {t('privacy_link')}
                </Link>
                <Link
                  href="/terms/"
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                >
                  {t('terms_link')}
                </Link>
                <Link
                  href="/cookies/"
                  className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                >
                  {t('cookies_link')}
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </BaseTemplate>
    </>
  );
}
