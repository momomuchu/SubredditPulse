'use client';

import type { CreditPackageId } from '@/config/credits';
import { useTranslations } from 'next-intl';
import { useMemo, useTransition } from 'react';
import { createCreditsCheckoutSession } from '@/actions/stripe';
import { creditPackageCatalog } from '@/config/credits';
import { toast } from '@/utils/toast';

export function CreditsPurchase() {
  const t = useTranslations('DashboardPayments');
  const [isPending, startTransition] = useTransition();

  const packages = useMemo(() => {
    const packageOrder: CreditPackageId[] = ['starter', 'builder', 'scale'];

    return packageOrder.map((id) => {
      const pkg = creditPackageCatalog[id];
      const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: pkg.currency.toUpperCase(),
        minimumFractionDigits: 2,
      });
      const formatted = formatter.format(pkg.amount / 100);

      return {
        id,
        price: formatted,
        credits: pkg.credits,
      };
    });
  }, []);

  const handlePurchase = (packageId: CreditPackageId) => {
    const toastId = toast.loading('Processing payment...');

    startTransition(async () => {
      const result = await createCreditsCheckoutSession(packageId);

      toast.dismiss(toastId);

      if (result.success && result.url) {
        toast.success('Redirecting to checkout...');
        window.location.href = result.url;
        return;
      }

      if (!result.success) {
        let errorMsg: string;

        switch (result.code) {
          case 'UNAUTHENTICATED':
            errorMsg = t('error_unauthenticated');
            break;
          case 'VALIDATION_ERROR':
            errorMsg = t('error_validation');
            break;
          case 'STRIPE_ERROR':
            errorMsg = t('error_stripe');
            break;
          default:
            errorMsg = t('generic_error');
        }

        toast.error(errorMsg, {
          description: 'Please try again or contact support if the issue persists.',
        });
      } else {
        toast.error(t('generic_error'));
      }
    });
  };

  return (
    <div className="border-surface-border bg-surface-card text-text-on-surface shadow-elevated flex h-full flex-col gap-6 rounded-3xl border p-6 transition-colors">
      <div className="flex flex-col gap-2">
        <p className="text-text-muted-on-surface text-sm font-semibold tracking-wider uppercase">
          {t('label')}
        </p>
        <h2 className="text-2xl leading-tight font-semibold sm:text-3xl">
          {t('title')}
        </h2>
        <p className="text-text-muted-on-surface text-sm sm:text-base">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid gap-3">
        {packages.map(pkg => (
          <button
            key={pkg.id}
            type="button"
            onClick={() => handlePurchase(pkg.id)}
            disabled={isPending}
            className="group border-surface-border bg-bg-secondary/60 hover:border-primary/60 hover:bg-primary/10 focus:ring-primary/40 flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900/40"
          >
            <span className="flex flex-col gap-1">
              <span className="text-text-on-surface text-sm font-semibold sm:text-base">
                {t(`packages.${pkg.id}.name`)}
              </span>
              <span className="text-text-muted-on-surface text-xs sm:text-sm">
                {t('credits_included', { credits: pkg.credits })}
              </span>
            </span>
            <span className="text-primary flex items-center gap-2 text-sm font-semibold tracking-tight sm:text-base">
              {pkg.price}
              <svg
                className="size-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <div className="border-primary/40 bg-primary/5 text-primary rounded-2xl border border-dashed px-4 py-3 text-xs sm:text-sm">
        {t('note')}
      </div>
    </div>
  );
}
