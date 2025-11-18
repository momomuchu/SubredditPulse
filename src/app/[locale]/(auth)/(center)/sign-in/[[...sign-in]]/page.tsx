import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CredentialsSignInForm } from '@/components/auth/CredentialsSignInForm';
import { AuthSignInButton } from '@/components/AuthButtons';
import { GitHubIcon, GoogleIcon } from '@/components/icons/BrandIcons';
import { getBaseUrl, getI18nPath } from '@/utils/Helpers';

type ISignInPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignInPage(props: ISignInPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const session = await auth();

  if (session) {
    redirect(getI18nPath('/dashboard/', locale));
  }

  const t = await getTranslations({
    locale,
    namespace: 'SignIn',
  });
  const dashboardPath = getI18nPath('/dashboard/', locale);
  const dashboardUrl = `${getBaseUrl()}${dashboardPath}`;
  const credentialsLabels = {
    heading: t('credentials_heading'),
    helper: t('credentials_helper'),
    email: t('email_label'),
    password: t('password_label'),
    submit: t('credentials_submit'),
    error: t('credentials_error'),
  };

  return (
    <section className=" bg-gradient-hero flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 text-white sm:py-16">
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute top-[-14rem] left-1/3 hidden size-[36rem] -translate-x-1/2 rounded-full bg-[var(--color-primary)] opacity-30 blur-3xl md:inline" />
        <span className="absolute top-1/2 right-[-10rem] hidden size-[30rem] -translate-y-1/2 rounded-full bg-[var(--color-secondary)] opacity-20 blur-[140px] lg:inline" />
        <span className="absolute top-1/2 left-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 opacity-40 blur-[180px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-xl flex-col items-center text-center text-white md:items-start md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/90 uppercase ring-1 ring-white/20 backdrop-blur-sm ring-inset">
            <svg className="size-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t('badge_title')}
          </span>
          <h1 className="mt-8 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
            {t('hero_heading')}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/80 md:text-xl">
            {t('hero_subheading')}
          </p>

          <div className="mt-10 flex w-full flex-col gap-3">
            <AuthSignInButton
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-gray-900 shadow-xl shadow-black/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl focus:ring-2 focus:ring-white/40 focus:outline-none"
              callbackUrl={dashboardUrl}
            >
              <GitHubIcon className="text-[var(--color-primary-foreground)] transition-transform group-hover:scale-110" />
              {t('cta_github')}
            </AuthSignInButton>
            <AuthSignInButton
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 focus:ring-2 focus:ring-white/30 focus:outline-none"
              provider="google"
              callbackUrl={dashboardUrl}
            >
              <GoogleIcon className="transition-transform group-hover:scale-110" />
              {t('cta_google')}
            </AuthSignInButton>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-white/60">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{t('helper')}</p>
          </div>
        </div>

        <div className="w-full md:w-[440px]">
          <CredentialsSignInForm
            redirectPath={dashboardUrl}
            labels={credentialsLabels}
          />
        </div>
      </div>
    </section>
  );
};
