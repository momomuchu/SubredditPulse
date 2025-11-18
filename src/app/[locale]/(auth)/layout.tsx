import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/auth';
import { AuthSessionProvider } from '@/components/AuthSessionProvider';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const session = await auth();

  return (
    <AuthSessionProvider session={session}>
      {props.children}
    </AuthSessionProvider>
  );
}
