import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';

import { auth } from '@/auth';
import { db } from '@/libs/DB';
import { alertHistory, alerts, monitoredSubreddits } from '@/models/Schema';

/**
 * GET /api/alerts?subredditId=xxx
 * Get alert history for a specific subreddit
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subredditId = searchParams.get('subredditId');

    if (!subredditId) {
      // Get all alerts for user's subreddits
      const userSubreddits = await db.select()
        .from(monitoredSubreddits)
        .where(eq(monitoredSubreddits.userId, session.user.id));

      const subredditIds = userSubreddits.map(s => s.id);

      const allAlertHistory = await db.select()
        .from(alertHistory)
        .orderBy(desc(alertHistory.createdAt))
        .limit(50);

      // Filter for user's subreddits
      const userAlerts = await Promise.all(
        allAlertHistory.map(async (alert) => {
          const [alertConfig] = await db.select()
            .from(alerts)
            .where(eq(alerts.id, alert.alertId))
            .limit(1);

          if (alertConfig && subredditIds.includes(alertConfig.subredditId)) {
            return {
              ...alert,
              alertType: alertConfig.alertType,
              subredditId: alertConfig.subredditId,
            };
          }
          return null;
        }),
      );

      return NextResponse.json({
        alerts: userAlerts.filter(a => a !== null),
      });
    }

    // Verify subreddit belongs to user
    const [subreddit] = await db.select()
      .from(monitoredSubreddits)
      .where(
        and(
          eq(monitoredSubreddits.id, subredditId),
          eq(monitoredSubreddits.userId, session.user.id),
        ),
      )
      .limit(1);

    if (!subreddit) {
      return NextResponse.json(
        { error: 'Subreddit not found or unauthorized' },
        { status: 404 },
      );
    }

    // Get alerts for this subreddit
    const subredditAlerts = await db.select()
      .from(alerts)
      .where(eq(alerts.subredditId, subredditId));

    const alertIds = subredditAlerts.map(a => a.id);

    // Get alert history
    const history = await db.select()
      .from(alertHistory)
      .orderBy(desc(alertHistory.createdAt))
      .limit(100);

    const relevantHistory = history.filter(h => alertIds.includes(h.alertId));

    // Combine with alert configs
    const alertsWithHistory = await Promise.all(
      relevantHistory.map(async (h) => {
        const [alertConfig] = await db.select()
          .from(alerts)
          .where(eq(alerts.id, h.alertId))
          .limit(1);

        return {
          ...h,
          alertType: alertConfig?.alertType,
          threshold: alertConfig?.threshold,
        };
      }),
    );

    return NextResponse.json({
      alerts: alertsWithHistory,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alerts' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/alerts/:id
 * Update alert configuration (enable/disable, change threshold)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { alertId, isActive, threshold } = body;

    if (!alertId) {
      return NextResponse.json(
        { error: 'alertId is required' },
        { status: 400 },
      );
    }

    // Get alert and verify ownership
    const [alert] = await db.select()
      .from(alerts)
      .where(eq(alerts.id, alertId))
      .limit(1);

    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 },
      );
    }

    // Verify subreddit belongs to user
    const [subreddit] = await db.select()
      .from(monitoredSubreddits)
      .where(eq(monitoredSubreddits.id, alert.subredditId))
      .limit(1);

    if (!subreddit || subreddit.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 },
      );
    }

    // Update alert
    const updateData: any = {};
    if (typeof isActive !== 'undefined') {
      updateData.isActive = isActive;
    }
    if (typeof threshold !== 'undefined') {
      updateData.threshold = threshold;
    }

    const [updatedAlert] = await db.update(alerts)
      .set(updateData)
      .where(eq(alerts.id, alertId))
      .returning();

    return NextResponse.json({
      alert: updatedAlert,
      message: 'Alert updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update alert' },
      { status: 500 },
    );
  }
}
