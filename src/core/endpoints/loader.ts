const CACHE_PATH = '.cache/api-endpoints.json';
const BASE_GRAPHQL_URL = 'https://x.com/i/api/graphql';

export interface EndpointConfig {
  readonly url: string;
  readonly queryId: string;
  readonly operationName: string;
}

export interface EndpointData {
  operationName: string;
  queryId: string;
  verified?: boolean;
  confidence?: 'high' | 'medium' | 'low';
  lastVerified?: number;
}

export interface EndpointsCache {
  version: string;
  timestamp: number;
  endpoints: Record<string, EndpointData>;
  stats?: {
    totalEndpoints: number;
    verifiedEndpoints: number;
    bundlesChecked: number;
  };
}

export type EndpointName = 
  | 'CREATE_TWEET'
  | 'CREATE_REPLY'
  | 'DELETE_TWEET'
  | 'TWEET_DETAIL'
  | 'HOME_TIMELINE'
  | 'SEARCH_TIMELINE'
  | 'USER_TWEETS'
  | 'FAVORITE_TWEET'
  | 'UNFAVORITE_TWEET'
  | 'CREATE_RETWEET'
  | 'DELETE_RETWEET'
  | 'USER_BY_SCREEN_NAME';

const ENDPOINT_MAPPING: Record<EndpointName, { queryId: string; operationName: string }> = {
  CREATE_TWEET: { queryId: 'QBGSJ27mdJ7KlPN7gm3XuQ', operationName: 'CreateTweet' },
  CREATE_REPLY: { queryId: 'zR1cQ4Y_-6Bmc76d4Chn5Q', operationName: 'CreateTweet' },
  DELETE_TWEET: { queryId: 'VaenaVgh5q5ih7kvyVjgtg', operationName: 'DeleteTweet' },
  TWEET_DETAIL: { queryId: '42jwneJuHpIeTQvoQoYfhw', operationName: 'TweetDetail' },
  HOME_TIMELINE: { queryId: 'wGPJhptsyASnUUJb9MPz0w', operationName: 'HomeTimeline' },
  SEARCH_TIMELINE: { queryId: '0TyyrdQrH9390DdGyoPYfg', operationName: 'SearchTimeline' },
  USER_TWEETS: { queryId: 'atTi7orSqZdPxTxkVNKTdg', operationName: 'UserTweets' },
  FAVORITE_TWEET: { queryId: 'lI07N6Otwv1PhnEgXILM7A', operationName: 'FavoriteTweet' },
  UNFAVORITE_TWEET: { queryId: 'ZYKSe-w7KEslx3JhSIk5LA', operationName: 'UnfavoriteTweet' },
  CREATE_RETWEET: { queryId: 'ojPdsZsimiJrUGLR1sjUtA', operationName: 'CreateRetweet' },
  DELETE_RETWEET: { queryId: 'iQtK4dl5hBmXewYZuEOKVw', operationName: 'DeleteRetweet' },
  USER_BY_SCREEN_NAME: { queryId: 'Sfq_BSQ7VVpC3u9ycqwKYg', operationName: 'UserByScreenName' },
};

class EndpointLoader {
  private cache: EndpointsCache | null = null;
  private loading: Promise<void> | null = null;
  private merged: Record<string, EndpointConfig> | null = null;

  async getEndpoints(): Promise<Record<EndpointName, EndpointConfig>> {
    if (this.merged) return this.merged as Record<EndpointName, EndpointConfig>;
    
    await this.ensureLoaded();
    
    if (!this.cache || Object.keys(this.cache.endpoints).length === 0) {
      throw new Error(
        'No endpoints found. Please run updateEndpoints() first to fetch from x.com'
      );
    }

    this.merged = this.buildFromCache();
    return this.merged as Record<EndpointName, EndpointConfig>;
  }

  async getEndpoint(name: EndpointName): Promise<EndpointConfig> {
    const all = await this.getEndpoints();
    const endpoint = all[name];
    if (!endpoint) throw new Error(`Endpoint not found: ${name}`);
    return endpoint;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.cache !== null) return;
    if (this.loading) return this.loading;
    
    this.loading = this.loadCache();
    await this.loading;
    this.loading = null;
  }

  private async loadCache(): Promise<void> {
    try {
      const file = Bun.file(CACHE_PATH);

      if (!(await file.exists())) {
        this.cache = null;
        return;
      }

      const data = await file.json();

      if (!this.isValidCache(data)) {
        this.cache = null;
        return;
      }

      this.cache = data as EndpointsCache;
    } catch {
      this.cache = null;
    }
  }

  private isValidCache(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      data.version &&
      data.timestamp &&
      data.endpoints &&
      typeof data.endpoints === 'object'
    );
  }

  private buildFromCache(): Record<string, EndpointConfig> {
    const result: Record<string, EndpointConfig> = {};

    for (const [name, mapping] of Object.entries(ENDPOINT_MAPPING)) {
      const cacheData = this.cache!.endpoints[mapping.operationName];

      if (cacheData && cacheData.queryId) {
        result[name] = {
          url: `${BASE_GRAPHQL_URL}/${cacheData.queryId}/${cacheData.operationName}`,
          queryId: cacheData.queryId,
          operationName: cacheData.operationName,
        };
      }
    }

    return result;
  }

  invalidate(): void {
    this.cache = null;
    this.merged = null;
    this.loading = null;
  }
}

const loader = new EndpointLoader();

export async function getEndpoints(): Promise<Record<EndpointName, EndpointConfig>> {
  return loader.getEndpoints();
}

export async function getEndpoint(name: EndpointName): Promise<EndpointConfig> {
  return loader.getEndpoint(name);
}

export function invalidateCache(): void {
  loader.invalidate();
}
