import Stripe from 'stripe';
import { Env } from './Env';

/**
 * Shared Stripe SDK instance configured with the secret key from the environment.
 * Keep everything that requires the secret key on the server only.
 */
export const stripe = new Stripe(Env.STRIPE_SECRET_KEY, {
  // Pin the API version in the Stripe dashboard if you need to lock to a specific release.
  appInfo: {
    name: 'Next.js Boilerplate',
  },
});
