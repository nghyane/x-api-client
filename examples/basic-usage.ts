import { XApiClient } from '../src/index';

const COOKIE = process.env.X_COOKIE || '__cuid=xxx; ct0=your_csrf_token_here';
const BEARER_TOKEN = process.env.X_BEARER_TOKEN || 'your_bearer_token_here';

async function example1_textOnly() {
    console.log('\n📝 Example 1: Tweet text-only\n');
    
    const client = new XApiClient(COOKIE, BEARER_TOKEN);
    
    try {
        await client.post('Hello from XApiClient! 🚀');
        console.log('✓ Tweet posted successfully!');
    } catch (error) {
        console.error('✗ Error:', (error as Error).message);
    }
}

async function example2_singleImage() {
    console.log('\n🖼️  Example 2: Tweet with single image\n');
    
    const client = new XApiClient(COOKIE, BEARER_TOKEN);
    
    try {
        await client.post(
            'Check out this manga chapter! 📚',
            ['./cover.webp']
        );
        console.log('✓ Tweet with image posted successfully!');
    } catch (error) {
        console.error('✗ Error:', (error as Error).message);
    }
}

async function example3_multipleImages() {
    console.log('\n🖼️🖼️🖼️  Example 3: Tweet with multiple images (up to 4)\n');
    
    const client = new XApiClient(COOKIE, BEARER_TOKEN);
    
    try {
        await client.post(
            'New manga chapter pages 📖',
            [
                './page-1.webp',
                './page-2.webp',
                './page-3.webp',
                './page-4.webp'
            ]
        );
        console.log('✓ Tweet with 4 images posted successfully!');
    } catch (error) {
        console.error('✗ Error:', (error as Error).message);
    }
}

async function example4_mangaPromotion() {
    console.log('\n📚 Example 4: Manga promotion with cover\n');
    
    const client = new XApiClient(COOKIE, BEARER_TOKEN);
    
    const mangaTitle = 'One Piece';
    const mangaUrl = 'https://mangarw.com/manga/onepiece/73';
    const tweetText = `New chapter of ${mangaTitle} is now available! 🎉\n\nRead now: ${mangaUrl}`;
    
    try {
        await client.post(tweetText, ['./onepiece-cover.webp']);
        console.log('✓ Manga promotion posted successfully!');
    } catch (error) {
        console.error('✗ Error:', (error as Error).message);
    }
}

interface TweetConfig {
    text: string;
    images?: string[];
}

async function example5_batchTweets() {
    console.log('\n⚡ Example 5: Batch tweets (sequential)\n');
    
    const client = new XApiClient(COOKIE, BEARER_TOKEN);
    
    const tweets: TweetConfig[] = [
        { text: 'Tweet 1: Text only' },
        { text: 'Tweet 2: With image', images: ['./img1.webp'] },
        { text: 'Tweet 3: Multiple images', images: ['./img2.webp', './img3.webp'] }
    ];
    
    for (let i = 0; i < tweets.length; i++) {
        const tweet = tweets[i];
        if (!tweet) continue;
        
        const { text, images = [] } = tweet;
        
        try {
            console.log(`\nPosting tweet ${i + 1}/${tweets.length}...`);
            await client.post(text, images);
            console.log(`✓ Tweet ${i + 1} posted`);
            
            if (i < tweets.length - 1) {
                console.log('Waiting 5 seconds before next tweet...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        } catch (error) {
            console.error(`✗ Tweet ${i + 1} failed:`, (error as Error).message);
        }
    }
}

async function example6_errorHandling() {
    console.log('\n⚠️  Example 6: Error handling\n');
    
    const client = new XApiClient(COOKIE, BEARER_TOKEN);
    
    try {
        await client.post('Tweet with non-existent image', ['./fake-image.png']);
    } catch (error) {
        console.log('✓ Error caught correctly:', (error as Error).message);
    }
    
    try {
        new XApiClient('invalid_cookie', BEARER_TOKEN);
    } catch (error) {
        console.log('✓ Initialization error caught:', (error as Error).message);
    }
}

console.log('🚀 XApiClient Usage Examples');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\nℹ️  Set environment variables:');
console.log('  export X_COOKIE="your_cookie_with_ct0"');
console.log('  export X_BEARER_TOKEN="your_bearer_token"');
console.log('\n⚠️  Note: These examples are for demonstration only.');
console.log('  Replace with your actual credentials to test.\n');

const exampleNum = process.argv[2];

if (exampleNum) {
    switch (exampleNum) {
        case '1': await example1_textOnly(); break;
        case '2': await example2_singleImage(); break;
        case '3': await example3_multipleImages(); break;
        case '4': await example4_mangaPromotion(); break;
        case '5': await example5_batchTweets(); break;
        case '6': await example6_errorHandling(); break;
        default:
            console.log('Usage: bun examples/basic-usage.ts [1-6]');
            console.log('\nAvailable examples:');
            console.log('  1: Text-only tweet');
            console.log('  2: Tweet with single image');
            console.log('  3: Tweet with multiple images');
            console.log('  4: Manga promotion with cover');
            console.log('  5: Batch tweets (sequential)');
            console.log('  6: Error handling');
    }
} else {
    console.log('Usage: bun examples/basic-usage.ts [1-6]');
    console.log('\nAvailable examples:');
    console.log('  1: Text-only tweet');
    console.log('  2: Tweet with single image');
    console.log('  3: Tweet with multiple images');
    console.log('  4: Manga promotion with cover');
    console.log('  5: Batch tweets (sequential)');
    console.log('  6: Error handling');
}
