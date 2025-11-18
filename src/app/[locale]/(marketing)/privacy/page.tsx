import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IPrivacyProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IPrivacyProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Privacy',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Privacy(props: IPrivacyProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Privacy',
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
            <h2 className="text-2xl font-bold">{t('collection_heading')}</h2>
            <p className="mt-4 leading-7">{t('collection_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('use_heading')}</h2>
            <p className="mt-4 leading-7">{t('use_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('sharing_heading')}</h2>
            <p className="mt-4 leading-7">{t('sharing_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('security_heading')}</h2>
            <p className="mt-4 leading-7">{t('security_content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">{t('rights_heading')}</h2>
            <p className="mt-4 leading-7">{t('rights_content')}</p>
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
