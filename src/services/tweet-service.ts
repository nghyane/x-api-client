import type { AuthManager } from "../core/auth";
import type { HttpClient } from "../core/http-client";
import type { TweetResponse, TweetDetailResponse, HomeTimelineResponse } from "../types";
import type { ReplyOptions, QuoteOptions, TweetDetailOptions, HomeTimelineOptions } from "../types/tweet-types";
import { apiRequest } from "../core/api-client";
import { TWEET_FEATURES, TWEET_DETAIL_FEATURES } from "../core/endpoints";

export class TweetService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthManager,
  ) {}

  async create(text: string, mediaIds: string[] = []): Promise<TweetResponse> {
    return apiRequest('CREATE_TWEET', this.auth, this.http, {
      method: 'POST',
      transactionId: true,
      body: {
        variables: {
          tweet_text: text,
          dark_request: false,
          media: {
            media_entities: mediaIds.map(id => ({ media_id: id, tagged_users: [] })),
            possibly_sensitive: false,
          },
          semantic_annotation_ids: [],
          disallowed_reply_options: null,
        },
        features: TWEET_FEATURES,
      },
    });
  }

  async reply(options: ReplyOptions): Promise<TweetResponse> {
    const { tweetId, text, mediaIds = [], excludeReplyUserIds = [] } = options;

    return apiRequest('CREATE_REPLY', this.auth, this.http, {
      method: 'POST',
      transactionId: true,
      body: {
        variables: {
          tweet_text: text,
          reply: {
            in_reply_to_tweet_id: tweetId,
            exclude_reply_user_ids: excludeReplyUserIds,
          },
          dark_request: false,
          media: {
            media_entities: mediaIds.map(id => ({ media_id: id, tagged_users: [] })),
            possibly_sensitive: false,
          },
          semantic_annotation_ids: [],
          disallowed_reply_options: null,
        },
        features: TWEET_FEATURES,
      },
    });
  }

  async quote(options: QuoteOptions): Promise<TweetResponse> {
    const { tweetId, tweetAuthorUsername, text, mediaIds = [] } = options;

    return apiRequest('CREATE_REPLY', this.auth, this.http, {
      method: 'POST',
      transactionId: true,
      body: {
        variables: {
          tweet_text: text,
          attachment_url: `https://x.com/${tweetAuthorUsername}/status/${tweetId}`,
          dark_request: false,
          media: {
            media_entities: mediaIds.map(id => ({ media_id: id, tagged_users: [] })),
            possibly_sensitive: false,
          },
          semantic_annotation_ids: [],
          disallowed_reply_options: null,
        },
        features: TWEET_FEATURES,
      },
    });
  }

  async delete(tweetId: string): Promise<void> {
    await apiRequest('DELETE_TWEET', this.auth, this.http, {
      method: 'POST',
      transactionId: true,
      body: {
        variables: { tweet_id: tweetId, dark_request: false },
      },
    });
  }

  async getTweetDetail(options: TweetDetailOptions): Promise<TweetDetailResponse> {
    const {
      tweetId,
      referrer = 'me',
      rankingMode = 'Relevance',
      includePromotedContent = true,
      withBirdwatchNotes = true,
      withVoice = true,
    } = options;

    return apiRequest('TWEET_DETAIL', this.auth, this.http, {
      method: 'GET',
      referer: `https://x.com/i/web/status/${tweetId}`,
      params: {
        variables: JSON.stringify({
          focalTweetId: tweetId,
          referrer,
          with_rux_injections: false,
          rankingMode,
          includePromotedContent,
          withCommunity: true,
          withQuickPromoteEligibilityTweetFields: true,
          withBirdwatchNotes,
          withVoice,
        }),
        features: JSON.stringify(TWEET_DETAIL_FEATURES),
        fieldToggles: JSON.stringify({
          withArticleRichContentState: true,
          withArticlePlainText: false,
          withGrokAnalyze: false,
          withDisallowedReplyControls: false,
        }),
      },
    });
  }

  async getHomeTimeline(options: HomeTimelineOptions = {}): Promise<HomeTimelineResponse> {
    const {
      count = 20,
      cursor,
      includePromotedContent = true,
      latestControlAvailable = true,
      withCommunity = true,
      seenTweetIds = [],
    } = options;

    const variables: Record<string, unknown> = {
      count,
      includePromotedContent,
      latestControlAvailable,
      withCommunity,
    };

    if (cursor) variables.cursor = cursor;
    if (seenTweetIds.length > 0) variables.seenTweetIds = seenTweetIds;

    return apiRequest('HOME_TIMELINE', this.auth, this.http, {
      method: 'POST',
      referer: 'https://x.com/home',
      body: {
        variables,
        features: TWEET_DETAIL_FEATURES,
      },
    });
  }
}
