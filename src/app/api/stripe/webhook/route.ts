import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { stripe } from '@/libs/Stripe';
import { payments, users } from '@/models/Schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handledEvents = new Set<Stripe.Event.Type>([
  'checkout.session.completed',
  'checkout.session.expired',
  'checkout.session.async_payment_failed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

export async function POST(request: Request) {
  if (!Env.STRIPE_WEBHOOK_SECRET) {
    logger.error('Stripe webhook secret is not configured.');

    return NextResponse.json({ error: 'Stripe webhook secret is not configured.' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, Env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      logger.error('Stripe webhook signature verification failed', {
        message: error.message,
        requestId: error.requestId,
      });

      return NextResponse.json({ error: 'Invalid Stripe signature.' }, { status: 400 });
    }

    logger.error('Unexpected error while verifying Stripe webhook signature', { error });

    return NextResponse.json({ error: 'Failed to verify Stripe webhook.' }, { status: 400 });
  }

  if (!handledEvents.has(event.type)) {
    logger.debug('Unhandled Stripe event received', { type: event.type });

    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'payment') {
          const paymentIntentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id ?? null;

          const updates: Partial<typeof payments.$inferInsert> = {
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date(),
          };

          if (paymentIntentId) {
            updates.stripePaymentIntentId = paymentIntentId;
          }

          if (typeof session.amount_total === 'number') {
            updates.amount = session.amount_total;
          }

          if (session.currency) {
            updates.currency = session.currency.toLowerCase();
          }

          if (typeof session.customer === 'string') {
            updates.stripeCustomerId = session.customer;
          }

          await db
            .update(payments)
            .set(updates)
            .where(eq(payments.stripeSessionId, session.id));

          if (typeof session.customer === 'string') {
            const paymentRecord = await db.query.payments.findFirst({
              where: (payment, { eq: eqQuery }) => eqQuery(payment.stripeSessionId, session.id),
              columns: {
                userId: true,
              },
            });

            if (paymentRecord?.userId) {
              await db
                .update(users)
                .set({
                  stripeCustomerId: session.customer,
                })
                .where(eq(users.id, paymentRecord.userId));
            }
          }
        }

        logger.info('Stripe checkout session completed', {
          sessionId: session.id,
          customerId: session.customer ?? undefined,
          customerEmail: session.customer_email ?? undefined,
          mode: session.mode,
          status: session.status,
        });

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'payment') {
          await db
            .update(payments)
            .set({
              status: 'expired',
              updatedAt: new Date(),
            })
            .where(eq(payments.stripeSessionId, session.id));
        }

        logger.warn('Stripe checkout session expired', {
          sessionId: session.id,
          customerId: session.customer ?? undefined,
        });

        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'payment') {
          await db
            .update(payments)
            .set({
              status: 'failed',
              updatedAt: new Date(),
            })
            .where(eq(payments.stripeSessionId, session.id));
        }

        logger.error('Stripe checkout session async payment failed', {
          sessionId: session.id,
          customerId: session.customer ?? undefined,
        });

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        logger.info('Stripe invoice payment succeeded', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid,
          currency: invoice.currency,
        });

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        logger.error('Stripe invoice payment failed', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          attemptCount: invoice.attempt_count,
        });

        break;
      }
    }
  } catch (error) {
    logger.error('Error while handling Stripe webhook event', {
      type: event.type,
      error,
    });

    return NextResponse.json({ error: 'Failed to handle Stripe webhook.' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
