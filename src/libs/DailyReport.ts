import type { DiscordEmbed, DiscordEmbedField } from './Discord';
import { and, count, gte, sql } from 'drizzle-orm';
import { payments, sessions, users } from '@/models/Schema';
import { db } from './DB';
import { DiscordColors, sendDiscordEmbed } from './Discord';
import { Env } from './Env';
import { logger } from './Logger';

export type DailyReportData = {
  date: string;
  health: {
    status: string;
    timestamp: string;
    version: string;
    uptime: number;
    services: Record<string, unknown>;
  };
  users: {
    total: number;
    newToday: number;
    newThisWeek: number;
  };
  payments: {
    total: number;
    todayCount: number;
    todayRevenue: number;
    weekCount: number;
    weekRevenue: number;
    currency: string;
  };
  sessions: {
    active: number;
  };
};

/**
 * Gathers all application metrics for the daily report
 * @returns Promise that resolves to the daily report data
 */
export async function gatherDailyReportData(): Promise<DailyReportData> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Get health status
  const healthResponse = await fetch(`${Env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health`);
  const health = await healthResponse.json();

  // Get user statistics
  const [totalUsersResult] = await db.select({ count: count() }).from(users);
  const [newUsersTodayResult] = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.emailVerified, today));
  const [newUsersWeekResult] = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.emailVerified, weekAgo));

  // Get payment statistics
  const [totalPaymentsResult] = await db.select({ count: count() }).from(payments);
  const [todayPaymentsResult] = await db
    .select({
      count: count(),
      revenue: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(
      and(
        gte(payments.createdAt, today),
        sql`${payments.status} = 'completed'`,
      ),
    );

  const [weekPaymentsResult] = await db
    .select({
      count: count(),
      revenue: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(
      and(
        gte(payments.createdAt, weekAgo),
        sql`${payments.status} = 'completed'`,
      ),
    );

  // Get active sessions (not expired)
  const [activeSessionsResult] = await db
    .select({ count: count() })
    .from(sessions)
    .where(gte(sessions.expires, now));

  // Get most common currency from payments
  const [currencyResult] = await db
    .select({ currency: payments.currency })
    .from(payments)
    .limit(1);

  return {
    date: now.toISOString(),
    health,
    users: {
      total: totalUsersResult?.count ?? 0,
      newToday: newUsersTodayResult?.count ?? 0,
      newThisWeek: newUsersWeekResult?.count ?? 0,
    },
    payments: {
      total: totalPaymentsResult?.count ?? 0,
      todayCount: todayPaymentsResult?.count ?? 0,
      todayRevenue: Number(todayPaymentsResult?.revenue ?? 0),
      weekCount: weekPaymentsResult?.count ?? 0,
      weekRevenue: Number(weekPaymentsResult?.revenue ?? 0),
      currency: currencyResult?.currency ?? 'USD',
    },
    sessions: {
      active: activeSessionsResult?.count ?? 0,
    },
  };
}

/**
 * Creates a Discord embed from daily report data
 * @param reportData Daily report data
 * @returns Discord embed object
 */
export function createDailyReportEmbed(reportData: DailyReportData): DiscordEmbed {
  const { users: userStats, payments: paymentStats, sessions: sessionStats } = reportData;

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    // Stripe amounts are in cents
    const dollars = amount / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(dollars);
  };

  const fields: DiscordEmbedField[] = [
    {
      name: '👥 Total Users',
      value: userStats.total.toLocaleString(),
      inline: true,
    },
    {
      name: '🆕 New Today',
      value: userStats.newToday.toLocaleString(),
      inline: true,
    },
    {
      name: '📅 New This Week',
      value: userStats.newThisWeek.toLocaleString(),
      inline: true,
    },
    {
      name: '💳 Total Payments',
      value: paymentStats.total.toLocaleString(),
      inline: true,
    },
    {
      name: '💰 Today\'s Revenue',
      value: `${formatCurrency(paymentStats.todayRevenue, paymentStats.currency)} (${paymentStats.todayCount})`,
      inline: true,
    },
    {
      name: '📊 Week\'s Revenue',
      value: `${formatCurrency(paymentStats.weekRevenue, paymentStats.currency)} (${paymentStats.weekCount})`,
      inline: true,
    },
    {
      name: '🔐 Active Sessions',
      value: sessionStats.active.toLocaleString(),
      inline: true,
    },
    {
      name: '🏥 Health Status',
      value: reportData.health.status === 'healthy' ? '✅ Healthy' : '⚠️ Issues Detected',
      inline: true,
    },
    {
      name: '⏱️ Uptime',
      value: formatUptime(reportData.health.uptime),
      inline: true,
    },
  ];

  return {
    title: '📈 Daily Application Report',
    description: `Application statistics for ${new Date(reportData.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    color: reportData.health.status === 'healthy' ? DiscordColors.SUCCESS : DiscordColors.WARNING,
    fields,
    timestamp: reportData.date,
    footer: {
      text: `Next.js Boilerplate v${reportData.health.version}`,
    },
  };
}

/**
 * Sends the daily report to Discord
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function sendDailyReport(): Promise<boolean> {
  try {
    logger.info('Gathering daily report data');
    const reportData = await gatherDailyReportData();

    logger.info('Creating daily report embed');
    const embed = createDailyReportEmbed(reportData);

    logger.info('Sending daily report to Discord');
    const success = await sendDiscordEmbed(embed);

    if (success) {
      logger.info('Daily report sent successfully');
    } else {
      logger.error('Failed to send daily report');
    }

    return success;
  } catch (error) {
    logger.error('Error generating daily report', { error });
    return false;
  }
}

/**
 * Formats uptime in seconds to a human-readable string
 * @param seconds Uptime in seconds
 * @returns Formatted uptime string
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  return parts.join(' ') || '< 1m';
}
