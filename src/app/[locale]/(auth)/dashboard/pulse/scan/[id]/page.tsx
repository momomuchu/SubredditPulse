'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type TopPost = {
  id: string;
  title: string;
  url: string;
  sentiment: number;
  score: number;
};

type TrendingTopic = {
  keyword: string;
  mentions: number;
  sentiment: number;
};

type ScanDetail = {
  scan: {
    id: string;
    createdAt: string;
    scanType: string;
    status: string;
    postsScanned: number;
  };
  results: {
    id: string;
    overallSentiment: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    trendDirection: string | null;
    comparedToBaseline: number | null;
    topPosts: TopPost[];
    trendingTopics: TrendingTopic[];
    keywordMentions: Record<string, number>;
  };
  subreddit: {
    id: string;
    subredditName: string;
    displayName: string;
  };
};

export default function ScanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [scanDetail, setScanDetail] = useState<ScanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScanDetail();
  }, [params.id]);

  const fetchScanDetail = async () => {
    try {
      const response = await fetch(`/api/scans/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch scan details');
      }

      setScanDetail(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !scanDetail) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          {error || 'Scan not found'}
        </div>
      </div>
    );
  }

  const { scan, results, subreddit } = scanDetail;

  // Separate top posts into positive and negative
  const positivePosts = results.topPosts
    .filter(p => p.sentiment > 0.1)
    .sort((a, b) => b.sentiment - a.sentiment)
    .slice(0, 5);

  const negativePosts = results.topPosts
    .filter(p => p.sentiment < -0.1)
    .sort((a, b) => a.sentiment - b.sentiment)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/dashboard/pulse/${subreddit.id}`)}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900"
        >
          � Back to r/
          {subreddit.displayName}
        </button>
        <h1 className="text-3xl font-bold">Scan Details</h1>
        <p className="mt-2 text-gray-600">
          {new Date(scan.createdAt).toLocaleString()}
          {' '}
          "
          {' '}
          <span className="capitalize">{scan.scanType}</span>
          {' '}
          scan "
          {' '}
          {scan.postsScanned}
          {' '}
          posts analyzed
        </p>
      </div>

      {/* Overview Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Overall Sentiment</div>
          <div
            className={`text-3xl font-bold ${
              results.overallSentiment > 0.1
                ? 'text-green-600'
                : results.overallSentiment < -0.1
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            {results.overallSentiment.toFixed(2)}
          </div>
          {results.trendDirection && (
            <div className="mt-1 text-sm text-gray-500 capitalize">
              {results.trendDirection}
            </div>
          )}
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Positive</div>
          <div className="text-3xl font-bold text-green-600">
            {results.positiveCount}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {((results.positiveCount / scan.postsScanned) * 100).toFixed(1)}
            %
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Neutral</div>
          <div className="text-3xl font-bold text-gray-600">
            {results.neutralCount}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {((results.neutralCount / scan.postsScanned) * 100).toFixed(1)}
            %
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Negative</div>
          <div className="text-3xl font-bold text-red-600">
            {results.negativeCount}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {((results.negativeCount / scan.postsScanned) * 100).toFixed(1)}
            %
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      {results.trendingTopics.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Trending Topics</h2>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Keyword
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Mentions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Avg Sentiment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {results.trendingTopics.map((topic, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      {topic.keyword}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
                        {topic.mentions}
                        {' '}
                        mentions
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          topic.sentiment > 0.1
                            ? 'text-green-600'
                            : topic.sentiment < -0.1
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {topic.sentiment.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Posts - Two Columns */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Most Positive Posts */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-green-600">
            Most Positive Posts
          </h2>
          {positivePosts.length === 0
            ? (
                <div className="rounded-lg bg-white p-6 text-center shadow">
                  <p className="text-gray-600">No highly positive posts found</p>
                </div>
              )
            : (
                <div className="space-y-4">
                  {positivePosts.map(post => (
                    <div
                      key={post.id}
                      className="rounded-lg bg-white p-4 shadow transition hover:shadow-lg"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-sm font-medium text-gray-900 hover:text-purple-600"
                        >
                          {post.title}
                        </a>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium text-green-600">
                          Sentiment:
                          {' '}
                          {post.sentiment.toFixed(2)}
                        </span>
                        <span>
                          Score:
                          {' '}
                          {post.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>

        {/* Most Negative Posts */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-red-600">
            Most Negative Posts
          </h2>
          {negativePosts.length === 0
            ? (
                <div className="rounded-lg bg-white p-6 text-center shadow">
                  <p className="text-gray-600">No highly negative posts found</p>
                </div>
              )
            : (
                <div className="space-y-4">
                  {negativePosts.map(post => (
                    <div
                      key={post.id}
                      className="rounded-lg bg-white p-4 shadow transition hover:shadow-lg"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-sm font-medium text-gray-900 hover:text-purple-600"
                        >
                          {post.title}
                        </a>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium text-red-600">
                          Sentiment:
                          {' '}
                          {post.sentiment.toFixed(2)}
                        </span>
                        <span>
                          Score:
                          {' '}
                          {post.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      </div>

      {/* Keyword Mentions */}
      {Object.keys(results.keywordMentions).length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold">Keyword Mentions</h2>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Object.entries(results.keywordMentions).map(([keyword, count]) => (
                <div key={keyword} className="rounded-lg bg-gray-50 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{count}</div>
                  <div className="text-sm text-gray-600">{keyword}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
