# X API Client

Unofficial Twitter/X API client using curl-impersonate for browser impersonation.

## Platform Support

- ✅ **macOS** (Intel & Apple Silicon)
- ✅ **Linux** (x86_64 & ARM64)
- ⚠️ **Windows** (Use WSL2)

Binaries included in `bin/curl-impersonate/` - auto-detects your platform.

## Installation

```bash
bun install
```

For Windows, use WSL2:
```bash
wsl --install
cd /mnt/c/your-project
```

## Quick Start

```typescript
import { XApiClient } from "./src";

const client = new XApiClient(process.env.X_COOKIE!);

// Post a tweet
const result = await client.post("Hello Twitter! 🚀");
console.log("Tweet URL:", result.url);
```

## API Coverage

### 📝 Tweets
- **Post tweets** - Text and images (up to 4) → [`examples/01-basic.ts`](./examples/01-basic.ts)
- **Reply to tweets** - With optional images → [`examples/05-reply.ts`](./examples/05-reply.ts)
- **Quote tweets** - With optional images → [`examples/06-quote.ts`](./examples/06-quote.ts)
- **Get tweet details** - Full thread and conversation → [`examples/07-tweet-detail.ts`](./examples/07-tweet-detail.ts)
- **Home timeline** - Your feed with pagination → [`examples/08-home-timeline.ts`](./examples/08-home-timeline.ts)

### 🔍 Search & Discovery
- **Search tweets** - By query with filters → [`examples/02-search.ts`](./examples/02-search.ts)
- **Get user profile** - User info and stats → [`examples/03-users.ts`](./examples/03-users.ts)
- **Get user tweets** - Timeline for any user → [`examples/03-users.ts`](./examples/03-users.ts)

### ❤️ Engagement
- **Like/Unlike** - Engage with tweets → [`examples/04-engagement.ts`](./examples/04-engagement.ts)
- **Retweet/Unretweet** - Share content → [`examples/04-engagement.ts`](./examples/04-engagement.ts)
- **Delete tweet** - Remove your tweets → [`examples/04-engagement.ts`](./examples/04-engagement.ts)

## Usage Examples

### Post Tweet with Images

```typescript
const result = await client.post(
  "Check out this manga! 📚",
  ["./cover.png", "./page1.png"]
);
```

### Reply to Tweet

```typescript
const reply = await client.reply(
  tweetId,
  "Great post! 👍",
  ["./response.png"]
);
```

### Search Tweets

```typescript
const results = await client.search.searchTweets({
  query: "manga",
  count: 20,
  product: "Latest", // 'Top' | 'Latest' | 'People' | 'Photos' | 'Videos'
});

for (const tweet of results.tweets) {
  console.log(`@${tweet.authorUsername}: ${tweet.text}`);
}

// Pagination
if (results.cursor) {
  const page2 = await client.search.searchTweets({
    query: "manga",
    count: 20,
    product: "Latest",
    cursor: results.cursor,
  });
}
```

### Get User Profile

```typescript
const user = await client.users.getUserByScreenName({
  screenName: "elonmusk",
});

console.log(`${user.name} (@${user.username})`);
console.log(`Followers: ${user.followersCount}`);
```

### Home Timeline

```typescript
const timeline = await client.tweets.getHomeTimeline({ count: 20 });

const instructions = timeline.data?.home?.home_timeline_urt?.instructions || [];
// Parse timeline entries...
```

See [`examples/`](./examples/) directory for complete working examples.

## Environment Variables

Create a `.env` file:

```bash
X_COOKIE="your_cookie_string_here"
```

### Getting Your Cookie

1. Open Twitter/X in your browser
2. Open DevTools (F12) → Network tab
3. Visit any page (e.g., https://x.com/home)
4. Find any request → Headers → Copy entire `cookie` header value
5. Paste into `.env` file

**Required cookies:**
- `auth_token` - Your session token
- `ct0` - CSRF token (required!)
- `twid` - Twitter user ID

## Configuration Options

```typescript
const client = new XApiClient(cookie, {
  bearerToken?: string;              // Custom bearer (optional)
  language?: string;                 // Default: 'en'
  autoGenerateFingerprint?: boolean; // Default: true
  customHeaders?: Record<string, string>;
});
```

## Error Handling

```typescript
import { XApiError, AuthError, HttpError, MediaUploadError } from "./src";

try {
  await client.post("Hello!", ["image.png"]);
} catch (error) {
  if (error instanceof AuthError) {
    console.error("Auth failed:", error.message);
  } else if (error instanceof MediaUploadError) {
    console.error("Upload failed:", error.message);
  } else if (error instanceof HttpError) {
    console.error("HTTP error:", error.statusCode);
  }
}
```

## Architecture

```
src/
├── client.ts              # Main XApiClient
├── core/
│   ├── auth.ts           # Authentication & headers
│   ├── http-client.ts    # curl-impersonate wrapper
│   ├── fingerprint.ts    # Browser fingerprint generator
│   └── transaction/      # Transaction ID generator
├── services/
│   ├── tweet-service.ts       # Tweet operations
│   ├── engagement-service.ts  # Like/Retweet/Delete
│   ├── search-service.ts      # Search tweets/users
│   ├── user-service.ts        # User profiles
│   └── media-uploader.ts      # Image uploads
└── types/                # TypeScript types
```

## Security Notes

⚠️ **IMPORTANT:**
- Never commit cookies or tokens to git
- Add `.env` to `.gitignore`
- Rotate cookies regularly
- Monitor Twitter's rate limits

## Credits & References

This project builds upon research and insights from:

- **x-xp-forwarded-for header generation**: [dsekz/twitter-x-xp-forwarded-for-header](https://github.com/dsekz/twitter-x-xp-forwarded-for-header)
  - Browser fingerprint generation algorithm
  - Cubic interpolation implementation

- **x-client-transaction-id generation**: [iSarabjitDhiman/XClientTransaction](https://github.com/iSarabjitDhiman/XClientTransaction)
  - Transaction ID generation logic
  - Request signature patterns

Special thanks to the open-source community for making Twitter/X API research accessible.

## License

MIT
