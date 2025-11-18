import { desc, eq, sql } from 'drizzle-orm';

import Link from 'next/link';
import { auth } from '@/auth';
import { db } from '@/libs/DB';
import { monitoredSubreddits, scans, userCredits, users } from '@/models/Schema';

export default async function AdminHealthDashboard() {
  const session = await auth();

  // Basic admin check - you should implement proper admin role checking
  if (!session?.user?.email || !session.user.email.includes('admin')) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          Unauthorized - Admin access only
        </div>
      </div>
    );
  }

  // Get system health metrics
  const [totalUsers] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  const [totalSubreddits] = await db
    .select({ count: sql<number>`count(*)` })
    .from(monitoredSubreddits);

  const [totalScans] = await db
    .select({ count: sql<number>`count(*)` })
    .from(scans);

  const [failedScansLast24h] = await db
    .select({ count: sql<number>`count(*)` })
    .from(scans)
    .where(
      sql`${scans.status} = 'failed' AND ${scans.createdAt} > NOW() - INTERVAL '24 hours'`,
    );

  const [totalCredits] = await db
    .select({ sum: sql<number>`COALESCE(SUM(${userCredits.credits}), 0)` })
    .from(userCredits);

  // Recent failed scans
  const recentFailedScans = await db
    .select({
      id: scans.id,
      subredditId: scans.subredditId,
      createdAt: scans.createdAt,
      errorMessage: scans.errorMessage,
      subredditName: monitoredSubreddits.subredditName,
    })
    .from(scans)
    .leftJoin(monitoredSubreddits, eq(scans.subredditId, monitoredSubreddits.id))
    .where(eq(scans.status, 'failed'))
    .orderBy(desc(scans.createdAt))
    .limit(10);

  // Recent scans
  const recentScans = await db
    .select({
      id: scans.id,
      subredditId: scans.subredditId,
      createdAt: scans.createdAt,
      status: scans.status,
      scanType: scans.scanType,
      postsScanned: scans.postsScanned,
      subredditName: monitoredSubreddits.subredditName,
    })
    .from(scans)
    .leftJoin(monitoredSubreddits, eq(scans.subredditId, monitoredSubreddits.id))
    .orderBy(desc(scans.createdAt))
    .limit(20);

  // Subreddits due for scanning
  const subredditsDueForScan = await db
    .select()
    .from(monitoredSubreddits)
    .where(
      sql`${monitoredSubreddits.isActive} = true AND (${monitoredSubreddits.nextScanAt} IS NULL OR ${monitoredSubreddits.nextScanAt} < NOW())`,
    )
    .limit(20);

  const systemHealth = {
    overall: (failedScansLast24h?.count ?? 0) === 0 ? 'healthy' : (failedScansLast24h?.count ?? 0) < 5 ? 'warning' : 'critical',
    totalUsers: totalUsers?.count ?? 0,
    totalSubreddits: totalSubreddits?.count ?? 0,
    totalScans: totalScans?.count ?? 0,
    failedScansLast24h: failedScansLast24h?.count ?? 0,
    totalCredits: totalCredits?.sum ?? 0,
    subredditsDueForScan: subredditsDueForScan.length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Health Dashboard</h1>
        <p className="mt-2 text-gray-600">
          System health monitoring and diagnostics
        </p>
      </div>

      {/* Overall Health Status */}
      <div className="mb-8 rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">System Status</h2>
            <p className="text-sm text-gray-600">Overall health check</p>
          </div>
          <div
            className={`rounded-full px-6 py-3 text-lg font-bold ${
              systemHealth.overall === 'healthy'
                ? 'bg-green-100 text-green-700'
                : systemHealth.overall === 'warning'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {systemHealth.overall.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-3xl font-bold text-gray-900">{systemHealth.totalUsers}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Monitored Subreddits</div>
          <div className="text-3xl font-bold text-gray-900">{systemHealth.totalSubreddits}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Total Scans</div>
          <div className="text-3xl font-bold text-gray-900">{systemHealth.totalScans}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Failed Scans (24h)</div>
          <div
            className={`text-3xl font-bold ${
              systemHealth.failedScansLast24h === 0
                ? 'text-green-600'
                : systemHealth.failedScansLast24h < 5
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }`}
          >
            {systemHealth.failedScansLast24h}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Total Credits</div>
          <div className="text-3xl font-bold text-purple-600">{systemHealth.totalCredits}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm text-gray-600">Due for Scan</div>
          <div className="text-3xl font-bold text-orange-600">{systemHealth.subredditsDueForScan}</div>
        </div>
      </div>

      {/* Recent Failed Scans */}
      {recentFailedScans.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Recent Failed Scans</h2>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Subreddit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentFailedScans.map(scan => (
                  <tr key={scan.id}>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      r/
                      {scan.subredditName}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600">
                      {scan.errorMessage || 'Unknown error'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subreddits Due for Scan */}
      {subredditsDueForScan.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-orange-600">Subreddits Due for Scan</h2>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Subreddit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Last Scan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Next Scan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {subredditsDueForScan.map(sub => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      <Link href={`/dashboard/pulse/${sub.id}`} className="text-purple-600 hover:text-purple-800">
                        r/
                        {sub.subredditName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {sub.scanFrequency}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {sub.lastScanAt ? new Date(sub.lastScanAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {sub.nextScanAt ? new Date(sub.nextScanAt).toLocaleString() : 'ASAP'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Scans */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Recent Scans</h2>
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Subreddit
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentScans.map(scan => (
                <tr key={scan.id}>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {new Date(scan.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                    r/
                    {scan.subredditName}
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
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {scan.postsScanned || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-bold">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/api/cron/scans"
            className="rounded-lg bg-purple-600 p-4 text-center text-white hover:bg-purple-700"
          >
            Trigger Cron Scans
          </Link>
          <Link
            href="/dashboard/pulse"
            className="rounded-lg bg-gray-700 p-4 text-center text-white hover:bg-gray-800"
          >
            View User Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 p-4 text-center text-white hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
