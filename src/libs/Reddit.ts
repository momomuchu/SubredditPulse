import Snoowrap from 'snoowrap';

import { Env } from './Env';

/**
 * Reddit API Client
 *
 * Handles all Reddit API interactions using Snoowrap with retry logic
 */
class RedditClient {
  private client: Snoowrap | null = null;
  private apiCallCount = 0;
  private resetTime = Date.now() + 60000; // Reset every minute

  /**
   * Retry wrapper with exponential backoff
   * Handles transient failures from Reddit API
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    context: string = 'API call',
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check rate limit before making request
        await this.checkRateLimit();

        return await fn();
      }
      catch (error: any) {
        const isLastAttempt = attempt === maxRetries;

        // Don't retry on certain errors
        if (error.statusCode === 404 || error.statusCode === 403) {
          throw error;
        }

        if (isLastAttempt) {
          console.error(`${context} failed after ${maxRetries + 1} attempts:`, error);
          throw error;
        }

        // Calculate backoff delay: 2^attempt * 1000ms (1s, 2s, 4s)
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`${context} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`Retry logic failed for ${context}`);
  }

  /**
   * Check and enforce rate limiting
   * Reddit allows ~60 requests per minute
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset counter if time window has passed
    if (now >= this.resetTime) {
      this.apiCallCount = 0;
      this.resetTime = now + 60000; // Next minute
    }

    // If we've hit the limit, wait until reset
    if (this.apiCallCount >= 55) {
      // Use 55 instead of 60 for safety margin
      const waitTime = this.resetTime - now;
      if (waitTime > 0) {
        console.warn(`Rate limit approaching, waiting ${waitTime}ms before next request`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.apiCallCount = 0;
        this.resetTime = Date.now() + 60000;
      }
    }

    this.apiCallCount++;
  }

  private initClient(): Snoowrap {
    if (this.client) {
      return this.client;
    }

    this.client = new Snoowrap({
      userAgent: Env.REDDIT_USER_AGENT,
      clientId: Env.REDDIT_CLIENT_ID,
      clientSecret: Env.REDDIT_CLIENT_SECRET,
      username: Env.REDDIT_USERNAME,
      password: Env.REDDIT_PASSWORD,
    });

    // Configure request delay to avoid rate limiting
    this.client.config({ requestDelay: 1000 });

    return this.client;
  }

  /**
   * Fetch posts from a subreddit
   * @param subredditName - Name of the subreddit (without r/)
   * @param limit - Number of posts to fetch (default: 100, max: 1000)
   * @param timeframe - Time filter: hour, day, week, month, year, all
   */
  async fetchPosts(
    subredditName: string,
    limit: number = 100,
    timeframe: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'week',
  ) {
    const client = this.initClient();

    try {
      const subreddit = client.getSubreddit(subredditName);

      // Fetch hot posts (you can also use getNew(), getTop(), etc.)
      const posts = await subreddit.getHot({ limit, time: timeframe } as any);

      return posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        selftext: post.selftext || '',
        author: post.author.name,
        score: post.score,
        upvoteRatio: post.upvote_ratio,
        numComments: post.num_comments,
        created: new Date(post.created_utc * 1000),
        url: `https://reddit.com${post.permalink}`,
        flair: post.link_flair_text || null,
        isVideo: post.is_video,
        thumbnail: post.thumbnail,
      }));
    } catch (error: any) {
      console.error(`Error fetching posts from r/${subredditName}:`, error);
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
  }

  /**
   * Fetch top posts from a subreddit
   */
  async fetchTopPosts(
    subredditName: string,
    limit: number = 100,
    timeframe: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'week',
  ) {
    return this.retryWithBackoff(async () => {
      const client = this.initClient();
      const subreddit = client.getSubreddit(subredditName);
      const posts = await subreddit.getTop({ limit, time: timeframe } as any);

      return posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        selftext: post.selftext || '',
        author: post.author.name,
        score: post.score,
        upvoteRatio: post.upvote_ratio,
        numComments: post.num_comments,
        created: new Date(post.created_utc * 1000),
        url: `https://reddit.com${post.permalink}`,
        flair: post.link_flair_text || null,
      }));
    }, 3, `Fetching top posts from r/${subredditName}`);
  }

  /**
   * Fetch comments from a post (for deeper sentiment analysis)
   */
  async fetchComments(postId: string, limit: number = 50) {
    const client = this.initClient();

    try {
      const submission = client.getSubmission(postId);
      await (submission.expandReplies as any)({ limit, depth: 1 });

      const comments = (submission as any).comments || [];

      return comments.map((comment: any) => ({
        id: comment.id,
        body: comment.body || '',
        author: comment.author.name,
        score: comment.score,
        created: new Date(comment.created_utc * 1000),
      }));
    } catch (error: any) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }
  }

  /**
   * Search for posts containing specific keywords
   */
  async searchPosts(
    subredditName: string,
    query: string,
    limit: number = 100,
    timeframe: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'week',
  ) {
    const client = this.initClient();

    try {
      const subreddit = client.getSubreddit(subredditName);
      const posts = await subreddit.search({
        query,
        time: timeframe,
        limit,
      } as any);

      return posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        selftext: post.selftext || '',
        author: post.author.name,
        score: post.score,
        upvoteRatio: post.upvote_ratio,
        numComments: post.num_comments,
        created: new Date(post.created_utc * 1000),
        url: `https://reddit.com${post.permalink}`,
      }));
    } catch (error: any) {
      console.error(`Error searching posts in r/${subredditName}:`, error);
      throw new Error(`Failed to search posts: ${error.message}`);
    }
  }

  /**
   * Get subreddit info
   */
  async getSubredditInfo(subredditName: string) {
    return this.retryWithBackoff(async () => {
      const client = this.initClient();
      const subreddit = client.getSubreddit(subredditName);
      const info = await (subreddit as any).fetch();

      return {
        name: info.display_name,
        title: info.title,
        description: info.public_description,
        subscribers: info.subscribers,
        activeUsers: info.accounts_active,
        created: new Date(info.created_utc * 1000),
      };
    }, 3, `Fetching info for r/${subredditName}`);
  }
}

export const Reddit = new RedditClient();
