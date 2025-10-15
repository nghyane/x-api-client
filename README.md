# XApiClient - Twitter/X API Client

Optimized Twitter/X API client using `curl_cffi` for posting tweets with/without media.

## Features

- ✅ Post text-only tweets
- ✅ Post tweets with single image
- ✅ Post tweets with multiple images (up to 4)
- ✅ Parallel image upload for better performance
- ✅ MD5 hash validation for media uploads
- ✅ Full CSRF and bearer token authentication
- ✅ Edge 101 browser impersonation
- ✅ Complete error handling

## Installation

```bash
# Ensure curl_edge101 is available in system PATH
curl_edge101 --version

# Should show Edge 101 browser impersonation
which curl_edge101
# /usr/local/bin/curl_edge101
```

## Usage

### Basic Setup

```javascript
import { XApiClient } from './src/utils/x-api-client.js';

const cookie = 'your_cookie_with_ct0=...';
const bearerToken = 'your_bearer_token';

const client = new XApiClient(cookie, bearerToken);
```

### Text-Only Tweet

```javascript
await client.post('Hello Twitter! 🚀');
```

### Tweet with Single Image

```javascript
await client.post(
    'Check out this manga! 📚',
    ['./cover.webp']
);
```

### Tweet with Multiple Images

```javascript
await client.post(
    'New manga chapter pages 📖',
    [
        './page-1.webp',
        './page-2.webp',
        './page-3.webp',
        './page-4.webp'
    ]
);
```

### Manga Promotion Example

```javascript
const mangaTitle = 'One Piece';
const mangaUrl = 'https://mangarw.com/manga/onepiece/73';
const tweetText = `New chapter of ${mangaTitle} is now available! 🎉\n\nRead now: ${mangaUrl}`;

await client.post(tweetText, ['./onepiece-cover.webp']);
```

## API Reference

### Constructor

```javascript
new XApiClient(cookie: string, bearerToken: string)
```

- `cookie`: Full cookie string including `ct0=...` for CSRF token
- `bearerToken`: Twitter API bearer token (without "Bearer " prefix)

**Throws:** Error if cookie doesn't contain `ct0`

### Methods

#### `post(text, imagePaths = [])`

Post a tweet with optional images.

**Parameters:**
- `text` (string): Tweet content (280 characters max)
- `imagePaths` (string[]): Array of image paths (0-4 images, optional)

**Returns:** Promise<Object> - Tweet creation response

**Example:**
```javascript
// Text only
await client.post('Hello!');

// With images
await client.post('Check this out!', ['img1.png', 'img2.png']);
```

#### `uploadMedia(imagePath)`

Upload a single image and return media ID.

**Parameters:**
- `imagePath` (string): Path to image file

**Returns:** Promise<string> - Media ID

**Example:**
```javascript
const mediaId = await client.uploadMedia('./cover.webp');
```

#### `createTweet(text, mediaIds = [])`

Create a tweet with text and optional media IDs.

**Parameters:**
- `text` (string): Tweet content
- `mediaIds` (string[]): Array of media IDs (0-4)

**Returns:** Promise<Object> - Tweet creation response

## Implementation Details

### Media Upload Flow

1. **INIT**: Initialize upload with file size and MIME type
   ```
   POST https://upload.x.com/i/media/upload.json?command=INIT&total_bytes=...
   ```

2. **APPEND**: Upload binary data (form-data)
   ```
   POST https://upload.x.com/i/media/upload.json?command=APPEND&media_id=...
   
   ⚠️  IMPORTANT: Must use form-data upload (-F media=@-)
   NOT --data-binary @- which causes "media parameter is missing" error
   ```

3. **FINALIZE**: Complete upload with MD5 validation
   ```
   POST https://upload.x.com/i/media/upload.json?command=FINALIZE&media_id=...&original_md5=...
   ```

4. **CREATE TWEET**: Post tweet with media IDs
   ```
   POST https://x.com/i/api/graphql/QBGSJ27mdJ7KlPN7gm3XuQ/CreateTweet
   ```

### Headers

**Upload Headers:**
- Authorization: Bearer token
- X-Csrf-Token: Extracted from `ct0` cookie
- Cookie: Full cookie string
- X-Twitter-Auth-Type: OAuth2Session
- Referer: https://x.com/

**Tweet Creation Headers:**
- All upload headers +
- X-Twitter-Active-User: yes
- X-Twitter-Client-Language: vi
- Referer: https://x.com/compose/post

### Optimizations

1. **Parallel Uploads**: Multiple images uploaded concurrently
   ```javascript
   const uploadPromises = imagePaths.map(path => this.uploadMedia(path));
   const mediaIds = await Promise.all(uploadPromises);
   ```

2. **Parallel Stream Reading**: stdout/stderr/exitCode read together
   ```javascript
   const [stdout, stderr, exitCode] = await Promise.all([
       Bun.readableStreamToBuffer(proc.stdout),
       Bun.readableStreamToText(proc.stderr),
       proc.exited
   ]);
   ```

3. **MD5 Hash**: Validates file integrity during upload

4. **Edge 101 Impersonation**: Uses `curl_edge101` directly from system PATH for better reliability

## Testing

### Run All Tests

```bash
bun test tests/x-api-client.test.js
```

### Real API Tests

Successfully tested with actual Twitter API:

```bash
# Text-only tweet
✅ Tweet ID: 1978302578665386494
   Status: Posted successfully

# Tweet with image
✅ Tweet ID: 1978303008686387305  
   Image: https://pbs.twimg.com/media/G3RYGPGbUAAQX66.jpg
   Status: Posted successfully
```

### Quick Test with bun -e

```bash
bun -e "
import { XApiClient } from './src/utils/x-api-client.js';

const client = new XApiClient('ct0=test123', 'bearer_token');
console.log('CSRF Token:', client.csrfToken);
"
```

### Test Results

```
✓ All XApiClient tests passed!
✓ 19 pass
✓ 0 fail
✓ 56 expect() calls
```

**Test Coverage:**
- ✅ Client initialization
- ✅ CSRF token extraction
- ✅ Header builder (upload/tweet)
- ✅ URL construction (INIT/APPEND/FINALIZE)
- ✅ Payload builder (with/without media)
- ✅ MD5 hash calculation
- ✅ Error handling

## Examples

Run examples:

```bash
# See all examples
bun examples/x-api-usage.js

# Run specific example
bun examples/x-api-usage.js 1  # Text-only tweet
bun examples/x-api-usage.js 2  # Single image
bun examples/x-api-usage.js 3  # Multiple images
bun examples/x-api-usage.js 4  # Manga promotion
bun examples/x-api-usage.js 5  # Batch tweets
bun examples/x-api-usage.js 6  # Error handling
```

## Environment Variables

```bash
export X_COOKIE="your_cookie_with_ct0=..."
export X_BEARER_TOKEN="your_bearer_token"
```

## Error Handling

```javascript
try {
    await client.post('Hello!', ['image.png']);
} catch (error) {
    if (error.message.includes('Image file not found')) {
        console.error('Image does not exist');
    } else if (error.message.includes('curl_cffi failed')) {
        console.error('Network error:', error.message);
    } else {
        console.error('Unknown error:', error);
    }
}
```

## Performance

- **Single image upload**: ~2-5 seconds
- **Multiple images (4)**: ~4-8 seconds (parallel)
- **Text-only tweet**: ~1-2 seconds
- **Memory**: Efficient buffer handling with Bun

## Security Notes

⚠️ **IMPORTANT:**
- Never commit cookies or bearer tokens to git
- Use environment variables for credentials
- Rotate tokens regularly
- Monitor rate limits (Twitter API limits apply)

## Dependencies

- Bun runtime
- curl_edge101 (curl-impersonate) - must be in system PATH
- Node crypto module

## Installation on macOS

```bash
# Install curl-impersonate via Homebrew
brew install curl-impersonate

# Verify installation
which curl_edge101
curl_edge101 --version
```

## Installation on Linux

```bash
# Download from https://github.com/lwthiker/curl-impersonate
# Or use provided binaries in bin/curl-impersonate/

# For Ubuntu/Debian:
sudo cp bin/curl-impersonate/amd64/* /usr/local/bin/
sudo chmod +x /usr/local/bin/curl_edge101
```

## License

Part of manga-crawler project
