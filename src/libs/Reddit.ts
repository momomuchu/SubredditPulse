import Snoowrap from 'snoowrap';

import { Env } from './Env';

/**
 * Reddit API Client
 *
 * Handles all Reddit API interactions using Snoowrap
 */
class RedditClient {
  private client: Snoowrap | null = null;

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
      const posts = await subreddit.getHot({ limit, time: timeframe });

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
    const client = this.initClient();

    try {
      const subreddit = client.getSubreddit(subredditName);
      const posts = await subreddit.getTop({ limit, time: timeframe });

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
    } catch (error: any) {
      console.error(`Error fetching top posts from r/${subredditName}:`, error);
      throw new Error(`Failed to fetch top posts: ${error.message}`);
    }
  }

  /**
   * Fetch comments from a post (for deeper sentiment analysis)
   */
  async fetchComments(postId: string, limit: number = 50) {
    const client = this.initClient();

    try {
      const submission = client.getSubmission(postId);
      await submission.expandReplies({ limit, depth: 1 });

      const comments = submission.comments || [];

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
      });

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
    const client = this.initClient();

    try {
      const subreddit = client.getSubreddit(subredditName);
      const info = await subreddit.fetch();

      return {
        name: info.display_name,
        title: info.title,
        description: info.public_description,
        subscribers: info.subscribers,
        activeUsers: info.accounts_active,
        created: new Date(info.created_utc * 1000),
      };
    } catch (error: any) {
      console.error(`Error fetching subreddit info for r/${subredditName}:`, error);
      throw new Error(`Failed to fetch subreddit info: ${error.message}`);
    }
  }
}

export const Reddit = new RedditClient();
