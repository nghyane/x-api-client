import type { AuthManager } from "../core/auth";
import type { HttpClient } from "../core/http-client";
import type {
  SearchOptions,
  SearchResult,
  SearchApiResponse,
  SimplifiedTweet,
} from "../types/search-types";
import { apiRequest } from "../core/api-client";
import { SEARCH_FEATURES } from "../core/endpoints";

export class SearchService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthManager,
  ) {}

  async searchTweets(options: SearchOptions): Promise<SearchResult> {
    const {
      query,
      count = 20,
      cursor,
      product = "Top",
      querySource = "recent_search_click",
      withGrokTranslatedBio = false,
    } = options;

    const variables: Record<string, unknown> = {
      rawQuery: query,
      count,
      product,
      querySource,
      withGrokTranslatedBio,
    };

    if (cursor) variables.cursor = cursor;

    const response = await apiRequest<SearchApiResponse>('SEARCH_TIMELINE', this.auth, this.http, {
      method: 'GET',
      referer: `https://x.com/search?q=${encodeURIComponent(query)}&src=${querySource}`,
      params: {
        variables: JSON.stringify(variables),
        features: JSON.stringify(SEARCH_FEATURES),
      },
    });

    return this.parseSearchResponse(response);
  }

  private parseSearchResponse(response: SearchApiResponse): SearchResult {
    const tweets: SimplifiedTweet[] = [];
    
    const instructions =
      response.data?.search_by_raw_query?.search_timeline?.timeline?.instructions ?? [];

    const entries = instructions.flatMap(inst => 
      inst.type === 'TimelineAddEntries' ? inst.entries ?? [] : []
    );

    for (const entry of entries) {
      if (entry.content.entryType === "TimelineTimelineItem") {
        const tweetResult = entry.content.itemContent?.tweet_results?.result;
        if (tweetResult?.legacy) {
          const tweet = this.parseTweet(tweetResult);
          if (tweet) tweets.push(tweet);
        }
      }
    }

    const cursor = entries.find(e => e.content.cursorType === 'Bottom')?.content.value as string | undefined;

    return { tweets, cursor };
  }

  private parseTweet(tweetResult: any): SimplifiedTweet | null {
    const userResult = tweetResult.core?.user_results?.result;
    const legacy = tweetResult.legacy;

    if (!userResult?.core || !legacy) return null;

    return {
      id: tweetResult.rest_id,
      authorId: userResult.rest_id,
      authorUsername: userResult.core.screen_name,
      authorName: userResult.core.name,
      text: legacy.full_text,
      createdAt: legacy.created_at,
      likes: legacy.favorite_count,
      retweets: legacy.retweet_count,
      replies: legacy.reply_count,
      quotes: legacy.quote_count,
    };
  }
}
