'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddSubredditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    subredditName: '',
    keywords: [''],
    scanFrequency: 'daily',
    postLimit: 100,
    sentimentThreshold: 0.2,
  });

  const handleAddKeyword = () => {
    if (formData.keywords.length < 10) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, ''],
      });
    }
  };

  const handleRemoveKeyword = (index: number) => {
    const newKeywords = formData.keywords.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      keywords: newKeywords.length > 0 ? newKeywords : [''],
    });
  };

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...formData.keywords];
    newKeywords[index] = value;
    setFormData({
      ...formData,
      keywords: newKeywords,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Filter out empty keywords
      const keywords = formData.keywords.filter(k => k.trim().length > 0);

      if (keywords.length === 0) {
        setError('Please add at least one keyword');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/subreddits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          keywords,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add subreddit');
      }

      // Redirect to dashboard
      router.push('/dashboard/pulse');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Add Subreddit to Monitor</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subreddit Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Subreddit Name
          </label>
          <div className="flex items-center">
            <span className="rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 py-2">
              r/
            </span>
            <input
              type="text"
              value={formData.subredditName}
              onChange={e =>
                setFormData({ ...formData, subredditName: e.target.value })}
              className="w-full rounded-r-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
              placeholder="gaming"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enter the subreddit name without the r/ prefix
          </p>
        </div>

        {/* Keywords */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Keywords to Track (up to 10)
          </label>
          {formData.keywords.map((keyword, index) => (
            <div key={index} className="mb-2 flex items-center gap-2">
              <input
                type="text"
                value={keyword}
                onChange={e => handleKeywordChange(index, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
                placeholder={`Keyword ${index + 1}`}
              />
              {formData.keywords.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(index)}
                  className="rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {formData.keywords.length < 10 && (
            <button
              type="button"
              onClick={handleAddKeyword}
              className="mt-2 rounded-lg bg-purple-100 px-4 py-2 text-purple-600 hover:bg-purple-200"
            >
              + Add Keyword
            </button>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Track mentions and sentiment of specific keywords or phrases
          </p>
        </div>

        {/* Scan Frequency */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Scan Frequency
          </label>
          <select
            value={formData.scanFrequency}
            onChange={e =>
              setFormData({ ...formData, scanFrequency: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
          >
            <option value="daily">Daily</option>
            <option value="every_3_days">Every 3 Days</option>
            <option value="weekly">Weekly</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            How often should we automatically scan this subreddit?
          </p>
        </div>

        {/* Post Limit */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Posts per Scan
          </label>
          <select
            value={formData.postLimit}
            onChange={e =>
              setFormData({ ...formData, postLimit: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
          >
            <option value={100}>100 posts</option>
            <option value={200}>200 posts</option>
            <option value={300}>300 posts</option>
            <option value={500}>500 posts</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            More posts = more accurate sentiment analysis
          </p>
        </div>

        {/* Sentiment Threshold */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Sentiment Alert Threshold
          </label>
          <select
            value={formData.sentimentThreshold}
            onChange={e =>
              setFormData({
                ...formData,
                sentimentThreshold: Number(e.target.value),
              })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
          >
            <option value={0.1}>10% drop</option>
            <option value={0.2}>20% drop</option>
            <option value={0.3}>30% drop</option>
            <option value={0.5}>50% drop</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Get alerted when sentiment drops by this percentage
          </p>
        </div>

        {/* Pricing Info */}
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-medium text-blue-900">Pricing</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>Setup fee: $8 one-time per subreddit</li>
            <li>Automatic scans: Included in setup fee</li>
            <li>Manual scans: $1 per scan (uses 1 credit)</li>
            <li>Deep scans (500+ posts): $2 per scan (uses 2 credits)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Subreddit ($8)'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
