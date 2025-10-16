import type { AuthManager } from "../core/auth";
import type { HttpClient } from "../core/http-client";
import type {
  UserByScreenNameOptions,
  UserProfile,
  UserApiResponse,
  UserTweetsOptions,
  UserTweetsResponse,
  UserTweetsApiResponse,
  Tweet,
} from "../types/user-types";
import { XApiError } from "../errors";
import { apiRequest } from "../core/api-client";
import { USER_PROFILE_FEATURES, USER_TWEETS_FEATURES } from "../core/endpoints";

export class UserService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthManager,
  ) {}

  async getUserByScreenName(
    options: UserByScreenNameOptions,
  ): Promise<UserProfile> {
    const { screenName, withGrokTranslatedBio = true } = options;

    const response = await apiRequest<UserApiResponse>(
      "USER_BY_SCREEN_NAME",
      this.auth,
      this.http,
      {
        method: "GET",
        params: {
          variables: JSON.stringify({
            screen_name: screenName,
            withGrokTranslatedBio,
          }),
          features: JSON.stringify(USER_PROFILE_FEATURES),
          fieldToggles: JSON.stringify({ withAuxiliaryUserLabels: true }),
        },
      },
    );

    const userResult = response.data?.user?.result;

    if (!userResult || userResult.__typename === "UserUnavailable") {
      throw new XApiError(`User not found: ${screenName}`, "USER_NOT_FOUND");
    }

    return this.parseUserProfile(userResult);
  }

  async getUserTweets(options: UserTweetsOptions): Promise<UserTweetsResponse> {
    const {
      userId,
      count = 20,
      cursor,
      includePromotedContent = true,
    } = options;

    const variables = {
      userId,
      count,
      includePromotedContent,
      withQuickPromoteEligibilityTweetFields: true,
      withVoice: true,
      ...(cursor && { cursor }),
    };

    const response = await apiRequest<UserTweetsApiResponse>(
      "USER_TWEETS",
      this.auth,
      this.http,
      {
        method: "GET",
        params: {
          variables: JSON.stringify(variables),
          features: JSON.stringify(USER_TWEETS_FEATURES),
          fieldToggles: JSON.stringify({ withArticlePlainText: false }),
        },
      },
    );

    return this.parseUserTweets(response);
  }

  private parseUserTweets(response: UserTweetsApiResponse): UserTweetsResponse {
    const instructions =
      response.data?.user?.result?.timeline?.timeline?.instructions ?? [];

    const entries = instructions.flatMap((inst) =>
      inst.type === "TimelineAddEntries" ? (inst.entries ?? []) : [],
    );

    const tweets = entries
      .filter((e) => e.content.entryType === "TimelineTimelineItem")
      .map((e) => this.parseTweet(e.content.itemContent?.tweet_results?.result))
      .filter((t): t is Tweet => t !== null);

    const cursor = entries.find((e) => e.content.cursorType === "Bottom")
      ?.content.value as string | undefined;

    return { tweets, cursor, hasMore: cursor !== undefined };
  }

  private parseTweet(tweetResult: any): Tweet | null {
    if (!tweetResult?.legacy) return null;

    const { legacy } = tweetResult;
    const userCore = tweetResult.core?.user_results?.result?.core;

    return {
      id: tweetResult.rest_id,
      text: legacy.full_text,
      createdAt: legacy.created_at,
      userId:
        legacy.user_id_str ??
        tweetResult.core?.user_results?.result?.rest_id ??
        "",
      username: userCore?.screen_name ?? "",
      userDisplayName: userCore?.name ?? "",
      retweetCount: legacy.retweet_count,
      replyCount: legacy.reply_count,
      likeCount: legacy.favorite_count,
      quoteCount: legacy.quote_count,
      bookmarkCount: legacy.bookmark_count,
      viewCount: tweetResult.views?.count,
      isRetweet: !!legacy.retweeted_status_result,
      isQuoteStatus: legacy.is_quote_status ?? false,
      lang: legacy.lang,
    };
  }

  private parseUserProfile(userResult: any): UserProfile {
    const { legacy, core } = userResult;

    if (!legacy && !core) {
      throw new XApiError("Invalid user data", "INVALID_USER_DATA");
    }

    return {
      id: userResult.rest_id,
      username: core?.screen_name ?? legacy?.screen_name ?? "",
      name: core?.name ?? legacy?.name ?? "",
      description: legacy?.description ?? "",
      followersCount: legacy?.followers_count,
      followingCount: legacy?.friends_count,
      tweetsCount: legacy?.statuses_count,
      isVerified: legacy?.verified ?? false,
      isBlueVerified: userResult.is_blue_verified ?? false,
      profileImageUrl:
        userResult.avatar?.image_url ?? legacy?.profile_image_url_https ?? "",
      profileBannerUrl: legacy?.profile_banner_url,
      createdAt: core?.created_at ?? legacy?.created_at ?? "",
      location: legacy?.location,
      url: legacy?.url,
    };
  }
}
