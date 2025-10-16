import type { AuthManager } from "../core/auth";
import type { HttpClient } from "../core/http-client";
import { apiRequest } from "../core/api-client";

export class EngagementService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthManager,
  ) {}

  async like(tweetId: string): Promise<void> {
    await apiRequest('FAVORITE_TWEET', this.auth, this.http, {
      method: 'POST',
      body: {
        variables: { tweet_id: tweetId },
      },
      ignoreErrors: (msg) => msg.includes('has already favorited'),
    });
  }

  async unlike(tweetId: string): Promise<void> {
    await apiRequest('UNFAVORITE_TWEET', this.auth, this.http, {
      method: 'POST',
      body: {
        variables: { tweet_id: tweetId },
      },
      ignoreErrors: (msg) => msg.includes('was not found') && msg.includes('favorites'),
    });
  }

  async retweet(tweetId: string): Promise<string> {
    const response = await apiRequest<any>('CREATE_RETWEET', this.auth, this.http, {
      method: 'POST',
      transactionId: true,
      body: {
        variables: { tweet_id: tweetId, dark_request: false },
      },
      ignoreErrors: (msg) => msg.includes('has already retweeted'),
    });

    return response.data?.create_retweet?.retweet_results?.result?.rest_id ?? tweetId;
  }

  async unretweet(tweetId: string): Promise<void> {
    await apiRequest('DELETE_RETWEET', this.auth, this.http, {
      method: 'POST',
      transactionId: true,
      body: {
        variables: { source_tweet_id: tweetId, dark_request: false },
      },
      ignoreErrors: (msg) => msg.includes('No retweet') || msg.includes('not retweeted'),
    });
  }
}
