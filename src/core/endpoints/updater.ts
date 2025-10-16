import type { EndpointsCache, EndpointData } from './loader';

const TWITTER_URL = 'https://x.com';
const CACHE_PATH = '.cache/api-endpoints.json';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const MAX_BUNDLES = 10;

const PATTERNS = {
  queryIdFirst: /\{[^}]*queryId\s*:\s*["']([a-zA-Z0-9_-]+)["'][^}]*operationName\s*:\s*["']([a-zA-Z0-9_]+)["'][^}]*\}/g,
  operationFirst: /operationName\s*:\s*["']([a-zA-Z0-9_]+)["'][^}]*queryId\s*:\s*["']([a-zA-Z0-9_-]+)["']/g,
  namedExport: /(?:export\s+const|const)\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*\{[^}]*queryId\s*:\s*["']([a-zA-Z0-9_-]+)["']/g,
  objectProperty: /([A-Z][a-zA-Z0-9_]*)\s*:\s*\{[^}]*(?:id|queryId)\s*:\s*["']([a-zA-Z0-9_-]+)["']/g,
} as const;

export interface UpdateOptions {
  force?: boolean;
  verify?: boolean;
}

export interface UpdateResult {
  success: boolean;
  cache: EndpointsCache;
  error?: string;
}

async function loadExistingCache(): Promise<EndpointsCache | null> {
  try {
    const file = Bun.file(CACHE_PATH);
    if (!(await file.exists())) return null;
    return await file.json() as EndpointsCache;
  } catch {
    return null;
  }
}

async function saveCache(cache: EndpointsCache): Promise<void> {
  await Bun.write(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function isCacheFresh(cache: EndpointsCache): boolean {
  return (Date.now() - cache.timestamp) < CACHE_MAX_AGE;
}

async function fetchHomepage(): Promise<string> {
  const response = await fetch(TWITTER_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html',
    },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function extractBundleUrls(html: string): string[] {
  const urls: string[] = [];
  const regex = /<script[^>]+src=["']([^"']+\.js)["']/g;

  for (const match of html.matchAll(regex)) {
    const url = match[1];
    if (!url) continue;
    urls.push(url.startsWith('http') ? url : `${TWITTER_URL}${url}`);
  }

  return urls;
}

function prioritizeBundles(urls: string[]): string[] {
  return urls
    .map(url => {
      let score = 0;
      if (url.includes('main.')) score += 100;
      if (url.includes('api.')) score += 90;
      if (url.includes('client.')) score += 80;
      if (url.includes('vendor.')) score += 70;
      if (url.includes('bundle.')) score += 60;
      if (url.includes('chunk.')) score -= 20;
      if (url.includes('polyfill.')) score -= 30;
      return { url, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.url);
}

async function fetchWithRetry(url: string): Promise<string> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    } catch (error) {
      if (i === MAX_RETRIES - 1) throw error;
      await Bun.sleep(RETRY_DELAY * Math.pow(2, i));
    }
  }

  throw new Error('Max retries exceeded');
}

function parseJavaScript(js: string): Record<string, EndpointData> {
  const endpoints: Record<string, EndpointData> = {};

  const addEndpoint = (operationName: string, queryId: string) => {
    if (!isValidEndpoint(operationName, queryId) || endpoints[operationName]) return;
    endpoints[operationName] = { operationName, queryId };
  };

  for (const match of js.matchAll(PATTERNS.queryIdFirst)) {
    if (match[1] && match[2]) addEndpoint(match[2], match[1]);
  }

  for (const match of js.matchAll(PATTERNS.operationFirst)) {
    if (match[1] && match[2]) addEndpoint(match[1], match[2]);
  }

  for (const match of js.matchAll(PATTERNS.namedExport)) {
    if (match[1] && match[2]) addEndpoint(match[1], match[2]);
  }

  for (const match of js.matchAll(PATTERNS.objectProperty)) {
    if (match[1] && match[2]) addEndpoint(match[1], match[2]);
  }

  return endpoints;
}

function isValidEndpoint(operationName: string, queryId: string): boolean {
  if (!queryId || queryId.length < 10 || queryId.length > 50) return false;
  if (!operationName || !/^[A-Za-z][a-zA-Z0-9_]*$/.test(operationName)) return false;
  
  const invalid = ['query', 'mutation', 'subscription', 'operation'];
  return !invalid.includes(operationName.toLowerCase());
}

async function extractFromBundle(url: string): Promise<Record<string, EndpointData>> {
  try {
    const js = await fetchWithRetry(url);
    return parseJavaScript(js);
  } catch {
    return {};
  }
}

async function extractFromBundles(urls: string[]): Promise<Record<string, EndpointData>> {
  const results = await Promise.all(urls.map(extractFromBundle));
  return Object.assign({}, ...results);
}

async function verifyEndpoint(data: EndpointData): Promise<EndpointData> {
  const url = `${TWITTER_URL}/i/api/graphql/${data.queryId}/${data.operationName}`;

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    const verified = response.status < 500;
    const confidence: 'high' | 'medium' | 'low' =
      response.status < 300 ? 'high' :
      response.status < 500 ? 'medium' : 'low';

    return { ...data, verified, confidence, lastVerified: Date.now() };
  } catch {
    return { ...data, verified: false, confidence: 'low', lastVerified: Date.now() };
  }
}

async function verifyEndpoints(endpoints: Record<string, EndpointData>): Promise<void> {
  const entries = Object.entries(endpoints);
  const batchSize = 5;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async ([name, data]) => {
        endpoints[name] = await verifyEndpoint(data);
      })
    );

    if (i + batchSize < entries.length) {
      await Bun.sleep(200);
    }
  }
}

export async function updateEndpoints(options: UpdateOptions = {}): Promise<UpdateResult> {
  const { force = false, verify = false } = options;

  try {
    if (!force) {
      const existing = await loadExistingCache();
      if (existing && isCacheFresh(existing)) {
        return { success: true, cache: existing };
      }
    }

    const html = await fetchHomepage();
    const bundleUrls = extractBundleUrls(html);
    const prioritized = prioritizeBundles(bundleUrls).slice(0, MAX_BUNDLES);
    const endpoints = await extractFromBundles(prioritized);

    if (verify) {
      await verifyEndpoints(endpoints);
    }

    const cache: EndpointsCache = {
      version: '1.0',
      timestamp: Date.now(),
      endpoints,
      stats: {
        totalEndpoints: Object.keys(endpoints).length,
        verifiedEndpoints: Object.values(endpoints).filter(e => e.verified).length,
        bundlesChecked: prioritized.length,
      },
    };

    await saveCache(cache);

    return { success: true, cache };
  } catch (error) {
    const existing = await loadExistingCache();
    if (existing) {
      return { success: false, cache: existing, error: String(error) };
    }

    throw error;
  }
}
