import { desc, eq } from 'drizzle-orm';

import Link from 'next/link';
import { auth } from '@/auth';
import { db } from '@/libs/DB';
import { monitoredSubreddits, scans, userCredits } from '@/models/Schema';

export default async function PulseDashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  // Get user's subreddits
  const subreddits = await db.select()
    .from(monitoredSubreddits)
    .where(eq(monitoredSubreddits.userId, session.user.id))
    .orderBy(desc(monitoredSubreddits.createdAt));

  // Get user's credits
  const [credits] = await db.select()
    .from(userCredits)
    .where(eq(userCredits.userId, session.user.id))
    .limit(1);

  // Get recent scans
  const recentScans = await db.select()
    .from(scans)
    .orderBy(desc(scans.createdAt))
    .limit(5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SubredditPulse Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor sentiment shifts in your niche subreddits
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-purple-100 px-4 py-2 text-center">
            <div className="text-sm text-gray-600">Credits</div>
            <div className="text-2xl font-bold text-purple-600">
              {credits?.credits || 0}
            </div>
          </div>
          <Link
            href="/dashboard/pulse/add"
            className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            + Add Subreddit
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Monitored Subreddits</div>
          <div className="text-3xl font-bold text-gray-900">
            {subreddits.length}
            /3
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Total Scans</div>
          <div className="text-3xl font-bold text-gray-900">
            {recentScans.length}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Active Alerts</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>
      </div>

      {/* Monitored Subreddits */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Monitored Subreddits</h2>
        {subreddits.length === 0
          ? (
              <div className="rounded-lg bg-white p-8 text-center shadow">
                <p className="mb-4 text-gray-600">
                  You haven't added any subreddits yet.
                </p>
                <Link
                  href="/dashboard/pulse/add"
                  className="inline-block rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
                >
                  Add Your First Subreddit
                </Link>
              </div>
            )
          : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subreddits.map((subreddit: any) => (
                  <Link
                    key={subreddit.id}
                    href={`/dashboard/pulse/${subreddit.id}`}
                    className="block rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xl font-bold">
                        r/
                        {subreddit.displayName}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          subreddit.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {subreddit.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mb-4 text-sm text-gray-600">
                      <div>
                        Frequency:
                        {' '}
                        {subreddit.scanFrequency.replace('_', ' ')}
                      </div>
                      <div>
                        Posts per scan:
                        {' '}
                        {subreddit.postLimit}
                      </div>
                    </div>
                    {subreddit.lastScanAt && (
                      <div className="text-sm text-gray-500">
                        Last scan:
                        {' '}
                        {new Date(subreddit.lastScanAt).toLocaleDateString()}
                      </div>
                    )}
                    {!subreddit.lastScanAt && (
                      <div className="text-sm text-orange-600">
                        No scans yet - Click to run first scan
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
      </div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Recent Scans</h2>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Sentiment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Posts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentScans.map((scan: any) => (
                  <tr key={scan.id}>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {scan.scanType}
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
                      {scan.postsScanned || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 rounded-lg bg-purple-50 p-6">
        <h3 className="mb-4 text-lg font-bold">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/pulse/add"
            className="rounded-lg bg-white p-4 text-center shadow hover:shadow-md"
          >
            <div className="mb-2 text-2xl">➕</div>
            <div className="font-medium">Add Subreddit</div>
          </Link>
          <Link
            href="/dashboard/pulse/credits"
            className="rounded-lg bg-white p-4 text-center shadow hover:shadow-md"
          >
            <div className="mb-2 text-2xl">💳</div>
            <div className="font-medium">Buy Credits</div>
          </Link>
          <Link
            href="/dashboard/pulse/alerts"
            className="rounded-lg bg-white p-4 text-center shadow hover:shadow-md"
          >
            <div className="mb-2 text-2xl">🔔</div>
            <div className="font-medium">View Alerts</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
