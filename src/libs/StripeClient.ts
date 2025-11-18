import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | undefined;

/**
 * Lazily load Stripe.js on the client.
 * Always call this inside a client component or hook.
 */
export const getStripeJs = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      throw new Error('`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is not configured.');
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};
