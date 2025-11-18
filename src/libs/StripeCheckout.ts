import type Stripe from 'stripe';
import { z } from 'zod';
import { stripe } from './Stripe';

const priceDataSchema = z.object({
  currency: z.string().min(1),
  unitAmount: z.number().int().positive(),
  productName: z.string().min(1),
  productDescription: z.string().optional(),
});

const lineItemSchema = z.object({
  price: z.string().min(1).optional(),
  priceData: priceDataSchema.optional(),
  quantity: z.number().int().positive().default(1),
}).refine(
  value => Boolean(value.price) || Boolean(value.priceData),
  {
    message: 'Provide either a `price` or `priceData` for each line item.',
    path: ['price'],
  },
);

export const checkoutSessionSchema = z.object({
  mode: z.enum(['payment', 'subscription']).default('subscription'),
  priceId: z.string().min(1).optional(),
  quantity: z.number().int().positive().default(1),
  lineItems: z.array(lineItemSchema).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  clientReferenceId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  allowPromotionCodes: z.boolean().optional(),
}).refine(
  value => value.priceId || (value.lineItems && value.lineItems.length > 0),
  {
    message: 'Provide either a `priceId` or a `lineItems` array.',
    path: ['priceId'],
  },
);

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;

export type CheckoutSessionOptions = {
  baseUrl: string;
  successPath?: string;
  cancelPath?: string;
};

const buildAbsoluteUrl = (baseUrl: string, path: string) => {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

export const createCheckoutSession = async (
  input: unknown,
  options: CheckoutSessionOptions,
) => {
  const parsedInput = checkoutSessionSchema.parse(input);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
    = parsedInput.lineItems
      ? parsedInput.lineItems.map((item) => {
          if (item.priceData) {
            return {
              price_data: {
                currency: item.priceData.currency,
                unit_amount: item.priceData.unitAmount,
                product_data: {
                  name: item.priceData.productName,
                  description: item.priceData.productDescription,
                },
              },
              quantity: item.quantity ?? 1,
            };
          }

          return {
            price: item.price!,
            quantity: item.quantity ?? 1,
          };
        })
      : [
          {
            price: parsedInput.priceId!,
            quantity: parsedInput.quantity,
          },
        ];

  const successUrl = parsedInput.successUrl
    ?? `${buildAbsoluteUrl(options.baseUrl, options.successPath ?? '/stripe/success')}?session_id={CHECKOUT_SESSION_ID}`;

  const cancelUrl = parsedInput.cancelUrl
    ?? buildAbsoluteUrl(options.baseUrl, options.cancelPath ?? '/stripe/canceled');

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: parsedInput.mode,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
  };

  if (parsedInput.metadata) {
    params.metadata = parsedInput.metadata;
  }

  if (parsedInput.clientReferenceId) {
    params.client_reference_id = parsedInput.clientReferenceId;
  }

  if (parsedInput.customerEmail) {
    params.customer_email = parsedInput.customerEmail;
  }

  if (typeof parsedInput.allowPromotionCodes !== 'undefined') {
    params.allow_promotion_codes = parsedInput.allowPromotionCodes;
  }

  return stripe.checkout.sessions.create(params);
};
