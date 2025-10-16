import type { TweetResponse } from "../types";

/**
 * Options for replying to a tweet
 */
export interface ReplyOptions {
  /** The ID of the tweet to reply to */
  tweetId: string;
  /** The reply text content */
  text: string;
  /** Optional array of media IDs to attach */
  mediaIds?: string[];
  /** User IDs to exclude from reply mentions */
  excludeReplyUserIds?: string[];
}

/**
 * Options for quote tweeting
 */
export interface QuoteOptions {
  /** The ID of the tweet to quote */
  tweetId: string;
  /** Username of the tweet author (for constructing URL) */
  tweetAuthorUsername: string;
  /** The quote tweet text content */
  text: string;
  /** Optional array of media IDs to attach */
  mediaIds?: string[];
}

/**
 * Options for getting tweet details
 */
export interface TweetDetailOptions {
  /** The ID of the tweet to get details for */
  tweetId: string;
  /** Referrer context (default: "me") */
  referrer?: string;
  /** Ranking mode for replies (default: "Relevance") */
  rankingMode?: "Relevance" | "Recency";
  /** Include promoted content (default: true) */
  includePromotedContent?: boolean;
  /** Include community notes (default: true) */
  withBirdwatchNotes?: boolean;
  /** Include voice tweets (default: true) */
  withVoice?: boolean;
}

/**
 * Options for getting home timeline
 */
export interface HomeTimelineOptions {
  /** Number of tweets to fetch (default: 20) */
  count?: number;
  /** Cursor for pagination */
  cursor?: string;
  /** Include promoted content (default: true) */
  includePromotedContent?: boolean;
  /** Latest control available (default: true) */
  latestControlAvailable?: boolean;
  /** Include community tweets (default: true) */
  withCommunity?: boolean;
  /** Array of seen tweet IDs to exclude */
  seenTweetIds?: string[];
}

/**
 * Tweet author information
 */
export interface TweetAuthor {
  id?: string;
  username?: string;
  name?: string;
}

/**
 * Tweet metrics
 */
export interface TweetMetrics {
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
}

/**
 * Optimized result class with lazy getters
 * Stores only raw response, parses on-demand
 */
export class TweetResult {
  constructor(private readonly _response: TweetResponse) {}

  /** Tweet ID */
  get id(): string | undefined {
    return this._response.data?.create_tweet?.tweet_results?.result?.rest_id;
  }

  /** Tweet URL */
  get url(): string | undefined {
    return this.id ? `https://x.com/i/web/status/${this.id}` : undefined;
  }

  /** Tweet text content */
  get text(): string | undefined {
    return this._response.data?.create_tweet?.tweet_results?.result?.legacy?.full_text;
  }

  /** Tweet author information */
  get author(): TweetAuthor {
    const user = this._response.data?.create_tweet?.tweet_results?.result?.core?.user_results?.result;
    return {
      id: user?.rest_id,
      username: user?.core?.screen_name ?? user?.legacy?.screen_name,
      name: user?.core?.name,
    };
  }

  /** Tweet engagement metrics */
  get metrics(): TweetMetrics {
    const legacy = this._response.data?.create_tweet?.tweet_results?.result?.legacy;
    return {
      likes: legacy?.favorite_count ?? 0,
      retweets: legacy?.retweet_count ?? 0,
      replies: legacy?.reply_count ?? 0,
      quotes: legacy?.quote_count ?? 0,
    };
  }

  /** Raw Twitter API response */
  get raw(): TweetResponse {
    return this._response;
  }

  /** Convert to plain object */
  toJSON() {
    return {
      id: this.id,
      url: this.url,
      text: this.text,
      author: this.author,
      metrics: this.metrics,
    };
  }
}

/** Result from reply operation */
export type ReplyResult = TweetResult;

/** Result from quote tweet operation */
export type QuoteResult = TweetResult;
