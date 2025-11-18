'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type CreditPackage = {
  id: string;
  credits: number;
  price: number;
  name: string;
  pricePerScan: string;
  popular?: boolean;
};

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: '10',
    credits: 10,
    price: 8,
    name: '10 Scans',
    pricePerScan: '$0.80/scan',
  },
  {
    id: '25',
    credits: 25,
    price: 18,
    name: '25 Scans',
    pricePerScan: '$0.72/scan',
    popular: true,
  },
  {
    id: '50',
    credits: 50,
    price: 30,
    name: '50 Scans',
    pricePerScan: '$0.60/scan',
  },
  {
    id: '100',
    credits: 100,
    price: 55,
    name: '100 Scans',
    pricePerScan: '$0.55/scan',
  },
];

export default function CreditsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      fetchCredits();
    }
    if (searchParams.get('canceled') === 'true') {
      setShowCanceled(true);
      setTimeout(() => setShowCanceled(false), 5000);
    }

    fetchCredits();
  }, [searchParams]);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits');
      const data = await response.json();
      setCurrentCredits(data.credits || 0);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);

    try {
      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
      if (!pkg) {
        throw new Error('Package not found');
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'payment',
          lineItems: [{
            priceData: {
              currency: 'usd',
              unitAmount: pkg.price * 100,
              productName: `SubredditPulse - ${pkg.name}`,
              productDescription: `${pkg.credits} scan credits`,
            },
            quantity: 1,
          }],
          successUrl: `${window.location.origin}/dashboard/pulse/credits?success=true&credits=${pkg.credits}`,
          cancelUrl: `${window.location.origin}/dashboard/pulse/credits?canceled=true`,
          metadata: {
            packageId,
            credits: pkg.credits.toString(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/pulse')}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900"
        >
          � Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold">Buy Scan Credits</h1>
        <p className="mt-2 text-gray-600">
          Purchase credits to run manual and deep scans on your monitored subreddits
        </p>
      </div>

      {showSuccess && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
          <strong>Success!</strong>
          {' '}
          Your credits have been added to your account.
        </div>
      )}
      {showCanceled && (
        <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-yellow-800">
          <strong>Payment canceled.</strong>
          {' '}
          Your purchase was not completed.
        </div>
      )}

      <div className="mb-8 rounded-lg bg-purple-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Your Current Balance</div>
            <div className="text-4xl font-bold text-purple-600">{currentCredits}</div>
            <div className="text-sm text-gray-500">scan credits</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Usage</div>
            <div className="text-sm">
              <strong>Manual scan:</strong>
              {' '}
              1 credit
            </div>
            <div className="text-sm">
              <strong>Deep scan (500+ posts):</strong>
              {' '}
              2 credits
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold">Choose a Credit Package</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CREDIT_PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              className={`relative rounded-lg border-2 bg-white p-6 shadow-lg transition hover:shadow-xl ${
                pkg.popular ? 'border-purple-600' : 'border-gray-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white">
                  BEST VALUE
                </div>
              )}
              <div className="mb-4 text-center">
                <div className="text-sm text-gray-600">{pkg.name}</div>
                <div className="text-4xl font-bold text-gray-900">
                  $
                  {pkg.price}
                </div>
                <div className="text-sm text-gray-500">{pkg.pricePerScan}</div>
              </div>
              <div className="mb-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{pkg.credits}</div>
                <div className="text-sm text-gray-600">scan credits</div>
              </div>
              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading === pkg.id}
                className={`w-full rounded-lg px-4 py-3 font-medium text-white transition ${
                  pkg.popular
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-700 hover:bg-gray-800'
                } disabled:opacity-50`}
              >
                {loading === pkg.id ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-bold">How Credits Work</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-gray-900">Automatic Scans</h4>
            <p className="text-sm text-gray-600">
              When you set up a subreddit ($8 setup fee), automatic scans based on your
              chosen frequency (daily, every 3 days, or weekly) are included. No additional
              credits needed for automatic scans!
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-gray-900">Manual Scans</h4>
            <p className="text-sm text-gray-600">
              Want to scan on-demand? Use the "Scan Now" button on any subreddit. Manual
              scans cost 1 credit (100 posts) or 2 credits for deep scans (500+ posts).
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-gray-900">Credits Never Expire</h4>
            <p className="text-sm text-gray-600">
              Your credits never expire. Purchase once and use them whenever you need
              additional scans beyond your automatic schedule.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-gray-900">Secure Payments</h4>
            <p className="text-sm text-gray-600">
              All payments are processed securely through Stripe. We never store your
              payment information on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
