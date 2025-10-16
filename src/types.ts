export interface AuthConfig {
  cookie: string;
  bearerToken: string;
  csrfToken: string;
}

export interface HttpResponse {
  stdout: Buffer;
  stderr: string;
  exitCode: number;
}

export interface MediaUploadInitResponse {
  media_id_string: string;
  expires_after_secs?: number;
}

export interface MediaUploadFinalizeResponse {
  media_id_string: string;
  size?: number;
  expires_after_secs?: number;
  image?: {
    image_type?: string;
    w?: number;
    h?: number;
  };
  processing_info?: {
    state: 'pending' | 'in_progress' | 'failed' | 'succeeded';
    check_after_secs?: number;
    progress_percent?: number;
  };
}

export interface TweetError {
  code: number;
  message: string;
}

export interface TweetEntities {
  hashtags: any[];
  symbols: any[];
  timestamps?: any[];
  urls: {
    display_url?: string;
    expanded_url?: string;
    url?: string;
    indices?: [number, number];
  }[];
  user_mentions: any[];
}

export interface TweetLegacy {
  bookmark_count: number;
  bookmarked: boolean;
  created_at: string;
  conversation_id_str: string;
  display_text_range: [number, number];
  entities: TweetEntities;
  favorite_count: number;
  favorited: boolean;
  full_text: string;
  is_quote_status: boolean;
  lang: string;
  possibly_sensitive?: boolean;
  quote_count: number;
  reply_count: number;
  retweet_count: number;
  retweeted: boolean;
  user_id_str: string;
  id_str: string;
}

export interface UserLegacy {
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  entities: {
    description: { urls: any[] };
    url?: {
      urls: {
        display_url: string;
        expanded_url: string;
        url: string;
        indices: [number, number];
      }[];
    };
  };
  fast_followers_count: number;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  has_custom_timelines: boolean;
  is_translator: boolean;
  listed_count: number;
  media_count: number;
  needs_phone_verification: boolean;
  normal_followers_count: number;
  pinned_tweet_ids_str?: string[];
  possibly_sensitive: boolean;
  profile_banner_url?: string;
  profile_interstitial_type: string;
  protected?: boolean;
  screen_name?: string;
  name?: string;
  statuses_count: number;
  translator_type: string;
  url?: string;
  want_retweets: boolean;
  withheld_in_countries: any[];
}

export interface UserCore {
  created_at: string;
  name: string;
  screen_name: string;
}

export interface UserResult {
  __typename: string;
  id: string;
  rest_id: string;
  affiliates_highlighted_label: Record<string, any>;
  avatar?: {
    image_url: string;
  };
  core: UserCore;
  dm_permissions?: {
    can_dm: boolean;
    can_dm_on_xchat: boolean;
  };
  has_graduated_access: boolean;
  is_blue_verified: boolean;
  legacy: UserLegacy;
  location?: {
    location: string;
  };
  media_permissions?: {
    can_media_tag: boolean;
  };
  parody_commentary_fan_label?: string;
  profile_image_shape: string;
  professional?: {
    rest_id: string;
    professional_type: string;
    category: {
      id: number;
      name: string;
      display: boolean;
      icon_name: string;
    }[];
  };
  privacy?: {
    protected: boolean;
  };
  relationship_perspectives?: {
    following: boolean;
  };
  tipjar_settings?: Record<string, any>;
  verification?: {
    verified: boolean;
  };
}

export interface EditControl {
  edit_tweet_ids: string[];
  editable_until_msecs: string;
  is_edit_eligible: boolean;
  edits_remaining: string;
}

export interface TweetResult {
  rest_id: string;
  core?: {
    user_results: {
      result: UserResult;
    };
  };
  unmention_data: Record<string, any>;
  edit_control: EditControl;
  is_translatable: boolean;
  views?: {
    state: string;
    count?: string;
  };
  source: string;
  grok_translated_post_with_availability?: {
    is_available: boolean;
  };
  grok_analysis_button?: boolean;
  legacy: TweetLegacy;
  unmention_info: Record<string, any>;
}

export interface TweetResponse {
  data?: {
    create_tweet?: {
      tweet_results?: {
        result?: TweetResult;
      };
    };
  };
  errors?: TweetError[];
}

export interface TweetDetailEntry {
  entryId: string;
  sortIndex: string;
  content: {
    entryType: string;
    __typename: string;
    itemContent?: {
      itemType: string;
      __typename: string;
      tweet_results: {
        result: TweetResult;
      };
      tweetDisplayType?: string;
    };
    value?: string;
    cursorType?: string;
  };
}

export interface TweetDetailResponse {
  data?: {
    threaded_conversation_with_injections_v2?: {
      instructions: Array<{
        type: string;
        entries?: TweetDetailEntry[];
        direction?: string;
      }>;
      metadata?: {
        scribeConfig?: {
          page: string;
        };
      };
    };
  };
  errors?: TweetError[];
}

export interface HomeTimelineResponse {
  data?: {
    home?: {
      home_timeline_urt?: {
        instructions: Array<{
          type: string;
          entries?: TweetDetailEntry[];
          direction?: string;
        }>;
        responseObjects?: {
          feedbackActions?: any[];
        };
        metadata?: {
          scribeConfig?: {
            page: string;
          };
        };
      };
    };
  };
  errors?: TweetError[];
}
