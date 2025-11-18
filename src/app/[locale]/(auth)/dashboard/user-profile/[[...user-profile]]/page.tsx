import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AuthSignOutButton } from '@/components/AuthButtons';
import { db } from '@/libs/DB';
import { accounts } from '@/models/Schema';
import { getI18nPath } from '@/utils/Helpers';

type IUserProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IUserProfilePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'UserProfile',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function UserProfilePage(props: IUserProfilePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const session = await auth();

  if (!session) {
    redirect(getI18nPath('/sign-in', locale));
  }

  const t = await getTranslations({
    locale,
    namespace: 'UserProfile',
  });
  const name = session.user?.name ?? t('missing_value');
  const email = session.user?.email ?? t('missing_value');
  const userId = session.user?.id as string | undefined;
  const providerLabels: Record<string, string> = {
    github: 'GitHub',
    google: 'Google',
    credentials: t('provider_password'),
  };
  let providerDisplay = t('missing_value');

  if (userId) {
    const connectedAccounts = await db
      .select({ provider: accounts.provider })
      .from(accounts)
      .where(eq(accounts.userId, userId));

    if (connectedAccounts.length > 0) {
      providerDisplay = connectedAccounts
        .map(accountRecord => providerLabels[accountRecord.provider as keyof typeof providerLabels] ?? accountRecord.provider)
        .join(', ');
    }
  }
  const signOutUrl = getI18nPath('/', locale);

  return (
    <div className="my-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          {t('heading')}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('description')}
        </p>
      </div>

      <dl className="space-y-4 rounded-lg border border-gray-200 p-6 shadow-sm">
        <div>
          <dt className="text-sm font-medium text-gray-500">{t('name_label')}</dt>
          <dd className="text-base text-gray-900">{name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">{t('email_label')}</dt>
          <dd className="text-base text-gray-900">{email}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">{t('provider_label')}</dt>
          <dd className="text-base text-gray-900">{providerDisplay}</dd>
        </div>
      </dl>

      <AuthSignOutButton
        callbackUrl={signOutUrl}
        className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      >
        {t('sign_out')}
      </AuthSignOutButton>
    </div>
  );
};
