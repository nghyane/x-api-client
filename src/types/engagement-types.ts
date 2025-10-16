// Engagement API Types

export interface LikeResponse {
  data?: {
    favorite_tweet?: 'Done';
  };
  errors?: Array<{
    message: string;
    code: number;
  }>;
}

export interface UnlikeResponse {
  data?: {
    unfavorite_tweet?: 'Done';
  };
  errors?: Array<{
    message: string;
    code: number;
  }>;
}

export interface RetweetResponse {
  data?: {
    create_retweet?: {
      retweet_results?: {
        result?: {
          rest_id?: string;
          legacy?: {
            full_text?: string;
          };
        };
      };
    };
  };
  errors?: Array<{
    message: string;
    code: number;
  }>;
}

export interface UnretweetResponse {
  data?: {
    unretweet?: {
      source_tweet_results?: {
        result?: {
          rest_id?: string;
        };
      };
    };
  };
  errors?: Array<{
    message: string;
    code: number;
  }>;
}

export interface DeleteTweetResponse {
  data?: {
    delete_tweet?: {
      tweet_results?: {
        result?: {
          rest_id?: string;
        };
      };
    };
  };
  errors?: Array<{
    message: string;
    code: number;
  }>;
}

export interface EngagementResult {
  success: boolean;
  tweetId?: string;
  action: 'like' | 'unlike' | 'retweet' | 'unretweet' | 'delete';
  error?: string;
}
