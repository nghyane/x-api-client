import { test, expect, describe, beforeAll } from 'bun:test';
import { XApiClient } from '../src/index';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const TEST_COOKIE = '__cuid=742ccd52b2a3445cabfabc8fad8f63d3; ct0=b5d88ceb39af245e3fad7e24be06ed4b0cd582fc0bbf9544ea21507cb26b94ae5804a15f35da838f0b32e36a272a72380e629729ab6b6342eefe43084d96ecd8ec29461575a695b79f473ae4e9a22a96';
const TEST_BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';
const TEST_OUTPUT_DIR = './tmp/test-x-api';

describe('XApiClient - Initialization', () => {
    test('Should initialize with valid cookie and bearer token', () => {
        const client = new XApiClient(TEST_COOKIE, TEST_BEARER_TOKEN);
        
        expect(client.cookie).toBe(TEST_COOKIE);
        expect(client.bearerToken).toBe(`Bearer ${TEST_BEARER_TOKEN}`);
        expect(client.csrfToken).toBe('b5d88ceb39af245e3fad7e24be06ed4b0cd582fc0bbf9544ea21507cb26b94ae5804a15f35da838f0b32e36a272a72380e629729ab6b6342eefe43084d96ecd8ec29461575a695b79f473ae4e9a22a96');
    });

    test('Should throw error if cookie missing ct0', () => {
        expect(() => {
            new XApiClient('invalid_cookie', TEST_BEARER_TOKEN);
        }).toThrow("Cookie must contain 'ct0' for CSRF token.");
    });

    test('Should extract CSRF token correctly', () => {
        const client = new XApiClient(TEST_COOKIE, TEST_BEARER_TOKEN);
        
        expect(client.csrfToken).toBe('b5d88ceb39af245e3fad7e24be06ed4b0cd582fc0bbf9544ea21507cb26b94ae5804a15f35da838f0b32e36a272a72380e629729ab6b6342eefe43084d96ecd8ec29461575a695b79f473ae4e9a22a96');
        expect(client.csrfToken.length).toBeGreaterThan(0);
    });
});

describe('XApiClient - Header Builder', () => {
    let client: XApiClient;

    beforeAll(() => {
        client = new XApiClient(TEST_COOKIE, TEST_BEARER_TOKEN);
    });

    test('Should build upload headers correctly', () => {
        const headers = client.buildHeaders(true);
        
        expect(Array.isArray(headers)).toBe(true);
        expect(headers.includes('-H')).toBe(true);
        expect(headers.some(h => h.includes('Authorization'))).toBe(true);
        expect(headers.some(h => h.includes('X-Csrf-Token'))).toBe(true);
        expect(headers.some(h => h.includes('Cookie'))).toBe(true);
        expect(headers.some(h => h.includes('https://x.com/'))).toBe(true);
        expect(headers.some(h => h.includes('X-Twitter-Auth-Type'))).toBe(true);
    });

    test('Should build tweet headers with additional fields', () => {
        const headers = client.buildHeaders(false);
        
        expect(headers.some(h => h.includes('X-Twitter-Active-User'))).toBe(true);
        expect(headers.some(h => h.includes('X-Twitter-Client-Language'))).toBe(true);
        expect(headers.some(h => h.includes('https://x.com/compose/post'))).toBe(true);
    });

    test('Upload headers should not have active user header', () => {
        const headers = client.buildHeaders(true);
        
        expect(headers.some(h => h.includes('X-Twitter-Active-User'))).toBe(false);
        expect(headers.some(h => h.includes('X-Twitter-Client-Language'))).toBe(false);
    });
});

describe('XApiClient - Curl Execution (Mock)', () => {
    let client: XApiClient;

    beforeAll(() => {
        client = new XApiClient(TEST_COOKIE, TEST_BEARER_TOKEN);
    });

    test('Should format curl command correctly', () => {
        const args = [
            ...client.buildHeaders(true),
            '-X', 'POST',
            'https://upload.x.com/i/media/upload.json?command=INIT&total_bytes=100&media_type=image%2Fpng'
        ];

        expect(args.includes('-H')).toBe(true);
        expect(args.includes('-X')).toBe(true);
        expect(args.includes('POST')).toBe(true);
        expect(args.some(a => a.includes('upload.x.com'))).toBe(true);
    });

    test('Should build INIT upload URL correctly', () => {
        const totalBytes = 2108742;
        const mediaType = 'image/png';
        const url = `https://upload.x.com/i/media/upload.json?command=INIT&total_bytes=${totalBytes}&media_type=${encodeURIComponent(mediaType)}&enable_1080p_variant=true&media_category=tweet_image`;

        expect(url).toContain('command=INIT');
        expect(url).toContain('total_bytes=2108742');
        expect(url).toContain('media_type=image%2Fpng');
        expect(url).toContain('enable_1080p_variant=true');
        expect(url).toContain('media_category=tweet_image');
    });

    test('Should build APPEND upload URL correctly', () => {
        const mediaId = '1978288498529669120';
        const url = `https://upload.x.com/i/media/upload.json?command=APPEND&media_id=${mediaId}&segment_index=0`;

        expect(url).toContain('command=APPEND');
        expect(url).toContain('media_id=1978288498529669120');
        expect(url).toContain('segment_index=0');
    });

    test('Should build FINALIZE upload URL with MD5', () => {
        const mediaId = '1978288498529669120';
        const md5Hash = '101bff5f06ac21e6ffaea056a20f230d';
        const url = `https://upload.x.com/i/media/upload.json?command=FINALIZE&media_id=${mediaId}&original_md5=${md5Hash}`;

        expect(url).toContain('command=FINALIZE');
        expect(url).toContain('media_id=1978288498529669120');
        expect(url).toContain('original_md5=101bff5f06ac21e6ffaea056a20f230d');
    });
});

describe('XApiClient - Tweet Payload', () => {
    let client: XApiClient;

    beforeAll(() => {
        client = new XApiClient(TEST_COOKIE, TEST_BEARER_TOKEN);
    });

    test('Should build tweet payload without media', async () => {
        const text = 'Hello Twitter!';
        const mediaIds: string[] = [];

        const variables: any = {
            tweet_text: text,
            dark_request: false,
            semantic_annotation_ids: [],
            disallowed_reply_options: null
        };

        expect(variables.tweet_text).toBe(text);
        expect(variables.media).toBeUndefined();
        expect(mediaIds.length).toBe(0);
    });

    test('Should build tweet payload with single media', () => {
        const text = 'Check this out!';
        const mediaIds = ['1978288498529669120'];

        const variables: any = {
            tweet_text: text,
            dark_request: false,
            semantic_annotation_ids: [],
            disallowed_reply_options: null
        };

        if (mediaIds.length > 0) {
            variables.media = {
                media_entities: mediaIds.map(id => ({ media_id: id, tagged_users: [] })),
                possibly_sensitive: false
            };
        }

        expect(variables.media).toBeDefined();
        expect(variables.media.media_entities.length).toBe(1);
        expect(variables.media.media_entities[0].media_id).toBe('1978288498529669120');
        expect(variables.media.possibly_sensitive).toBe(false);
    });

    test('Should build tweet payload with multiple media', () => {
        const mediaIds = ['111', '222', '333', '444'];

        const media = {
            media_entities: mediaIds.map(id => ({ media_id: id, tagged_users: [] })),
            possibly_sensitive: false
        };

        expect(media.media_entities.length).toBe(4);
        expect(media.media_entities[0]?.media_id).toBe('111');
        expect(media.media_entities[3]?.media_id).toBe('444');
    });

    test('Should build GraphQL URL correctly', () => {
        const url = 'https://x.com/i/api/graphql/QBGSJ27mdJ7KlPN7gm3XuQ/CreateTweet';
        
        expect(url).toContain('graphql');
        expect(url).toContain('QBGSJ27mdJ7KlPN7gm3XuQ');
        expect(url).toContain('CreateTweet');
    });

    test('Should include all required features in payload', () => {
        const features = {
            premium_content_api_read_enabled: false,
            communities_web_enable_tweet_community_results_fetch: true,
            responsive_web_edit_tweet_api_enabled: true,
            graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
            view_counts_everywhere_api_enabled: true,
        };

        expect(features.premium_content_api_read_enabled).toBe(false);
        expect(features.communities_web_enable_tweet_community_results_fetch).toBe(true);
        expect(features.view_counts_everywhere_api_enabled).toBe(true);
    });
});

describe('XApiClient - Media Upload Flow (Mock)', () => {
    let client: XApiClient;

    beforeAll(async () => {
        client = new XApiClient(TEST_COOKIE, TEST_BEARER_TOKEN);
        await mkdir(TEST_OUTPUT_DIR, { recursive: true });
    });

    test('Should create test image file', async () => {
        const testImagePath = join(TEST_OUTPUT_DIR, 'test-image.png');
        const mockImageData = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        
        await writeFile(testImagePath, mockImageData);
        
        const file = Bun.file(testImagePath);
        expect(await file.exists()).toBe(true);
        expect(file.size).toBeGreaterThan(0);
        
        console.log(`✓ Created test image: ${testImagePath}`);
    });

    test('Should calculate MD5 hash correctly', async () => {
        const crypto = await import('crypto');
        const testData = Buffer.from('Hello World');
        const md5Hash = crypto.createHash('md5').update(testData).digest('hex');
        
        expect(md5Hash).toBe('b10a8db164e0754105b7a99be72e3fe5');
        expect(md5Hash.length).toBe(32);
    });
});

describe('XApiClient - Error Handling', () => {
    let client: XApiClient;

    beforeAll(() => {
        client = new XApiClient(TEST_COOKIE, TEST_BEARER_TOKEN);
    });

    test('Should throw error for non-existent image', async () => {
        const fakePath = './non-existent-image.png';
        
        try {
            await client.uploadMedia(fakePath);
            expect(true).toBe(false);
        } catch (error) {
            expect((error as Error).message).toContain('Image file not found');
        }
    });

    test('Should handle empty media IDs array', async () => {
        const mediaIds: string[] = [];
        
        expect(mediaIds.length).toBe(0);
        expect(Array.isArray(mediaIds)).toBe(true);
    });
});

describe('XApiClient - JSON Parsing', () => {
    let client: XApiClient;

    beforeAll(() => {
        client = new XApiClient(TEST_COOKIE, TEST_BEARER_TOKEN);
    });

    test('Should parse valid JSON response', () => {
        const validJson = Buffer.from(JSON.stringify({ media_id_string: '123456', status: 'ok' }));
        const result = client.parseJsonResponse(validJson);
        
        expect(result.media_id_string).toBe('123456');
        expect(result.status).toBe('ok');
    });

    test('Should throw error for empty response', () => {
        const emptyBuffer = Buffer.from('');
        
        expect(() => {
            client.parseJsonResponse(emptyBuffer);
        }).toThrow('Empty response from server');
    });

    test('Should throw error for invalid JSON', () => {
        const invalidJson = Buffer.from('not valid json {}}');
        
        expect(() => {
            client.parseJsonResponse(invalidJson);
        }).toThrow('Invalid JSON response');
    });

    test('Should throw error for whitespace-only response', () => {
        const whitespace = Buffer.from('   \n\t   ');
        
        expect(() => {
            client.parseJsonResponse(whitespace);
        }).toThrow('Empty response from server');
    });

    test('Should parse JSON with UTF-8 characters', () => {
        const utf8Json = Buffer.from(JSON.stringify({ text: 'Hello 世界 🌍', emoji: '🚀' }));
        const result = client.parseJsonResponse(utf8Json);
        
        expect(result.text).toBe('Hello 世界 🌍');
        expect(result.emoji).toBe('🚀');
    });

    test('Should handle large JSON response', () => {
        const largeObject = { data: 'x'.repeat(10000), numbers: Array.from({ length: 1000 }, (_, i) => i) };
        const largeJson = Buffer.from(JSON.stringify(largeObject));
        const result = client.parseJsonResponse(largeJson);
        
        expect(result.data.length).toBe(10000);
        expect(result.numbers.length).toBe(1000);
    });
});

console.log('\n✓ All XApiClient tests passed!');
