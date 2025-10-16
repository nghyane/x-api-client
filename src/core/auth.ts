import { AuthError } from "../errors";
import type { AuthConfig } from "../types";

const DEFAULT_BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

export class AuthManager {
  readonly cookie: string;
  readonly bearerToken: string;
  readonly csrfToken: string;
  readonly language: string;
  readonly customHeaders: Record<string, string>;
  private fingerprintHook?: () => Promise<string | undefined>;

  constructor(
    cookie: string,
    bearerToken?: string,
    language = "en",
    customHeaders: Record<string, string> = {}
  ) {
    this.csrfToken = this.extractCsrfToken(cookie);
    this.cookie = cookie;
    this.bearerToken = `Bearer ${bearerToken || DEFAULT_BEARER_TOKEN}`;
    this.language = language;
    this.customHeaders = customHeaders;
  }

  setFingerprintHook(hook: () => Promise<string | undefined>): void {
    this.fingerprintHook = hook;
  }

  private extractCsrfToken(cookie: string): string {
    if (!cookie.includes("ct0=")) {
      throw new AuthError(
        "Cookie must contain 'ct0' for CSRF token",
        "MISSING_CSRF",
      );
    }

    const csrfToken = cookie.split("ct0=")[1]?.split(";")[0];

    if (!csrfToken) {
      throw new AuthError(
        "Failed to extract CSRF token from cookie",
        "INVALID_CSRF",
      );
    }

    return csrfToken;
  }

  getConfig(): AuthConfig {
    return {
      cookie: this.cookie,
      bearerToken: this.bearerToken,
      csrfToken: this.csrfToken,
    };
  }

  async buildHeaders(isUpload = false, transactionId?: string, customReferer?: string): Promise<Record<string, string>> {
    if (this.fingerprintHook) {
      const fingerprint = await this.fingerprintHook();
      if (fingerprint) {
        this.customHeaders['x-xp-forwarded-for'] = fingerprint;
      }
    }

    const headers: Record<string, string> = {
      accept: "*/*",
      "accept-language": `${this.language},en;q=0.9,en-US;q=0.8`,
      Authorization: this.bearerToken,
      "cache-control": "no-cache",
      Cookie: this.cookie,
      Origin: "https://x.com",
      pragma: "no-cache",
      priority: "u=1, i",
      Referer: customReferer || (isUpload ? "https://x.com/" : "https://x.com/compose/post"),
      "sec-ch-ua": '"Microsoft Edge";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
      "X-Csrf-Token": this.csrfToken,
      "X-Twitter-Auth-Type": "OAuth2Session",
    };

    if (!isUpload) {
      headers["X-Twitter-Active-User"] = "yes";
      headers["X-Twitter-Client-Language"] = this.language;
      if (transactionId) {
        headers["X-Client-Transaction-Id"] = transactionId;
      }
    }

    return { ...headers, ...this.customHeaders };
  }
}
