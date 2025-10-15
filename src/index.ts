import crypto from 'crypto';

export interface MediaUploadInitResponse {
    media_id_string: string;
    media_id: number;
    expires_after_secs: number;
}

export interface MediaUploadFinalizeResponse {
    media_id_string: string;
    media_id: number;
    size: number;
    expires_after_secs: number;
    processing_info?: {
        state: 'pending' | 'in_progress' | 'failed' | 'succeeded';
        check_after_secs?: number;
        progress_percent?: number;
    };
}

export interface TweetError {
    message: string;
    code: number;
}

export interface TweetResponse {
    data?: {
        create_tweet?: {
            tweet_results?: {
                result?: {
                    rest_id?: string;
                    legacy?: {
                        full_text?: string;
                    };
                };
            };
        };
    };
    errors?: TweetError[];
}

export interface XApiClientConfig {
    cookie: string;
    bearerToken: string;
}

export class XApiClient {
    readonly cookie: string;
    readonly bearerToken: string;
    readonly csrfToken: string;

    constructor(cookie: string, bearerToken: string) {
        if (!cookie.includes('ct0=')) {
            throw new Error("Cookie must contain 'ct0' for CSRF token.");
        }
        const csrfParts = cookie.split('ct0=');
        if (csrfParts.length < 2 || !csrfParts[1]) {
            throw new Error("Failed to extract CSRF token from cookie.");
        }
        const csrfToken = csrfParts[1].split(';')[0];
        if (!csrfToken) {
            throw new Error("CSRF token is empty.");
        }
        
        this.cookie = cookie;
        this.bearerToken = `Bearer ${bearerToken}`;
        this.csrfToken = csrfToken;
    }

    async executeCurl(args: string[], body?: string | Buffer): Promise<Buffer> {
        const cmd = ['curl_edge101', '-s', ...args];

        const proc = Bun.spawn(cmd, {
            stdin: 'pipe',
            stdout: 'pipe',
            stderr: 'pipe',
        });

        if (body) {
            proc.stdin.write(body);
        }
        proc.stdin.end();

        const [stdout, stderr, exitCode] = await Promise.all([
            proc.stdout.bytes(),
            proc.stderr.text(),
            proc.exited
        ]);

        if (exitCode !== 0) {
            const errorMessage = stderr.trim() || `Unknown error (exit code ${exitCode})`;
            throw new Error(`curl_edge101 failed: ${errorMessage}`);
        }
        
        return Buffer.from(stdout);
    }

    parseJsonResponse<T = any>(buffer: Buffer): T {
        try {
            const text = buffer.toString('utf-8');
            if (!text || text.trim().length === 0) {
                throw new Error('Empty response from server');
            }
            return JSON.parse(text);
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Invalid JSON response: ${error.message}`);
            }
            throw error;
        }
    }

    buildHeaders(isUpload: boolean = false): string[] {
        const headers: Record<string, string> = {
            'Authorization': this.bearerToken,
            'X-Csrf-Token': this.csrfToken,
            'Cookie': this.cookie,
            'Origin': 'https://x.com',
            'Referer': isUpload ? 'https://x.com/' : 'https://x.com/compose/post',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
            'X-Twitter-Auth-Type': 'OAuth2Session',
        };

        if (!isUpload) {
            headers['X-Twitter-Active-User'] = 'yes';
            headers['X-Twitter-Client-Language'] = 'vi';
        }

        return Object.entries(headers).flatMap(([key, value]) => ['-H', `${key}: ${value}`]);
    }
    
    async uploadMedia(imagePath: string): Promise<string> {
        const imageFile = Bun.file(imagePath);
        if (!await imageFile.exists()) {
            throw new Error(`Image file not found: ${imagePath}`);
        }

        const mediaData = Buffer.from(await imageFile.arrayBuffer());
        const totalBytes = mediaData.length;
        const mediaType = imageFile.type;
        const md5Hash = crypto.createHash('md5').update(mediaData).digest('hex');

        const mediaId = await this.initMediaUpload(totalBytes, mediaType);
        await this.appendMedia(mediaId, mediaData);
        await this.finalizeMediaUpload(mediaId, md5Hash);
        
        return mediaId;
    }

    async initMediaUpload(totalBytes: number, mediaType: string): Promise<string> {
        const url = `https://upload.x.com/i/media/upload.json?command=INIT&total_bytes=${totalBytes}&media_type=${encodeURIComponent(mediaType)}&enable_1080p_variant=true&media_category=tweet_image`;
        
        const args = [...this.buildHeaders(true), '-X', 'POST', url];
        const output = await this.executeCurl(args);
        const response = this.parseJsonResponse<MediaUploadInitResponse>(output);
        
        if (!response.media_id_string) {
            throw new Error('INIT failed: No media_id_string in response');
        }
        
        return response.media_id_string;
    }

    async appendMedia(mediaId: string, mediaData: Buffer): Promise<void> {
        const url = `https://upload.x.com/i/media/upload.json?command=APPEND&media_id=${mediaId}&segment_index=0`;
        const args = [
            ...this.buildHeaders(true),
            '-F', 'media=@-',
            url
        ];
        await this.executeCurl(args, mediaData);
    }
    
    async finalizeMediaUpload(mediaId: string, md5Hash: string): Promise<MediaUploadFinalizeResponse> {
        const url = `https://upload.x.com/i/media/upload.json?command=FINALIZE&media_id=${mediaId}&original_md5=${md5Hash}`;
        const args = [...this.buildHeaders(true), '-X', 'POST', url];
        const output = await this.executeCurl(args);
        const response = this.parseJsonResponse<MediaUploadFinalizeResponse>(output);
        
        if (response.processing_info?.state && response.processing_info.state !== 'succeeded') {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        return response;
    }

    async createTweet(text: string, mediaIds: string[] = []): Promise<TweetResponse> {
        const url = 'https://x.com/i/api/graphql/QBGSJ27mdJ7KlPN7gm3XuQ/CreateTweet';
        
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

        const payload = {
            variables,
            features: {
                premium_content_api_read_enabled: false,
                communities_web_enable_tweet_community_results_fetch: true,
                c9s_tweet_anatomy_moderator_badge_enabled: true,
                responsive_web_grok_analyze_button_fetch_trends_enabled: false,
                responsive_web_grok_analyze_post_followups_enabled: true,
                responsive_web_jetfuel_frame: true,
                responsive_web_grok_share_attachment_enabled: true,
                responsive_web_edit_tweet_api_enabled: true,
                graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
                view_counts_everywhere_api_enabled: true,
                longform_notetweets_consumption_enabled: true,
                responsive_web_twitter_article_tweet_consumption_enabled: true,
                tweet_awards_web_tipping_enabled: false,
                responsive_web_grok_show_grok_translated_post: false,
                responsive_web_grok_analysis_button_from_backend: true,
                creator_subscriptions_quote_tweet_preview_enabled: false,
                longform_notetweets_rich_text_read_enabled: true,
                longform_notetweets_inline_media_enabled: true,
                payments_enabled: false,
                profile_label_improvements_pcf_label_in_post_enabled: true,
                responsive_web_profile_redirect_enabled: false,
                rweb_tipjar_consumption_enabled: true,
                verified_phone_label_enabled: false,
                articles_preview_enabled: true,
                responsive_web_grok_community_note_auto_translation_is_enabled: false,
                responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
                freedom_of_speech_not_reach_fetch_enabled: true,
                standardized_nudges_misinfo: true,
                tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
                responsive_web_grok_image_annotation_enabled: true,
                responsive_web_grok_imagine_annotation_enabled: true,
                responsive_web_graphql_timeline_navigation_enabled: true,
                responsive_web_enhance_cards_enabled: false
            },
            queryId: 'QBGSJ27mdJ7KlPN7gm3XuQ'
        };
        
        const args = [
            ...this.buildHeaders(false),
            '-H', 'Content-Type: application/json',
            '--data-binary', '@-',
            url
        ];

        const output = await this.executeCurl(args, JSON.stringify(payload));
        const response = this.parseJsonResponse<TweetResponse>(output);
        
        if (response.errors) {
            const errorMsg = response.errors.map(e => e.message).join(', ');
            throw new Error(`Twitter API error: ${errorMsg}`);
        }
        
        return response;
    }

    async post(text: string, imagePaths: string[] = []): Promise<TweetResponse> {
        try {
            const mediaIds: string[] = [];
            
            if (imagePaths.length > 0) {
                console.log(`Uploading ${imagePaths.length} image(s)...`);
                const uploadPromises = imagePaths.slice(0, 4).map(path => this.uploadMedia(path));
                const ids = await Promise.all(uploadPromises);
                mediaIds.push(...ids);
                console.log(`✓ Uploaded ${mediaIds.length} image(s)`);
            }

            console.log('Creating tweet...');
            const result = await this.createTweet(text, mediaIds);
            console.log('✓ Tweet posted successfully!');
            
            return result;
        } catch (error) {
            console.error('Error posting tweet:', error);
            throw error;
        }
    }
}
