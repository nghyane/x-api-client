import { AuthManager } from './core/auth';
import { HttpClient } from './core/http-client';
import { MediaUploader } from './services/media-uploader';
import { TweetService } from './services/tweet-service';
import { EngagementService } from './services/engagement-service';
import { SearchService } from './services/search-service';
import { UserService } from './services/user-service';
import { XPFFHeaderGenerator } from './core/fingerprint';
import type { TweetResponse } from './types';
import { TweetResult, type ReplyResult, type QuoteResult } from './types/tweet-types';

const MAX_IMAGES = 4;
const TWITTER_BASE_KEY = '0e6be1f1e21ffc33590b888fd4dc81b19713e570e805d4e5df80a493c9571a05';

export type { ReplyResult, QuoteResult };

export interface XApiClientOptions {
  bearerToken?: string;
  language?: string;
  customHeaders?: Record<string, string>;
  autoGenerateFingerprint?: boolean;
}

export class XApiClient {
  private readonly auth: AuthManager;
  private readonly http: HttpClient;
  private readonly _cookie: string;
  
  public readonly media: MediaUploader;
  public readonly tweets: TweetService;
  public readonly engagement: EngagementService;
  public readonly search: SearchService;
  public readonly users: UserService;

  constructor(cookie: string, options?: XApiClientOptions) {
    this._cookie = cookie;
    
    const customHeaders = options?.customHeaders || {};
    
    this.auth = new AuthManager(
      cookie,
      options?.bearerToken,
      options?.language,
      customHeaders
    );
    
    const autoGenerate = options?.autoGenerateFingerprint ?? true;
    if (autoGenerate) {
      const generator = new XPFFHeaderGenerator(TWITTER_BASE_KEY);
      this.auth.setFingerprintHook(async () => {
        try {
          const guestId = XPFFHeaderGenerator.extractGuestId(cookie);
          const fingerprintData = JSON.stringify({
            timestamp: Date.now(),
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
            platform: 'macOS',
            version: '141.0.0.0',
          });
          return await generator.generateXpff(fingerprintData, guestId);
        } catch (error) {
          console.warn('Failed to generate fingerprint:', error);
          return undefined;
        }
      });
    }
    
    this.http = new HttpClient();
    this.media = new MediaUploader(this.http, this.auth);
    this.tweets = new TweetService(this.http, this.auth);
    this.engagement = new EngagementService(this.http, this.auth);
    this.search = new SearchService(this.http, this.auth);
    this.users = new UserService(this.http, this.auth);
  }

  async post(text: string, imagePaths: string[] = []): Promise<TweetResult> {
    const mediaIds: string[] = [];

    if (imagePaths.length > 0) {
      const uploadPromises = imagePaths
        .slice(0, MAX_IMAGES)
        .map(path => this.media.upload(path));

      mediaIds.push(...(await Promise.all(uploadPromises)));
    }

    const response = await this.tweets.create(text, mediaIds);
    return new TweetResult(response);
  }

  async reply(tweetId: string, text: string, imagePaths: string[] = []): Promise<ReplyResult> {
    const mediaIds: string[] = [];

    if (imagePaths.length > 0) {
      const uploadPromises = imagePaths
        .slice(0, MAX_IMAGES)
        .map(path => this.media.upload(path));

      mediaIds.push(...(await Promise.all(uploadPromises)));
    }

    const response = await this.tweets.reply({
      tweetId,
      text,
      mediaIds,
    });

    return new TweetResult(response);
  }

  async quote(
    tweetId: string,
    tweetAuthorUsername: string,
    text: string,
    imagePaths: string[] = []
  ): Promise<QuoteResult> {
    const mediaIds: string[] = [];

    if (imagePaths.length > 0) {
      const uploadPromises = imagePaths
        .slice(0, MAX_IMAGES)
        .map(path => this.media.upload(path));

      mediaIds.push(...(await Promise.all(uploadPromises)));
    }

    const response = await this.tweets.quote({
      tweetId,
      tweetAuthorUsername,
      text,
      mediaIds,
    });

    return new TweetResult(response);
  }

  get csrfToken(): string {
    return this.auth.csrfToken;
  }

  get cookie(): string {
    return this.auth.cookie;
  }

  get bearerToken(): string {
    return this.auth.bearerToken;
  }
}
