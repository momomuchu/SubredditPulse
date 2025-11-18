import { NextRequest, NextResponse } from 'next/server';
import { and, eq, lte } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { ScanService } from '@/libs/ScanService';
import { monitoredSubreddits } from '@/models/Schema';

/**
 * POST /api/cron/scans
 * Automated cron job to run scheduled scans
 *
 * This endpoint should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
 * to trigger automatic scans for all subreddits that are due for scanning
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = Env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Get all active subreddits that are due for scanning
    const now = new Date();
    const subredditsDueForScan = await db.select()
      .from(monitoredSubreddits)
      .where(
        and(
          eq(monitoredSubreddits.isActive, true),
          lte(monitoredSubreddits.nextScanAt, now),
        ),
      );

    console.log(`Found ${subredditsDueForScan.length} subreddits due for scanning`);

    const results = {
      total: subredditsDueForScan.length,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ subredditId: string; error: string }>,
    };

    // Execute scans sequentially to avoid rate limiting
    for (const subreddit of subredditsDueForScan) {
      try {
        console.log(`Scanning r/${subreddit.subredditName}...`);

        const result = await ScanService.executeScan(subreddit.id, 'auto');

        if (result.success) {
          results.successful += 1;
          console.log(`✓ Scan completed for r/${subreddit.subredditName}`);
        } else {
          results.failed += 1;
          results.errors.push({
            subredditId: subreddit.id,
            error: result.error || 'Unknown error',
          });
          console.error(`✗ Scan failed for r/${subreddit.subredditName}:`, result.error);
        }
      } catch (error: any) {
        results.failed += 1;
        results.errors.push({
          subredditId: subreddit.id,
          error: error.message,
        });
        console.error(`✗ Exception scanning r/${subreddit.subredditName}:`, error);
      }

      // Add a small delay between scans to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      message: 'Scheduled scans completed',
      results,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run scheduled scans' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/cron/scans
 * Get status of cron job (for testing)
 */
export async function GET() {
  try {
    const now = new Date();
    const subredditsDueForScan = await db.select()
      .from(monitoredSubreddits)
      .where(
        and(
          eq(monitoredSubreddits.isActive, true),
          lte(monitoredSubreddits.nextScanAt, now),
        ),
      );

    return NextResponse.json({
      message: 'Cron job endpoint ready',
      subredditsDueForScan: subredditsDueForScan.length,
      subreddits: subredditsDueForScan.map(s => ({
        id: s.id,
        name: s.subredditName,
        nextScanAt: s.nextScanAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }
}
