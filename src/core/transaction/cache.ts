import { join } from 'path';
import { tmpdir } from 'os';
import { mkdir, unlink } from 'fs/promises';

interface CacheData {
  key: string;
  frames: string[];
  rowIndex: number;
  keyBytesIndices: number[];
  timestamp: number;
}

const CACHE_DIR = join(tmpdir(), 'x-api-transaction-cache');
const CACHE_FILE = join(CACHE_DIR, 'data.json');
const CACHE_TTL = 24 * 3600 * 1000;

export class TransactionCache {
  private static memoryCache: CacheData | null = null;

  static async get(): Promise<CacheData | null> {
    if (this.memoryCache && this.isValid(this.memoryCache)) {
      return this.memoryCache;
    }

    const file = Bun.file(CACHE_FILE);
    if (!(await file.exists())) return null;

    try {
      const data = await file.json() as CacheData;
      if (!this.isValid(data)) {
        await this.clear();
        return null;
      }
      this.memoryCache = data;
      return data;
    } catch {
      return null;
    }
  }

  static async set(data: Omit<CacheData, 'timestamp'>): Promise<void> {
    const cacheData: CacheData = { ...data, timestamp: Date.now() };
    this.memoryCache = cacheData;

    try {
      await mkdir(CACHE_DIR, { recursive: true });
      await Bun.write(CACHE_FILE, JSON.stringify(cacheData));
    } catch {}
  }

  static async clear(): Promise<void> {
    this.memoryCache = null;
    const file = Bun.file(CACHE_FILE);
    if (await file.exists()) {
      try {
        await unlink(CACHE_FILE);
      } catch {}
    }
  }

  private static isValid(data: CacheData): boolean {
    return (Date.now() - data.timestamp) < CACHE_TTL;
  }
}
