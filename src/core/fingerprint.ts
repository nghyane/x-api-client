export class XPFFHeaderGenerator {
  private baseKey: string;

  constructor(baseKey: string) {
    this.baseKey = baseKey;
  }

  private async deriveXpffKey(guestId: string): Promise<CryptoKey> {
    const combined = this.baseKey + guestId;
    
    // SHA256 hash using Bun
    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(combined);
    const keyData = hasher.digest();

    // Import key for AES-GCM
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async generateXpff(plaintext: string, guestId: string): Promise<string> {
    const key = await this.deriveXpffKey(guestId);
    
    // Generate 12-byte nonce
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt with AES-GCM
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: 128 },
      key,
      new TextEncoder().encode(plaintext)
    );

    // Combine: nonce (12) + ciphertext + tag (16)
    const combined = new Uint8Array(12 + ciphertext.byteLength);
    combined.set(nonce, 0);
    combined.set(new Uint8Array(ciphertext), 12);

    // Convert to hex
    return Array.from(combined)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async decodeXpff(hexString: string, guestId: string): Promise<string> {
    const key = await this.deriveXpffKey(guestId);
    
    // Convert hex to bytes
    const raw = new Uint8Array(
      hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    // Extract components
    const nonce = raw.slice(0, 12);
    const ciphertext = raw.slice(12);

    // Decrypt with AES-GCM (tag is included in ciphertext)
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: 128 },
      key,
      ciphertext
    );

    return new TextDecoder().decode(plaintext);
  }

  // Helper: Extract guest_id from cookie
  static extractGuestId(cookie: string): string {
    const match = cookie.match(/guest_id=([^;]+)/);
    if (!match?.[1]) {
      throw new Error('guest_id not found in cookie');
    }
    return decodeURIComponent(match[1]);
  }
}
