import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';

import { auth } from '@/auth';
import { db } from '@/libs/DB';
import { Reddit } from '@/libs/Reddit';
import { alerts, monitoredSubreddits, subredditKeywords, userCredits } from '@/models/Schema';

/**
 * GET /api/subreddits
 * Get all monitored subreddits for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subreddits = await db.select()
      .from(monitoredSubreddits)
      .where(eq(monitoredSubreddits.userId, session.user.id))
      .orderBy(desc(monitoredSubreddits.createdAt));

    // Get keywords for each subreddit
    const subredditsWithKeywords = await Promise.all(
      subreddits.map(async (subreddit) => {
        const keywords = await db.select()
          .from(subredditKeywords)
          .where(eq(subredditKeywords.subredditId, subreddit!.id));

        return {
          ...subreddit,
          keywords: keywords.map(k => k.keyword),
        };
      }),
    );

    return NextResponse.json({ subreddits: subredditsWithKeywords });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subreddits' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/subreddits
 * Create a new monitored subreddit
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subredditName, keywords, scanFrequency, postLimit, sentimentThreshold } = body;

    // Validate inputs
    if (!subredditName || !keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Subreddit name and at least one keyword are required' },
        { status: 400 },
      );
    }

    if (keywords.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 keywords allowed per subreddit' },
        { status: 400 },
      );
    }

    // Check if subreddit exists and is accessible
    try {
      await Reddit.getSubredditInfo(subredditName);
    } catch (error: any) {
      return NextResponse.json(
        { error: `Subreddit r/${subredditName} not found or inaccessible` },
        { status: 404 },
      );
    }

    // Check if user already has 3 subreddits
    const existingCount = await db.select()
      .from(monitoredSubreddits)
      .where(eq(monitoredSubreddits.userId, session.user.id));

    if (existingCount.length >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 subreddits allowed per user in MVP' },
        { status: 400 },
      );
    }

    // Create monitored subreddit
    const [subreddit] = await db.insert(monitoredSubreddits)
      .values({
        userId: session.user.id,
        subredditName: subredditName.toLowerCase(),
        displayName: subredditName,
        scanFrequency: scanFrequency || 'daily',
        postLimit: postLimit || 100,
        setupFee: 800, // $8 in cents
        nextScanAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      })
      .returning();

    // Add keywords
    const keywordRecords = keywords.map((keyword: string) => ({
      subredditId: subreddit!.id,
      keyword: keyword.trim(),
    }));

    await db.insert(subredditKeywords).values(keywordRecords);

    // Create default alerts
    const defaultAlerts = [
      {
        subredditId: subreddit!.id,
        alertType: 'sentiment_drop',
        threshold: sentimentThreshold || 0.2,
      },
      {
        subredditId: subreddit!.id,
        alertType: 'keyword_spike',
        threshold: 3.0,
      },
    ];

    await db.insert(alerts).values(defaultAlerts);

    // Initialize user credits if not exists
    const [existingCredits] = await db.select()
      .from(userCredits)
      .where(eq(userCredits.userId, session.user.id))
      .limit(1);

    if (!existingCredits) {
      await db.insert(userCredits).values({
        userId: session.user.id,
        credits: 0,
      });
    }

    return NextResponse.json(
      {
        subreddit: {
          ...subreddit,
          keywords: keywords.map((k: string) => k.trim()),
        },
        message: 'Subreddit added successfully. Please complete payment to activate monitoring.',
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create subreddit' },
      { status: 500 },
    );
  }
}
