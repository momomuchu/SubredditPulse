'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Alert = {
  id: string;
  subredditName: string;
  displayName: string;
  alertType: string;
  triggered: boolean;
  createdAt: string;
  details: string | null;
};

type AlertConfig = {
  id: string;
  subredditId: string;
  subredditName: string;
  displayName: string;
  alertType: string;
  threshold: number | null;
  enabled: boolean;
};

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    fetchConfigs();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/subreddits');
      const data = await response.json();

      const allConfigs: AlertConfig[] = [];
      for (const sub of data.subreddits || []) {
        const configRes = await fetch(`/api/alerts?subredditId=${sub.id}&config=true`);
        const configData = await configRes.json();

        if (configData.configs) {
          allConfigs.push(
            ...configData.configs.map((c: any) => ({
              ...c,
              subredditName: sub.subredditName,
              displayName: sub.displayName,
            })),
          );
        }
      }

      setConfigs(allConfigs);
    } catch (err: any) {
      console.error('Failed to fetch configs:', err);
    }
  };

  const toggleAlert = async (configId: string, currentEnabled: boolean) => {
    setUpdating(configId);
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configId,
          enabled: !currentEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update alert');
      }

      await fetchConfigs();
    } catch (err: any) {
      alert(err.message || 'Failed to update alert');
    } finally {
      setUpdating(null);
    }
  };

  const updateThreshold = async (configId: string, newThreshold: number) => {
    setUpdating(configId);
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configId,
          threshold: newThreshold,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update threshold');
      }

      await fetchConfigs();
    } catch (err: any) {
      alert(err.message || 'Failed to update threshold');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/pulse')}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900"
        >
          � Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold">Alert Management</h1>
        <p className="mt-2 text-gray-600">
          View alert history and manage notification settings
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Alert Configurations */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Alert Settings</h2>
        {configs.length === 0
          ? (
              <div className="rounded-lg bg-white p-8 text-center shadow">
                <p className="text-gray-600">No alert configurations found.</p>
              </div>
            )
          : (
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Subreddit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Alert Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Threshold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {configs.map(config => (
                      <tr key={config.id}>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                          r/
                          {config.displayName}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          <span className="capitalize">
                            {config.alertType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {config.threshold !== null
                            ? (
                                <input
                                  type="number"
                                  value={config.threshold}
                                  onChange={(e) => {
                                    const val = Number.parseFloat(e.target.value);
                                    if (!isNaN(val)) {
                                      updateThreshold(config.id, val);
                                    }
                                  }}
                                  disabled={updating === config.id}
                                  className="w-20 rounded border border-gray-300 px-2 py-1"
                                  step="0.1"
                                />
                              )
                            : (
                                'N/A'
                              )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              config.enabled
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {config.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <button
                            onClick={() => toggleAlert(config.id, config.enabled)}
                            disabled={updating === config.id}
                            className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                          >
                            {updating === config.id
                              ? 'Updating...'
                              : config.enabled
                                ? 'Disable'
                                : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>

      {/* Alert History */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Alert History</h2>
        {alerts.length === 0
          ? (
              <div className="rounded-lg bg-white p-8 text-center shadow">
                <p className="text-gray-600">No alerts have been triggered yet.</p>
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
                        Subreddit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Alert Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {alerts.map(alert => (
                      <tr key={alert.id}>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          <div>
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(alert.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                          r/
                          {alert.displayName}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          <span className="capitalize">
                            {alert.alertType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              alert.triggered
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {alert.triggered ? 'Triggered' : 'Not Triggered'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {alert.details || 'No details'}
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
