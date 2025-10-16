export type SearchProduct = "Top" | "Latest" | "People" | "Photos" | "Videos" | "Media";

export interface SearchOptions {
  query: string;
  count?: number;
  cursor?: string;
  product?: "Top" | "Latest" | "People" | "Photos" | "Videos";
  querySource?: string;
  withGrokTranslatedBio?: boolean;
}

export interface SearchVariables {
  rawQuery: string;
  count: number;
  cursor?: string;
  product: string;
  querySource?: string;
  withGrokTranslatedBio?: boolean;
}

export interface SearchFeatures {
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
  [key: string]: boolean | undefined;
}

export interface SearchTweetEntry {
  entryId: string;
  sortIndex: string;
  content: {
    entryType: string;
    __typename: string;
    itemContent?: {
      itemType: string;
      __typename: string;
      tweet_results?: {
        result?: {
          __typename: string;
          rest_id?: string;
          core?: {
            user_results?: {
              result?: {
                __typename: string;
                id?: string;
                rest_id?: string;
                legacy?: {
                  screen_name?: string;
                  name?: string;
                  [key: string]: unknown;
                };
              };
            };
          };
          legacy?: {
            full_text?: string;
            created_at?: string;
            favorite_count?: number;
            retweet_count?: number;
            reply_count?: number;
            quote_count?: number;
            [key: string]: unknown;
          };
          [key: string]: unknown;
        };
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface SearchTimelineInstruction {
  type: string;
  entries?: SearchTweetEntry[];
  entry?: SearchTweetEntry;
  [key: string]: unknown;
}

export interface SearchTimelineData {
  search_by_raw_query?: {
    search_timeline?: {
      timeline?: {
        instructions?: SearchTimelineInstruction[];
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface SearchApiResponse {
  data?: SearchTimelineData;
  errors?: Array<{
    message: string;
    code?: number;
    [key: string]: unknown;
  }>;
}

export interface SimplifiedTweet {
  id: string;
  text: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  createdAt: string;
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
}

export interface SearchResult {
  tweets: SimplifiedTweet[];
  cursor?: string;
}
