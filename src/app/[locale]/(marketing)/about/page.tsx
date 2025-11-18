import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

type IAboutProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IAboutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function About(props: IAboutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="prose prose-slate mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{t('meta_title')}</h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">{t('about_paragraph')}</p>

        <div className="mt-8 text-center text-sm text-slate-600">
          {`${t('translation_powered_by')} `}
          <a
            className="font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-strong)]"
            href="https://l.crowdin.com/next-js"
          >
            Crowdin
          </a>
        </div>

        <a href="https://l.crowdin.com/next-js" className="mt-4 block text-center">
          <Image
            className="mx-auto"
            src="/assets/images/crowdin-dark.png"
            alt="Crowdin Translation Management System"
            width={128}
            height={26}
          />
        </a>
      </div>
    </div>
  );
};
