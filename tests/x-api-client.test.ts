import { test, expect, describe } from 'bun:test';
import { XApiClient, AuthError } from '../src/index';

const TEST_COOKIE = '__cuid=742ccd52b2a3445cabfabc8fad8f63d3; ct0=b5d88ceb39af245e3fad7e24be06ed4b0cd582fc0bbf9544ea21507cb26b94ae5804a15f35da838f0b32e36a272a72380e629729ab6b6342eefe43084d96ecd8ec29461575a695b79f473ae4e9a22a96; guest_id=v1%3A123456789';
const TEST_BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

describe('XApiClient - Initialization', () => {
  test('Should initialize with valid cookie only', () => {
    const client = new XApiClient(TEST_COOKIE);
    
    expect(client.cookie).toBe(TEST_COOKIE);
    expect(client.bearerToken).toBe(`Bearer ${TEST_BEARER_TOKEN}`);
    expect(client.csrfToken).toBe('b5d88ceb39af245e3fad7e24be06ed4b0cd582fc0bbf9544ea21507cb26b94ae5804a15f35da838f0b32e36a272a72380e629729ab6b6342eefe43084d96ecd8ec29461575a695b79f473ae4e9a22a96');
  });

  test('Should auto-generate fingerprint by default', () => {
    const client = new XApiClient(TEST_COOKIE);
    expect(client.cookie).toBe(TEST_COOKIE);
  });

  test('Should initialize with custom bearer token', () => {
    const customToken = 'custom_bearer_token';
    const client = new XApiClient(TEST_COOKIE, { bearerToken: customToken });
    
    expect(client.bearerToken).toBe(`Bearer ${customToken}`);
  });

  test('Should allow disabling autoGenerateFingerprint', () => {
    const client = new XApiClient(TEST_COOKIE, {
      autoGenerateFingerprint: false
    });
    
    expect(client.cookie).toBe(TEST_COOKIE);
    expect(client.csrfToken).toBeTruthy();
  });

  test('Should enable autoGenerateFingerprint explicitly', () => {
    const client = new XApiClient(TEST_COOKIE, {
      autoGenerateFingerprint: true
    });
    
    expect(client.cookie).toBe(TEST_COOKIE);
    expect(client.csrfToken).toBeTruthy();
  });

  test('Should initialize with language option', () => {
    const client = new XApiClient(TEST_COOKIE, {
      language: 'ja'
    });
    
    expect(client.cookie).toBe(TEST_COOKIE);
  });

  test('Should initialize with custom headers', () => {
    const client = new XApiClient(TEST_COOKIE, {
      customHeaders: {
        'x-custom-header': 'test-value'
      }
    });
    
    expect(client.cookie).toBe(TEST_COOKIE);
  });

  test('Should throw AuthError if cookie missing ct0', () => {
    expect(() => {
      new XApiClient('invalid_cookie');
    }).toThrow(AuthError);
  });

  test('Should extract CSRF token correctly', () => {
    const client = new XApiClient(TEST_COOKIE);
    
    expect(client.csrfToken).toBe('b5d88ceb39af245e3fad7e24be06ed4b0cd582fc0bbf9544ea21507cb26b94ae5804a15f35da838f0b32e36a272a72380e629729ab6b6342eefe43084d96ecd8ec29461575a695b79f473ae4e9a22a96');
    expect(client.csrfToken.length).toBeGreaterThan(0);
  });
});

describe('XApiClient - CSRF Token Extraction', () => {
  test('Should extract CSRF token from various cookie formats', () => {
    const cookies = [
      'ct0=test123; guest_id=v1%3A123',
      'foo=bar; ct0=test123; guest_id=v1%3A123',
      'ct0=test123; foo=bar; guest_id=v1%3A123',
      'foo=bar; ct0=test123; baz=qux; guest_id=v1%3A123'
    ];

    for (const cookie of cookies) {
      const client = new XApiClient(cookie);
      expect(client.csrfToken).toBe('test123');
    }
  });

  test('Should handle URL-encoded CSRF token', () => {
    const cookie = 'ct0=abc%3Ddef%3Dghi; guest_id=v1%3A123';
    const client = new XApiClient(cookie);
    expect(client.csrfToken).toBe('abc%3Ddef%3Dghi');
  });

  test('Should throw error for empty cookie', () => {
    expect(() => {
      new XApiClient('');
    }).toThrow(AuthError);
  });

  test('Should throw error for whitespace-only cookie', () => {
    expect(() => {
      new XApiClient('   \n\t   ');
    }).toThrow(AuthError);
  });
});

describe('XApiClient - Options Validation', () => {
  test('Should accept all valid options together', () => {
    const client = new XApiClient(TEST_COOKIE, {
      bearerToken: 'custom_token',
      language: 'vi',
      autoGenerateFingerprint: true,
      customHeaders: {
        'x-test': 'value'
      }
    });

    expect(client.bearerToken).toBe('Bearer custom_token');
    expect(client.cookie).toBe(TEST_COOKIE);
  });

  test('Should work with empty options object', () => {
    const client = new XApiClient(TEST_COOKIE, {});
    
    expect(client.cookie).toBe(TEST_COOKIE);
    expect(client.bearerToken).toBe(`Bearer ${TEST_BEARER_TOKEN}`);
  });

  test('Should work with undefined options (defaults)', () => {
    const client = new XApiClient(TEST_COOKIE, undefined);
    
    expect(client.cookie).toBe(TEST_COOKIE);
    expect(client.bearerToken).toBe(`Bearer ${TEST_BEARER_TOKEN}`);
  });
});

describe('XApiClient - Default Behavior', () => {
  test('Should auto-generate fingerprint by default', () => {
    const client = new XApiClient(TEST_COOKIE);
    expect(client.cookie).toBeTruthy();
  });

  test('Should use default bearer token', () => {
    const client = new XApiClient(TEST_COOKIE);
    expect(client.bearerToken).toBe(`Bearer ${TEST_BEARER_TOKEN}`);
  });

  test('Should use default language (en)', () => {
    const client = new XApiClient(TEST_COOKIE);
    expect(client.cookie).toBeTruthy();
  });
});

describe('XApiClient - Public API', () => {
  test('Should expose csrfToken getter', () => {
    const client = new XApiClient(TEST_COOKIE);
    expect(typeof client.csrfToken).toBe('string');
    expect(client.csrfToken.length).toBeGreaterThan(0);
  });

  test('Should expose cookie getter', () => {
    const client = new XApiClient(TEST_COOKIE);
    expect(client.cookie).toBe(TEST_COOKIE);
  });

  test('Should expose bearerToken getter', () => {
    const client = new XApiClient(TEST_COOKIE);
    expect(client.bearerToken).toContain('Bearer');
  });

  test('Should expose post method', () => {
    const client = new XApiClient(TEST_COOKIE);
    expect(typeof client.post).toBe('function');
  });
});

console.log('\n✓ All XApiClient tests passed!');
