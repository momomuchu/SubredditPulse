import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ITermsProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ITermsProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Terms',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Terms(props: ITermsProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Terms',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="prose prose-slate dark:prose-invert mx-auto max-w-none">
        <h1 className="text-4xl font-bold tracking-tight">{t('heading')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('last_updated', { date: new Date().toLocaleDateString() })}
        </p>

        <div className="mt-8 space-y-8">
          <section>
            <p className="text-lg leading-8">{t('intro')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('acceptance_heading')}</h2>
            <p className="mt-4 leading-7">{t('acceptance_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('use_heading')}</h2>
            <p className="mt-4 leading-7">{t('use_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('restrictions_heading')}</h2>
            <p className="mt-4 leading-7">{t('restrictions_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('termination_heading')}</h2>
            <p className="mt-4 leading-7">{t('termination_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('limitation_heading')}</h2>
            <p className="mt-4 leading-7">{t('limitation_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('changes_heading')}</h2>
            <p className="mt-4 leading-7">{t('changes_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('contact_heading')}</h2>
            <p className="mt-4 leading-7">{t('contact_content')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
