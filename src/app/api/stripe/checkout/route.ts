import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { auth } from '@/auth';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { createCheckoutSession } from '@/libs/StripeCheckout';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const deriveBaseUrl = (request: Request) => {
  if (Env.NEXT_PUBLIC_APP_URL) {
    return Env.NEXT_PUBLIC_APP_URL;
  }

  const originHeader = request.headers.get('origin');

  if (originHeader) {
    return originHeader;
  }

  const protocol = request.headers.get('x-forwarded-proto') ?? 'http';
  const host = request.headers.get('host') ?? 'localhost:3000';

  return `${protocol}://${host}`;
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    // Add userId to metadata for SubredditPulse credit purchases
    const userSession = await auth();
    if (userSession?.user?.id && typeof payload === 'object' && payload !== null) {
      const payloadObj = payload as any;
      if (payloadObj.metadata && !payloadObj.metadata.userId) {
        payloadObj.metadata.userId = userSession.user.id;
      }
    }

    const baseUrl = deriveBaseUrl(request);
    const checkoutSession = await createCheckoutSession(payload, { baseUrl });

    return NextResponse.json(
      {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed.', issues: error.issues },
        { status: 400, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      logger.error('Stripe checkout session creation failed', {
        type: error.type,
        code: error.code,
        requestId: error.requestId,
        message: error.message,
      });

      return NextResponse.json(
        { error: 'Unable to create checkout session.' },
        { status: 502, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    logger.error('Unexpected error while creating checkout session', {
      error,
    });

    return NextResponse.json(
      { error: 'Unexpected error while creating checkout session.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
