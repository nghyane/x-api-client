export interface UserByScreenNameOptions {
  screenName: string;
  withGrokTranslatedBio?: boolean;
}

export interface UserByScreenNameVariables {
  screen_name: string;
  withGrokTranslatedBio: boolean;
}

export interface UserProfileFeatures {
  hidden_profile_subscriptions_enabled?: boolean;
  payments_enabled?: boolean;
  profile_label_improvements_pcf_label_in_post_enabled?: boolean;
  responsive_web_profile_redirect_enabled?: boolean;
  rweb_tipjar_consumption_enabled?: boolean;
  verified_phone_label_enabled?: boolean;
  subscriptions_verification_info_is_identity_verified_enabled?: boolean;
  subscriptions_verification_info_verified_since_enabled?: boolean;
  highlights_tweets_tab_ui_enabled?: boolean;
  responsive_web_twitter_article_notes_tab_enabled?: boolean;
  subscriptions_feature_can_gift_premium?: boolean;
  creator_subscriptions_tweet_preview_api_enabled?: boolean;
  responsive_web_graphql_skip_user_profile_image_extensions_enabled?: boolean;
  responsive_web_graphql_timeline_navigation_enabled?: boolean;
}

export interface UserFieldToggles {
  withAuxiliaryUserLabels: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  description: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  isVerified: boolean;
  isBlueVerified: boolean;
  profileImageUrl: string;
  profileBannerUrl?: string;
  createdAt: string;
  location?: string;
  url?: string;
}

export interface UserApiResponse {
  data?: {
    user?: {
      result?: {
        __typename: string;
        id?: string;
        rest_id?: string;
        legacy?: {
          screen_name?: string;
          name?: string;
          description?: string;
          followers_count?: number;
          friends_count?: number;
          statuses_count?: number;
          verified?: boolean;
          profile_image_url_https?: string;
          profile_banner_url?: string;
          created_at?: string;
          location?: string;
          url?: string;
          [key: string]: unknown;
        };
        is_blue_verified?: boolean;
        [key: string]: unknown;
      };
    };
  };
  errors?: Array<{
    message: string;
    code?: number;
    [key: string]: unknown;
  }>;
}

export interface UserTweetsOptions {
  userId: string;
  count?: number;
  cursor?: string;
  includePromotedContent?: boolean;
}

export interface UserTweetsVariables {
  userId: string;
  count: number;
  cursor?: string;
  includePromotedContent: boolean;
  withQuickPromoteEligibilityTweetFields: boolean;
  withVoice: boolean;
}

export interface UserTweetsFeatures {
  rweb_video_screen_enabled?: boolean;
  payments_enabled?: boolean;
  profile_label_improvements_pcf_label_in_post_enabled?: boolean;
  responsive_web_profile_redirect_enabled?: boolean;
  rweb_tipjar_consumption_enabled?: boolean;
  verified_phone_label_enabled?: boolean;
  creator_subscriptions_tweet_preview_api_enabled?: boolean;
  responsive_web_graphql_timeline_navigation_enabled?: boolean;
  responsive_web_graphql_skip_user_profile_image_extensions_enabled?: boolean;
  premium_content_api_read_enabled?: boolean;
  communities_web_enable_tweet_community_results_fetch?: boolean;
  c9s_tweet_anatomy_moderator_badge_enabled?: boolean;
  responsive_web_grok_analyze_button_fetch_trends_enabled?: boolean;
  responsive_web_grok_analyze_post_followups_enabled?: boolean;
  responsive_web_jetfuel_frame?: boolean;
  responsive_web_grok_share_attachment_enabled?: boolean;
  articles_preview_enabled?: boolean;
  responsive_web_edit_tweet_api_enabled?: boolean;
  graphql_is_translatable_rweb_tweet_is_translatable_enabled?: boolean;
  view_counts_everywhere_api_enabled?: boolean;
  longform_notetweets_consumption_enabled?: boolean;
  responsive_web_twitter_article_tweet_consumption_enabled?: boolean;
  tweet_awards_web_tipping_enabled?: boolean;
  responsive_web_grok_show_grok_translated_post?: boolean;
  responsive_web_grok_analysis_button_from_backend?: boolean;
  creator_subscriptions_quote_tweet_preview_enabled?: boolean;
  freedom_of_speech_not_reach_fetch_enabled?: boolean;
  standardized_nudges_misinfo?: boolean;
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled?: boolean;
  longform_notetweets_rich_text_read_enabled?: boolean;
  longform_notetweets_inline_media_enabled?: boolean;
  responsive_web_grok_image_annotation_enabled?: boolean;
  responsive_web_grok_imagine_annotation_enabled?: boolean;
  responsive_web_grok_community_note_auto_translation_is_enabled?: boolean;
  responsive_web_enhance_cards_enabled?: boolean;
}

export interface Tweet {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  username: string;
  userDisplayName: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  bookmarkCount: number;
  viewCount?: string;
  isRetweet: boolean;
  isQuoteStatus: boolean;
  lang?: string;
  media?: TweetMedia[];
  quotedTweet?: Tweet;
  retweetedTweet?: Tweet;
}

export interface TweetMedia {
  type: "photo" | "video" | "animated_gif";
  url: string;
  mediaKey: string;
  width?: number;
  height?: number;
}

export interface UserTweetsResponse {
  tweets: Tweet[];
  cursor?: string;
  hasMore: boolean;
}

export interface UserTweetsApiResponse {
  data?: {
    user?: {
      result?: {
        __typename: string;
        timeline?: {
          timeline?: {
            instructions?: Array<{
              type: string;
              entries?: Array<{
                entryId: string;
                sortIndex: string;
                content: {
                  entryType: string;
                  __typename: string;
                  itemContent?: {
                    itemType: string;
                    __typename: string;
                    tweet_results?: {
                      result?: unknown;
                    };
                  };
                  value?: string;
                  cursorType?: string;
                };
              }>;
            }>;
          };
        };
      };
    };
  };
  errors?: Array<{
    message: string;
    code?: number;
    [key: string]: unknown;
  }>;
}
