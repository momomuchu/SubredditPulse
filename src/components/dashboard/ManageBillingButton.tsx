'use client';

import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { createBillingPortalSession } from '@/actions/stripe';

type ManageBillingButtonProps = {
  className?: string;
  variant?: 'primary' | 'ghost';
};

export function ManageBillingButton({ className, variant = 'primary' }: ManageBillingButtonProps) {
  const t = useTranslations('DashboardBilling');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setError(null);

    startTransition(async () => {
      const result = await createBillingPortalSession('/dashboard/');

      if (result.success) {
        window.location.href = result.url;

        return;
      }

      switch (result.code) {
        case 'MISSING_CUSTOMER':
          setError(t('missing_customer'));
          break;
        case 'UNAUTHENTICATED':
          setError(t('not_authenticated'));
          break;
        default:
          setError(t('generic_error'));
      }
    });
  };

  const baseClasses = variant === 'ghost'
    ? 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-text-secondary transition-all hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50'
    : 'inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-primary/40 dark:bg-primary/20 dark:text-primary-foreground';

  const containerClasses = variant === 'ghost'
    ? 'inline-flex flex-col items-start gap-1'
    : 'flex flex-col items-start gap-2';

  return (
    <div className={containerClasses}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`${baseClasses} ${className ?? ''}`}
      >
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 17.25v-3.75a3.75 3.75 0 10-7.5 0v3.75M4.5 9h15M6.75 9V7.5a5.25 5.25 0 1110.5 0V9"
          />
        </svg>
        {isPending ? t('opening_portal') : t('manage_billing_cta')}
      </button>
      {variant === 'primary' && error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
