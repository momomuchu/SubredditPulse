import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';

import { auth } from '@/auth';
import { db } from '@/libs/DB';
import { monitoredSubreddits, scanResults, scans } from '@/models/Schema';

/**
 * GET /api/export/csv?subredditId=xxx
 * Export scan data as CSV
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

    // Get scans with results
    const scanList = await db.select()
      .from(scans)
      .where(eq(scans.subredditId, subredditId))
      .orderBy(desc(scans.createdAt))
      .limit(100);

    // Build CSV content
    const headers = [
      'Date',
      'Time',
      'Scan Type',
      'Status',
      'Posts Scanned',
      'Overall Sentiment',
      'Sentiment Trend',
      'Credits Cost',
    ];

    const rows = scanList.map(scan => [
      new Date(scan.createdAt).toLocaleDateString(),
      new Date(scan.createdAt).toLocaleTimeString(),
      scan.scanType,
      scan.status,
      scan.postsScanned || 0,
      scan.overallSentiment?.toFixed(4) || 'N/A',
      scan.sentimentTrend || 'N/A',
      scan.creditsCost,
    ]);

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell =>
          // Escape cells containing commas or quotes
          typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
            ? `"${cell.replace(/"/g, '""')}"`
            : cell,
        ).join(','),
      ),
    ].join('\n');

    // Return as downloadable CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subreddit-pulse-${subreddit.subredditName}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to export CSV' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/export/csv/detailed?subredditId=xxx
 * Export detailed scan results including keyword mentions and top posts
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subredditId } = body;

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

    // Get scans with detailed results
    const scanList = await db.select()
      .from(scans)
      .where(eq(scans.subredditId, subredditId))
      .orderBy(desc(scans.createdAt))
      .limit(50);

    const detailedData = await Promise.all(
      scanList.map(async (scan) => {
        const [results] = await db.select()
          .from(scanResults)
          .where(eq(scanResults.scanId, scan.id))
          .limit(1);

        return {
          scan,
          results,
        };
      }),
    );

    // Build detailed CSV with keyword mentions
    const headers = [
      'Date',
      'Time',
      'Sentiment',
      'Trend',
      'Posts',
      'Keyword Mentions (JSON)',
      'Positive Posts',
      'Negative Posts',
      'Neutral Posts',
    ];

    const rows = detailedData.map(({ scan, results }) => [
      new Date(scan.createdAt).toLocaleDateString(),
      new Date(scan.createdAt).toLocaleTimeString(),
      scan.overallSentiment?.toFixed(4) || 'N/A',
      scan.sentimentTrend || 'N/A',
      scan.postsScanned || 0,
      results?.keywordMentions ? JSON.stringify(results.keywordMentions) : '{}',
      results?.sentimentDistribution?.positive || 0,
      results?.sentimentDistribution?.negative || 0,
      results?.sentimentDistribution?.neutral || 0,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell =>
          typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
            ? `"${cell.replace(/"/g, '""')}"`
            : cell,
        ).join(','),
      ),
    ].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="subreddit-pulse-detailed-${subreddit.subredditName}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to export detailed CSV' },
      { status: 500 },
    );
  }
}
