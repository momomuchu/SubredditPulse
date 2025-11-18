export type CreditPackageId = 'starter' | 'builder' | 'scale';

export const creditPackageCatalog: Record<CreditPackageId, {
  amount: number;
  currency: string;
  credits: number;
  productName: string;
  productDescription: string;
}> = {
  starter: {
    amount: 1900,
    currency: 'usd',
    credits: 100,
    productName: 'Starter credit pack',
    productDescription: 'Enough for your next prototype.',
  },
  builder: {
    amount: 4900,
    currency: 'usd',
    credits: 350,
    productName: 'Builder credit pack',
    productDescription: 'Perfect when you are iterating quickly.',
  },
  scale: {
    amount: 9900,
    currency: 'usd',
    credits: 900,
    productName: 'Scale credit pack',
    productDescription: 'Optimised for teams with production workloads.',
  },
};
