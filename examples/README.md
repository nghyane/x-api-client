# Examples

Complete working examples for X API Client.

## Setup

Create a `.env` file:

```bash
X_COOKIE="your_full_cookie_string"
```

## Running Examples

```bash
# Post a tweet
bun examples/01-basic.ts

# Search tweets
bun examples/02-search.ts

# Get user profile and tweets
bun examples/03-users.ts

# Like/Unlike/Retweet
bun examples/04-engagement.ts

# Reply to a tweet
bun examples/05-reply.ts

# Quote tweet
bun examples/06-quote.ts

# Get tweet details and conversation
bun examples/07-tweet-detail.ts

# Get home timeline (feed)
bun examples/08-home-timeline.ts
```

## Examples Overview

### [01-basic.ts](./01-basic.ts) - Post Tweet
Post a basic tweet with text and get the result.

```typescript
const result = await client.post("Hello Twitter! 🚀");
console.log("Tweet URL:", result.url);
console.log("Tweet ID:", result.id);
```

### [02-search.ts](./02-search.ts) - Search Tweets
Search for tweets with filters and pagination.

```typescript
const results = await client.search.searchTweets({
  query: "manga",
  count: 20,
  product: "Latest",
});

// Pagination
const page2 = await client.search.searchTweets({
  query: "manga",
  count: 20,
  product: "Latest",
  cursor: results.cursor,
});
```

### [03-users.ts](./03-users.ts) - User Profile & Tweets
Get user information and their tweets.

```typescript
const user = await client.users.getUserByScreenName({
  screenName: "elonmusk",
});

const tweets = await client.users.getUserTweets({
  userId: user.id,
  count: 20,
});
```

### [04-engagement.ts](./04-engagement.ts) - Interactions
Like, unlike, retweet, unretweet, and delete tweets.

```typescript
await client.engagement.like(tweetId);
await client.engagement.unlike(tweetId);
await client.engagement.retweet(tweetId);
await client.engagement.unretweet(tweetId);
await client.tweets.delete(tweetId);
```

### [05-reply.ts](./05-reply.ts) - Reply to Tweets
Reply to any tweet with optional images.

```typescript
const reply = await client.reply(tweetId, "Great post! 👍");

// With images
const withImage = await client.reply(
  tweetId,
  "Here's my thought:",
  ["./image.png"]
);

console.log("Reply URL:", reply.url);
```

### [06-quote.ts](./06-quote.ts) - Quote Tweets
Quote tweet with your commentary and optional images.

```typescript
const quote = await client.quote(
  tweetId,
  "username",
  "This is interesting! 🧵"
);

// With images
const withImage = await client.quote(
  tweetId,
  "username",
  "My analysis:",
  ["./chart.png"]
);
```

### [07-tweet-detail.ts](./07-tweet-detail.ts) - Tweet Details
Get complete tweet information including conversation thread.

```typescript
const response = await client.tweets.getTweetDetail({ tweetId });

// Access tweet data
const instructions = response.data?.threaded_conversation_with_injections_v2?.instructions || [];
// Parse entries for tweet data, replies, and cursors
```

### [08-home-timeline.ts](./08-home-timeline.ts) - Home Feed
Fetch your home timeline (feed) with pagination.

```typescript
const timeline = await client.tweets.getHomeTimeline({ count: 20 });

// Parse timeline
const instructions = timeline.data?.home?.home_timeline_urt?.instructions || [];
// Extract tweets and cursor for pagination

// Next page
const page2 = await client.tweets.getHomeTimeline({
  count: 20,
  cursor: cursor,
});
```

## API Quick Reference

### Tweets

```typescript
// Post tweet
await client.post("Hello", ["image.png"]);

// Reply
await client.reply(tweetId, "Nice!", ["image.png"]);

// Quote
await client.quote(tweetId, "username", "Thoughts...", ["image.png"]);

// Get tweet details
await client.tweets.getTweetDetail({ tweetId });

// Home timeline
await client.tweets.getHomeTimeline({ count: 20 });

// Delete
await client.tweets.delete(tweetId);
```

### Engagement

```typescript
await client.engagement.like(tweetId);
await client.engagement.unlike(tweetId);
await client.engagement.retweet(tweetId);
await client.engagement.unretweet(tweetId);
```

### Search

```typescript
await client.search.searchTweets({
  query: "keyword",
  count: 20,
  product: "Latest", // 'Top' | 'Latest' | 'People' | 'Photos' | 'Videos'
  cursor: "...",     // for pagination
});
```

### Users

```typescript
await client.users.getUserByScreenName({ screenName: "username" });
await client.users.getUserTweets({ userId: "123", count: 20 });
```

## Result Format

All tweet operations return a `TweetResult` object with lazy getters:

```typescript
const result = await client.post("Hello");

result.id              // Tweet ID
result.url             // Tweet URL
result.text            // Tweet text content
result.author          // { id, username, name }
result.metrics         // { likes, retweets, replies, quotes }
result.raw             // Full raw API response
```

## Error Handling

```typescript
import { XApiError, AuthError, MediaUploadError } from "../src";

try {
  await client.post("Hello", ["image.png"]);
} catch (error) {
  if (error instanceof AuthError) {
    console.error("Authentication failed");
  } else if (error instanceof MediaUploadError) {
    console.error("Image upload failed");
  } else if (error instanceof XApiError) {
    console.error("API error:", error.message);
  }
}
```

## Notes

- All examples use environment variables from `.env`
- Images are optional for post/reply/quote operations
- Timeline and search support pagination via cursor
- Tweet/reply/quote return consistent `TweetResult` format
- Direct service access: `client.tweets.*`, `client.engagement.*`, etc.
