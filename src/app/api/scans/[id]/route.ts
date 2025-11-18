import type { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/libs/DB';
import { monitoredSubreddits, scanResults, scans } from '@/models/Schema';

/**
 * GET /api/scans/[id]
 * Get detailed results for a specific scan including top posts and trending topics
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scanId = params.id;

    // Get the scan
    const [scan] = await db.select()
      .from(scans)
      .where(eq(scans.id, scanId))
      .limit(1);

    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 },
      );
    }

    // Verify subreddit belongs to user
    const [subreddit] = await db.select()
      .from(monitoredSubreddits)
      .where(
        and(
          eq(monitoredSubreddits.id, scan.subredditId),
          eq(monitoredSubreddits.userId, session.user.id),
        ),
      )
      .limit(1);

    if (!subreddit) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 },
      );
    }

    // Get scan results
    const [results] = await db.select()
      .from(scanResults)
      .where(eq(scanResults.scanId, scanId))
      .limit(1);

    if (!results) {
      return NextResponse.json(
        { error: 'Scan results not found' },
        { status: 404 },
      );
    }

    // Parse the topPosts and emergingTopics from JSONB
    const topPosts = results.topPosts as any[] || [];
    const emergingTopics = results.emergingTopics as any[] || [];
    const keywordMentions = results.keywordMentions as any || {};
    const sentimentDist = results.sentimentDistribution as any || { positive: 0, neutral: 0, negative: 0 };

    // Format the response
    return NextResponse.json({
      scan,
      results: {
        id: results.id,
        overallSentiment: scan.overallSentiment || 0,
        positiveCount: sentimentDist.positive || 0,
        neutralCount: sentimentDist.neutral || 0,
        negativeCount: sentimentDist.negative || 0,
        trendDirection: scan.sentimentTrend,
        comparedToBaseline: null, // TODO: Calculate from baseline table if needed
        topPosts: topPosts.map((post: any) => ({
          id: post.id,
          title: post.title,
          url: post.url,
          sentiment: post.sentiment,
          score: post.score,
        })),
        trendingTopics: emergingTopics.map((topic: any) => ({
          keyword: topic.topic || topic.keyword,
          mentions: topic.mentions,
          sentiment: topic.sentiment || 0,
        })),
        keywordMentions,
      },
      subreddit: {
        id: subreddit.id,
        subredditName: subreddit.subredditName,
        displayName: subreddit.displayName,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch scan details' },
      { status: 500 },
    );
  }
}
