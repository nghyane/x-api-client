export { XApiClient, type XApiClientOptions } from "./client";

export {
  XApiError,
  AuthError,
  HttpError,
  MediaUploadError,
  BinaryNotFoundError,
} from "./errors";

export { XPFFHeaderGenerator } from "./core/fingerprint";

export type {
  MediaUploadInitResponse,
  MediaUploadFinalizeResponse,
  TweetError,
  TweetResponse,
  TweetDetailResponse,
  TweetDetailEntry,
  HomeTimelineResponse,
  AuthConfig,
  HttpResponse,
} from "./types";

export type {
  LikeResponse,
  UnlikeResponse,
  RetweetResponse,
  UnretweetResponse,
  DeleteTweetResponse,
  EngagementResult,
} from "./types/engagement-types";

export type {
  SearchOptions,
  SearchProduct,
  SearchResult,
  SimplifiedTweet,
  SearchApiResponse,
} from "./types/search-types";

export type {
  UserProfile,
  UserByScreenNameOptions,
  UserApiResponse,
  UserTweetsOptions,
  UserTweetsResponse,
  Tweet,
} from "./types/user-types";

export { TweetResult } from "./types/tweet-types";

export type {
  ReplyOptions,
  QuoteOptions,
  TweetDetailOptions,
  HomeTimelineOptions,
  ReplyResult,
  QuoteResult,
  TweetAuthor,
  TweetMetrics,
} from "./types/tweet-types";
