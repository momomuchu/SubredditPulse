import Sentiment from 'sentiment';

/**
 * Sentiment Analysis Service
 *
 * Analyzes text sentiment using the Sentiment.js library
 * Returns sentiment scores ranging from -1 (very negative) to 1 (very positive)
 */
class SentimentAnalysisService {
  private analyzer: Sentiment;

  constructor() {
    this.analyzer = new Sentiment();
  }

  /**
   * Analyze sentiment of a single text
   * @param text - Text to analyze
   * @returns Normalized sentiment score between -1 and 1
   */
  analyzeSentiment(text: string): number {
    if (!text || text.trim().length === 0) {
      return 0;
    }

    const result = this.analyzer.analyze(text);

    // Normalize the score to -1 to 1 range
    // The sentiment library returns a score typically between -10 and 10
    // We'll use a sigmoid-like normalization
    const normalizedScore = this.normalizeScore(result.score);

    return normalizedScore;
  }

  /**
   * Analyze sentiment with detailed information
   * @param text - Text to analyze
   */
  analyzeDetailed(text: string) {
    if (!text || text.trim().length === 0) {
      return {
        score: 0,
        normalizedScore: 0,
        comparative: 0,
        tokens: [],
        positive: [],
        negative: [],
      };
    }

    const result = this.analyzer.analyze(text);

    return {
      score: result.score,
      normalizedScore: this.normalizeScore(result.score),
      comparative: result.comparative,
      tokens: result.tokens,
      positive: result.positive,
      negative: result.negative,
    };
  }

  /**
   * Analyze sentiment of multiple texts and return average
   * @param texts - Array of texts to analyze
   */
  analyzeBulk(texts: string[]): {
    averageSentiment: number;
    distribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    scores: number[];
  } {
    const scores = texts.map(text => this.analyzeSentiment(text));

    // Calculate average
    const averageSentiment
      = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    // Calculate distribution
    const distribution = {
      positive: scores.filter(score => score > 0.1).length,
      neutral: scores.filter(score => score >= -0.1 && score <= 0.1).length,
      negative: scores.filter(score => score < -0.1).length,
    };

    return {
      averageSentiment,
      distribution,
      scores,
    };
  }

  /**
   * Analyze posts for sentiment
   * @param posts - Array of Reddit posts
   */
  analyzePosts(posts: Array<{ title: string; selftext: string }>) {
    const texts = posts.map(post => `${post.title} ${post.selftext}`);
    return this.analyzeBulk(texts);
  }

  /**
   * Determine sentiment trend by comparing current to baseline
   * @param currentSentiment - Current average sentiment
   * @param baselineSentiment - Baseline sentiment to compare against
   */
  determineTrend(
    currentSentiment: number,
    baselineSentiment: number,
  ): 'improving' | 'declining' | 'stable' {
    const difference = currentSentiment - baselineSentiment;
    const threshold = 0.05; // 5% threshold

    if (difference > threshold) {
      return 'improving';
    }
    if (difference < -threshold) {
      return 'declining';
    }
    return 'stable';
  }

  /**
   * Check if sentiment has dropped significantly (for alerts)
   * @param currentSentiment - Current sentiment score
   * @param baselineSentiment - Baseline sentiment score
   * @param threshold - Threshold percentage (e.g., 0.2 for 20%)
   */
  hasSentimentDropped(
    currentSentiment: number,
    baselineSentiment: number,
    threshold: number = 0.2,
  ): boolean {
    const drop = baselineSentiment - currentSentiment;
    const percentDrop = Math.abs(drop) / Math.max(Math.abs(baselineSentiment), 0.1);

    return drop > 0 && percentDrop >= threshold;
  }

  /**
   * Extract keywords from text with sentiment context
   * @param posts - Array of posts
   * @param keywords - Keywords to track
   */
  analyzeKeywords(
    posts: Array<{ title: string; selftext: string }>,
    keywords: string[],
  ): Record<string, { mentions: number; averageSentiment: number }> {
    const keywordStats: Record<string, { sentiments: number[]; mentions: number }> = {};

    // Initialize tracking for each keyword
    keywords.forEach((keyword) => {
      keywordStats[keyword] = { sentiments: [], mentions: 0 };
    });

    // Analyze each post
    posts.forEach((post) => {
      const text = `${post.title} ${post.selftext}`.toLowerCase();

      keywords.forEach((keyword) => {
        const keywordLower = keyword.toLowerCase();
        if (text.includes(keywordLower)) {
          const stats = keywordStats[keyword];
          if (stats) {
            stats.mentions += 1;

            // Get sentiment of the post
            const sentiment = this.analyzeSentiment(text);
            stats.sentiments.push(sentiment);
          }
        }
      });
    });

    // Calculate average sentiment for each keyword
    const result: Record<string, { mentions: number; averageSentiment: number }> = {};

    Object.keys(keywordStats).forEach((keyword) => {
      const stats = keywordStats[keyword];
      if (!stats) {
        return;
      }

      const averageSentiment
        = stats.sentiments.length > 0
          ? stats.sentiments.reduce((sum, s) => sum + s, 0) / stats.sentiments.length
          : 0;

      result[keyword] = {
        mentions: stats.mentions,
        averageSentiment,
      };
    });

    return result;
  }

  /**
   * Extract top positive and negative posts
   * @param posts - Array of posts with sentiment
   */
  extractTopPosts(posts: Array<{ title: string; selftext: string; [key: string]: any }>) {
    const postsWithSentiment = posts.map(post => ({
      ...post,
      sentiment: this.analyzeSentiment(`${post.title} ${post.selftext}`),
    }));

    // Sort by sentiment
    const sortedBySentiment = [...postsWithSentiment].sort((a, b) => b.sentiment - a.sentiment);

    return {
      topPositive: sortedBySentiment.slice(0, 5),
      topNegative: sortedBySentiment.slice(-5).reverse(),
    };
  }

  /**
   * Normalize sentiment score to -1 to 1 range
   * Uses a sigmoid-like function for normalization
   */
  private normalizeScore(score: number): number {
    // Use tanh function for smooth normalization
    // tanh(x/5) gives good spread for typical sentiment scores
    return Math.tanh(score / 5);
  }
}

export const SentimentAnalysis = new SentimentAnalysisService();
