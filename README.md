# X API Client

Unofficial Twitter/X API client with browser impersonation. Built with TypeScript for Bun runtime.

**Platforms:** macOS (Intel/ARM) • Linux (x86_64/ARM64) • Windows (WSL2)

## Installation

```bash
npm install @nghyane/x-api-client
# or
bun add @nghyane/x-api-client
```

## Quick Start

```typescript
import { XApiClient } from "@nghyane/x-api-client";

const client = new XApiClient(process.env.X_COOKIE!);

// Post a tweet
await client.post("Hello Twitter! 🚀", ["image.png"]);

// Search
const results = await client.search.searchTweets({ query: "bun", count: 20 });

// Engage
await client.engagement.likeTweet(tweetId);
```

## Features

**Tweets:** Post • Reply • Quote • Delete • Timeline  
**Search:** Tweets (Top/Latest/Media) • Users  
**Users:** Profile • Tweets • Stats  
**Engagement:** Like • Retweet • Unlike • Unretweet

→ See [`examples/`](./examples/) for complete code samples

## Examples

```typescript
// Search with filters
const results = await client.search.searchTweets({
  query: "typescript",
  product: "Latest",
  count: 20,
  cursor: "...", // Pagination
});

// User profile
const user = await client.users.getUserByScreenName({ screenName: "jack" });

// Reply to tweet
await client.reply(tweetId, "Nice! 👍", ["reaction.png"]);
```

Full examples: [`examples/01-basic.ts`](./examples/01-basic.ts) • [`examples/02-search.ts`](./examples/02-search.ts) • [More →](./examples/)

## Configuration

```typescript
const client = new XApiClient(cookie, {
  bearerToken?: string;              // Custom bearer
  language?: string;                 // Default: 'en'
  autoGenerateFingerprint?: boolean; // Default: true
});
```

### Getting Cookie

1. Open DevTools (F12) → Network tab on https://x.com
2. Find any request → Headers → Copy `cookie` value
3. Set `X_COOKIE` environment variable

Required: `auth_token`, `ct0`, `twid`

## Security

⚠️ Never commit cookies • Use `.env` files • Rotate regularly

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
