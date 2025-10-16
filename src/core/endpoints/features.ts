/**
 * Centralized Twitter/X API Feature Flags
 *
 * These feature flags control GraphQL API behavior and capabilities.
 * They are sent with most GraphQL requests to enable/disable features.
 *
 * These flags can be auto-updated using the API updater (see api-updater.ts)
 */

/**
 * Common feature flags shared across multiple operations
 */
export const COMMON_FEATURES = {
  payments_enabled: false,
  profile_label_improvements_pcf_label_in_post_enabled: true,
  responsive_web_profile_redirect_enabled: false,
  rweb_tipjar_consumption_enabled: true,
  verified_phone_label_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  premium_content_api_read_enabled: false,
  communities_web_enable_tweet_community_results_fetch: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  responsive_web_grok_analyze_button_fetch_trends_enabled: false,
  responsive_web_grok_analyze_post_followups_enabled: true,
  responsive_web_jetfuel_frame: true,
  responsive_web_grok_share_attachment_enabled: true,
  articles_preview_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  responsive_web_grok_show_grok_translated_post: true,
  responsive_web_grok_analysis_button_from_backend: true,
  creator_subscriptions_quote_tweet_preview_enabled: false,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: true,
  responsive_web_grok_image_annotation_enabled: true,
  responsive_web_grok_imagine_annotation_enabled: true,
  responsive_web_grok_community_note_auto_translation_is_enabled: false,
  responsive_web_enhance_cards_enabled: false,
} as const;

/**
 * Feature flags for tweet creation and interaction
 */
export const TWEET_FEATURES = {
  ...COMMON_FEATURES,
} as const;

/**
 * Feature flags for tweet detail view
 */
export const TWEET_DETAIL_FEATURES = {
  rweb_video_screen_enabled: false,
  ...COMMON_FEATURES,
  creator_subscriptions_tweet_preview_api_enabled: true,
} as const;

/**
 * Feature flags for search operations
 */
export const SEARCH_FEATURES = {
  rweb_video_screen_enabled: false,
  ...COMMON_FEATURES,
  creator_subscriptions_tweet_preview_api_enabled: true,
} as const;

/**
 * Feature flags for user profile operations
 */
export const USER_PROFILE_FEATURES = {
  hidden_profile_subscriptions_enabled: true,
  payments_enabled: false,
  profile_label_improvements_pcf_label_in_post_enabled: true,
  responsive_web_profile_redirect_enabled: false,
  rweb_tipjar_consumption_enabled: true,
  verified_phone_label_enabled: false,
  subscriptions_verification_info_is_identity_verified_enabled: true,
  subscriptions_verification_info_verified_since_enabled: true,
  highlights_tweets_tab_ui_enabled: true,
  responsive_web_twitter_article_notes_tab_enabled: true,
  subscriptions_feature_can_gift_premium: true,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
} as const;

/**
 * Feature flags for user tweets timeline
 */
export const USER_TWEETS_FEATURES = {
  rweb_video_screen_enabled: false,
  ...COMMON_FEATURES,
  creator_subscriptions_tweet_preview_api_enabled: true,
} as const;

/**
 * Field toggles for various operations
 */
export const FIELD_TOGGLES = {
  USER_PROFILE: {
    withAuxiliaryUserLabels: true,
  },
  TWEET_DETAIL: {
    withArticleRichContentState: true,
    withArticlePlainText: false,
    withGrokAnalyze: false,
    withDisallowedReplyControls: false,
  },
  USER_TWEETS: {
    withArticlePlainText: false,
  },
} as const;

/**
 * Type exports for feature flag objects
 */
export type CommonFeatures = typeof COMMON_FEATURES;
export type TweetFeatures = typeof TWEET_FEATURES;
export type TweetDetailFeatures = typeof TWEET_DETAIL_FEATURES;
export type SearchFeatures = typeof SEARCH_FEATURES;
export type UserProfileFeatures = typeof USER_PROFILE_FEATURES;
export type UserTweetsFeatures = typeof USER_TWEETS_FEATURES;
