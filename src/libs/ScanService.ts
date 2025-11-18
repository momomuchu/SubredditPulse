import { and, desc, eq } from 'drizzle-orm';

import { DB } from './DB';
import { Reddit } from './Reddit';
import { SentimentAnalysis } from './SentimentAnalysis';
import { alerts, alertHistory, monitoredSubreddits, scanResults, scans, sentimentBaselines, subredditKeywords, userCredits } from '@/models/Schema';

/**
 * Scan Service
 *
 * Orchestrates the entire scanning process:
 * 1. Fetch posts from Reddit
 * 2. Analyze sentiment
 * 3. Track keywords
 * 4. Detect trends and alerts
 * 5. Save results to database
 */
class ScanServiceClass {
  /**
   * Execute a scan for a subreddit
   * @param subredditId - ID of the monitored subreddit
   * @param scanType - Type of scan (auto, manual, deep)
   */
  async executeScan(
    subredditId: string,
    scanType: 'auto' | 'manual' | 'deep' = 'auto',
  ): Promise<{ success: boolean; scanId: string; error?: string }> {
    try {
      // Get subreddit info
      const subreddit = await DB.select()
        .from(monitoredSubreddits)
        .where(eq(monitoredSubreddits.id, subredditId))
        .limit(1);

      if (subreddit.length === 0) {
        return { success: false, scanId: '', error: 'Subreddit not found' };
      }

      const subredditData = subreddit[0];

      // Check if user has enough credits
      if (scanType === 'manual' || scanType === 'deep') {
        const creditsCost = scanType === 'manual' ? 1 : 2;
        const hasCredits = await this.checkAndDeductCredits(subredditData.userId, creditsCost);

        if (!hasCredits) {
          return { success: false, scanId: '', error: 'Insufficient credits' };
        }
      }

      // Create scan record
      const [scan] = await DB.insert(scans)
        .values({
          subredditId,
          scanType,
          status: 'running',
          creditsCost: scanType === 'auto' ? 0 : scanType === 'manual' ? 1 : 2,
          startedAt: new Date(),
        })
        .returning();

      try {
        // Determine post limit based on scan type
        const postLimit = scanType === 'deep' ? 500 : subredditData.postLimit;

        // Fetch posts from Reddit
        const posts = await Reddit.fetchTopPosts(
          subredditData.subredditName,
          postLimit,
          'week',
        );

        // Get keywords for this subreddit
        const keywords = await DB.select()
          .from(subredditKeywords)
          .where(
            and(
              eq(subredditKeywords.subredditId, subredditId),
              eq(subredditKeywords.isActive, true),
            ),
          );

        const keywordList = keywords.map(k => k.keyword);

        // Analyze sentiment
        const sentimentResult = SentimentAnalysis.analyzePosts(posts);

        // Analyze keywords
        const keywordStats = SentimentAnalysis.analyzeKeywords(posts, keywordList);

        // Extract top posts
        const { topPositive, topNegative } = SentimentAnalysis.extractTopPosts(posts);

        // Detect emerging topics (simplified - extract most common words)
        const emergingTopics = this.extractEmergingTopics(posts);

        // Get sentiment baseline for comparison
        const baseline = await this.getSentimentBaseline(subredditId, '7_day');

        // Determine sentiment trend
        const sentimentTrend = baseline
          ? SentimentAnalysis.determineTrend(
            sentimentResult.averageSentiment,
            baseline.averageSentiment,
          )
          : 'stable';

        // Update scan record
        await DB.update(scans)
          .set({
            status: 'completed',
            postsScanned: posts.length,
            overallSentiment: sentimentResult.averageSentiment,
            sentimentTrend,
            completedAt: new Date(),
          })
          .where(eq(scans.id, scan.id));

        // Save scan results
        const topPostsData = [...topPositive.slice(0, 5), ...topNegative.slice(0, 5)].map(
          post => ({
            id: post.id,
            title: post.title,
            score: post.score,
            sentiment: post.sentiment,
            url: post.url,
          }),
        );

        await DB.insert(scanResults).values({
          scanId: scan.id,
          keywordMentions: this.convertKeywordStatsToMentions(keywordStats),
          topPosts: topPostsData,
          emergingTopics,
          sentimentDistribution: {
            positive: sentimentResult.distribution.positive,
            neutral: sentimentResult.distribution.neutral,
            negative: sentimentResult.distribution.negative,
          },
          wordCloud: this.generateWordCloud(posts),
        });

        // Update subreddit's last scan time
        await DB.update(monitoredSubreddits)
          .set({
            lastScanAt: new Date(),
            nextScanAt: this.calculateNextScanTime(subredditData.scanFrequency),
          })
          .where(eq(monitoredSubreddits.id, subredditId));

        // Update sentiment baseline
        await this.updateSentimentBaseline(subredditId, sentimentResult.averageSentiment);

        // Check for alerts
        await this.checkAndTriggerAlerts(
          subredditId,
          scan.id,
          sentimentResult.averageSentiment,
          baseline?.averageSentiment || 0,
          keywordStats,
        );

        return { success: true, scanId: scan.id };
      } catch (error: any) {
        // Update scan record with error
        await DB.update(scans)
          .set({
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date(),
          })
          .where(eq(scans.id, scan.id));

        return { success: false, scanId: scan.id, error: error.message };
      }
    } catch (error: any) {
      return { success: false, scanId: '', error: error.message };
    }
  }

  /**
   * Check if user has enough credits and deduct them
   */
  private async checkAndDeductCredits(userId: string, amount: number): Promise<boolean> {
    const [userCredit] = await DB.select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (!userCredit || userCredit.credits < amount) {
      return false;
    }

    await DB.update(userCredits)
      .set({
        credits: userCredit.credits - amount,
      })
      .where(eq(userCredits.id, userCredit.id));

    return true;
  }

  /**
   * Get sentiment baseline for a subreddit
   */
  private async getSentimentBaseline(
    subredditId: string,
    period: '7_day' | '30_day' = '7_day',
  ) {
    const [baseline] = await DB.select()
      .from(sentimentBaselines)
      .where(
        and(
          eq(sentimentBaselines.subredditId, subredditId),
          eq(sentimentBaselines.period, period),
        ),
      )
      .orderBy(desc(sentimentBaselines.calculatedAt))
      .limit(1);

    return baseline || null;
  }

  /**
   * Update sentiment baseline
   */
  private async updateSentimentBaseline(subredditId: string, sentiment: number) {
    // Calculate 7-day baseline
    await DB.insert(sentimentBaselines).values({
      subredditId,
      period: '7_day',
      averageSentiment: sentiment,
    });
  }

  /**
   * Calculate next scan time based on frequency
   */
  private calculateNextScanTime(frequency: string): Date {
    const now = new Date();

    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'every_3_days':
        now.setDate(now.getDate() + 3);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      default:
        now.setDate(now.getDate() + 1);
    }

    return now;
  }

  /**
   * Convert keyword stats to mentions object
   */
  private convertKeywordStatsToMentions(
    keywordStats: Record<string, { mentions: number; averageSentiment: number }>,
  ): Record<string, number> {
    const mentions: Record<string, number> = {};
    Object.keys(keywordStats).forEach((keyword) => {
      mentions[keyword] = keywordStats[keyword].mentions;
    });
    return mentions;
  }

  /**
   * Extract emerging topics from posts
   */
  private extractEmergingTopics(
    posts: Array<{ title: string; selftext: string }>,
  ): Array<{ topic: string; mentions: number; trend: string }> {
    // Simplified version - extract most common bi-grams
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'is',
      'are',
      'was',
      'were',
      'been',
      'be',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'can',
      'may',
      'might',
      'this',
      'that',
      'these',
      'those',
    ]);

    posts.forEach((post) => {
      const text = `${post.title} ${post.selftext}`.toLowerCase();
      const words = text
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

      // Count bi-grams
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        wordFreq[bigram] = (wordFreq[bigram] || 0) + 1;
      }
    });

    // Get top 10 topics
    const topics = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, mentions]) => ({
        topic,
        mentions,
        trend: 'emerging',
      }));

    return topics;
  }

  /**
   * Generate word cloud data
   */
  private generateWordCloud(
    posts: Array<{ title: string; selftext: string }>,
  ): Array<{ word: string; frequency: number }> {
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'is',
      'are',
      'was',
      'were',
      'been',
      'be',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'can',
      'may',
      'might',
    ]);

    posts.forEach((post) => {
      const text = `${post.title} ${post.selftext}`.toLowerCase();
      const words = text
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

      words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)
      .map(([word, frequency]) => ({ word, frequency }));
  }

  /**
   * Check for alerts and trigger them
   */
  private async checkAndTriggerAlerts(
    subredditId: string,
    scanId: string,
    currentSentiment: number,
    baselineSentiment: number,
    keywordStats: Record<string, { mentions: number; averageSentiment: number }>,
  ) {
    // Get active alerts for this subreddit
    const activeAlerts = await DB.select()
      .from(alerts)
      .where(
        and(eq(alerts.subredditId, subredditId), eq(alerts.isActive, true)),
      );

    for (const alert of activeAlerts) {
      let shouldTrigger = false;
      let message = '';

      switch (alert.alertType) {
        case 'sentiment_drop':
          shouldTrigger = SentimentAnalysis.hasSentimentDropped(
            currentSentiment,
            baselineSentiment,
            alert.threshold,
          );
          if (shouldTrigger) {
            const dropPercent = (
              ((baselineSentiment - currentSentiment) / Math.abs(baselineSentiment))
              * 100
            ).toFixed(1);
            message = `Sentiment dropped by ${dropPercent}% (from ${baselineSentiment.toFixed(2)} to ${currentSentiment.toFixed(2)})`;
          }
          break;

        case 'keyword_spike':
          // Check if any keyword has spiked significantly
          Object.entries(keywordStats).forEach(([keyword, stats]) => {
            if (stats.mentions > 10) {
              // Simple threshold
              shouldTrigger = true;
              message = `Keyword "${keyword}" mentioned ${stats.mentions} times`;
            }
          });
          break;

        case 'negative_keyword':
          // Check if any keyword has negative sentiment
          Object.entries(keywordStats).forEach(([keyword, stats]) => {
            if (stats.averageSentiment < -0.3 && stats.mentions > 0) {
              shouldTrigger = true;
              message = `Negative sentiment detected for keyword "${keyword}" (${stats.averageSentiment.toFixed(2)})`;
            }
          });
          break;

        default:
          break;
      }

      if (shouldTrigger) {
        // Create alert history record
        await DB.insert(alertHistory).values({
          alertId: alert.id,
          scanId,
          message,
          data: { currentSentiment, baselineSentiment, keywordStats },
        });

        // TODO: Send notification (email, Discord, etc.)
      }
    }
  }
}

export const ScanService = new ScanServiceClass();
