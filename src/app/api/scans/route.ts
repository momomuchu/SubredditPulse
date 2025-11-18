import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';

import { auth } from '@/auth';
import { db } from '@/libs/DB';
import { ScanService } from '@/libs/ScanService';
import { monitoredSubreddits, scanResults, scans } from '@/models/Schema';

/**
 * GET /api/scans?subredditId=xxx
 * Get scans for a specific subreddit
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
      return NextResponse.json(
        { error: 'subredditId parameter is required' },
        { status: 400 },
      );
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

    // Get scans for this subreddit
    const scanList = await db.select()
      .from(scans)
      .where(eq(scans.subredditId, subredditId))
      .orderBy(desc(scans.createdAt))
      .limit(50);

    return NextResponse.json({ scans: scanList });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch scans' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/scans
 * Trigger a new scan
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subredditId, scanType = 'manual' } = body;

    if (!subredditId) {
      return NextResponse.json(
        { error: 'subredditId is required' },
        { status: 400 },
      );
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

    // Execute scan
    const result = await ScanService.executeScan(subredditId, scanType);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Get the completed scan with results
    const [scan] = await db.select()
      .from(scans)
      .where(eq(scans.id, result.scanId))
      .limit(1);

    const [results] = await db.select()
      .from(scanResults)
      .where(eq(scanResults.scanId, result.scanId))
      .limit(1);

    return NextResponse.json(
      {
        scan,
        results,
        message: 'Scan completed successfully',
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to execute scan' },
      { status: 500 },
    );
  }
}
