'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SentimentTrendChart } from '@/components/pulse/SentimentTrendChart';

type Scan = {
  id: string;
  createdAt: string;
  scanType: string;
  status: string;
  overallSentiment: number | null;
  sentimentTrend: string | null;
  postsScanned: number;
};

type Subreddit = {
  id: string;
  subredditName: string;
  displayName: string;
  scanFrequency: string;
  postLimit: number;
  isActive: boolean;
  lastScanAt: string | null;
  keywords: string[];
};

export default function SubredditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [subreddit, setSubreddit] = useState<Subreddit | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      // Fetch subreddits to find this one
      const subredditsRes = await fetch('/api/subreddits');
      const subredditsData = await subredditsRes.json();

      const foundSubreddit = subredditsData.subreddits?.find(
        (s: Subreddit) => s.id === params.id,
      );

      if (!foundSubreddit) {
        setError('Subreddit not found');
        return;
      }

      setSubreddit(foundSubreddit);

      // Fetch scans for this subreddit
      const scansRes = await fetch(`/api/scans?subredditId=${params.id}`);
      const scansData = await scansRes.json();

      setScans(scansData.scans || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScanNow = async () => {
    setScanning(true);
    setError('');

    try {
      const response = await fetch('/api/scans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subredditId: params.id,
          scanType: 'manual',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start scan');
      }

      // Refresh data
      await fetchData();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !subreddit) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          {error || 'Subreddit not found'}
        </div>
      </div>
    );
  }

  const latestScan = scans[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/pulse')}
            className="mb-2 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">
            r/
            {subreddit.displayName}
          </h1>
          <p className="mt-1 text-gray-600">
            Scan frequency:
            {' '}
            {subreddit.scanFrequency.replace('_', ' ')}
            {' '}
            | Posts per scan:
            {' '}
            {subreddit.postLimit}
          </p>
        </div>
        <button
          onClick={handleScanNow}
          disabled={scanning}
          className="rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : 'Scan Now (1 credit)'}
        </button>
      </div>

      {/* Latest Stats */}
      {latestScan && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">Overall Sentiment</div>
            <div
              className={`text-3xl font-bold ${
                latestScan.overallSentiment !== null
                && latestScan.overallSentiment > 0.1
                  ? 'text-green-600'
                  : latestScan.overallSentiment !== null
                    && latestScan.overallSentiment < -0.1
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {latestScan.overallSentiment?.toFixed(2) || 'N/A'}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {latestScan.sentimentTrend || 'stable'}
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">Posts Analyzed</div>
            <div className="text-3xl font-bold text-gray-900">
              {latestScan.postsScanned}
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">Last Scan</div>
            <div className="text-xl font-bold text-gray-900">
              {new Date(latestScan.createdAt).toLocaleDateString()}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {new Date(latestScan.createdAt).toLocaleTimeString()}
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">Total Scans</div>
            <div className="text-3xl font-bold text-gray-900">{scans.length}</div>
          </div>
        </div>
      )}

      {/* Tracked Keywords */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">Tracked Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {subreddit.keywords.map((keyword, index) => (
            <span
              key={index}
              className="rounded-full bg-purple-100 px-4 py-2 text-sm text-purple-700"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Sentiment Trend Chart */}
      {scans.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold">Sentiment Trend</h2>
          <div className="rounded-lg bg-white p-6 shadow">
            <SentimentTrendChart
              scans={scans.map(scan => ({
                id: scan.id,
                createdAt: scan.createdAt,
                overallSentiment: scan.overallSentiment || 0,
                sentimentTrend: scan.sentimentTrend,
              }))}
              title={`Sentiment trend for r/${subreddit.displayName}`}
            />
          </div>
        </div>
      )}

      {/* Scan History */}
      <div>
        <h2 className="mb-4 text-xl font-bold">Scan History</h2>
        {scans.length === 0
          ? (
              <div className="rounded-lg bg-white p-8 text-center shadow">
                <p className="mb-4 text-gray-600">No scans yet</p>
                <button
                  onClick={handleScanNow}
                  disabled={scanning}
                  className="rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
                >
                  Run First Scan
                </button>
              </div>
            )
          : (
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Posts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Sentiment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {scans.map(scan => (
                      <tr
                        key={scan.id}
                        onClick={() => router.push(`/dashboard/pulse/scan/${scan.id}`)}
                        className="cursor-pointer transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          <div>
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(scan.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          <span className="capitalize">{scan.scanType}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              scan.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : scan.status === 'failed'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {scan.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {scan.postsScanned}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          {scan.overallSentiment !== null && (
                            <span
                              className={`font-medium ${
                                scan.overallSentiment > 0.1
                                  ? 'text-green-600'
                                  : scan.overallSentiment < -0.1
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                              }`}
                            >
                              {scan.overallSentiment.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {scan.sentimentTrend && (
                            <span className="capitalize">
                              {scan.sentimentTrend}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>
    </div>
  );
}
