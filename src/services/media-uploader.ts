import { MediaUploadError } from '../errors';
import type { AuthManager } from '../core/auth';
import type { HttpClient } from '../core/http-client';
import type { MediaUploadInitResponse, MediaUploadFinalizeResponse } from '../types';

const UPLOAD_ENDPOINT = 'https://upload.x.com/i/media/upload.json';

export class MediaUploader {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthManager
  ) {}

  async upload(imagePath: string): Promise<string> {
    const imageFile = Bun.file(imagePath);

    if (!(await imageFile.exists())) {
      throw new MediaUploadError(`Image not found: ${imagePath}`, 'FILE_NOT_FOUND');
    }

    const mediaData = Buffer.from(await imageFile.arrayBuffer());
    const md5Hash = new Bun.CryptoHasher('md5').update(mediaData).digest('hex');

    const mediaId = await this.init(mediaData.length, imageFile.type);
    await this.append(mediaId, mediaData);
    await this.finalize(mediaId, md5Hash);

    return mediaId;
  }

  private async init(totalBytes: number, mediaType: string): Promise<string> {
    const url = `${UPLOAD_ENDPOINT}?${new URLSearchParams({
      command: 'INIT',
      total_bytes: totalBytes.toString(),
      media_type: mediaType,
      enable_1080p_variant: 'true',
      media_category: 'tweet_image',
    })}`;

    const headers = await this.auth.buildHeaders(true);
    const args = [...this.http.buildCurlArgs(headers), '-X', 'POST', url];
    const output = await this.http.execute(args);
    const response = this.http.parseJson<MediaUploadInitResponse>(output);

    if (!response.media_id_string) {
      throw new MediaUploadError('INIT failed: No media_id_string', 'INIT_FAILED');
    }

    return response.media_id_string;
  }

  private async append(mediaId: string, mediaData: Buffer): Promise<void> {
    const url = `${UPLOAD_ENDPOINT}?${new URLSearchParams({
      command: 'APPEND',
      media_id: mediaId,
      segment_index: '0',
    })}`;

    const headers = await this.auth.buildHeaders(true);
    const args = [...this.http.buildCurlArgs(headers), '-F', 'media=@-', url];

    await this.http.execute(args, mediaData);
  }

  private async finalize(mediaId: string, md5Hash: string): Promise<MediaUploadFinalizeResponse> {
    const url = `${UPLOAD_ENDPOINT}?${new URLSearchParams({
      command: 'FINALIZE',
      media_id: mediaId,
      original_md5: md5Hash,
    })}`;

    const headers = await this.auth.buildHeaders(true);
    const args = [...this.http.buildCurlArgs(headers), '-X', 'POST', url];
    const output = await this.http.execute(args);
    const response = this.http.parseJson<MediaUploadFinalizeResponse>(output);

    if (response.processing_info?.state && response.processing_info.state !== 'succeeded') {
      await Bun.sleep(5000);
    }

    return response;
  }
}
