import { Cubic } from './cubic';
import { mathRound, floatToHex, isOdd, interpolate, convertRotationToMatrix } from './utils';
import { TransactionCache } from './cache';

const INDICES_REGEX = /\(\w{1}\[(\d{1,2})\],\s*16\)+/g;
const ONDEMAND_FILE_REGEX = /['|"]{1}ondemand\.s['|"]{1}:\s*['|"]{1}([\w]*)['|"]{1}/;
const ONDEMAND_FILE_URL = 'https://abs.twimg.com/responsive-web/client-web/ondemand.s.{filename}a.js';
const META_TAG_REGEX = /<meta\s+name=["']twitter-site-verification["']\s+content=["']([^"']+)["']/;
const SVG_ANIM_REGEX = /<svg[^>]+id=["']loading-x-anim-(\d)["'][^>]*>([\s\S]*?)<\/svg>/g;
const ADDITIONAL_RANDOM_NUMBER = 3;
const DEFAULT_KEYWORD = 'obfiowerehiring';

export class TransactionIDGenerator {
  private constructor(
    private keyBytes: number[],
    private animationKey: string,
    private randomKeyword: string = DEFAULT_KEYWORD,
    private randomNumber: number = ADDITIONAL_RANDOM_NUMBER
  ) {}

  static async create(): Promise<TransactionIDGenerator> {
    const cached = await TransactionCache.get();
    
    if (cached) {
      const keyBytes = Array.from(Buffer.from(cached.key, 'base64'));
      const animationKey = this.computeAnimationKey(keyBytes, cached.frames, cached.rowIndex, cached.keyBytesIndices);
      return new TransactionIDGenerator(keyBytes, animationKey);
    }

    return await this.fetchAndCreate();
  }

  private static async fetchAndCreate(): Promise<TransactionIDGenerator> {
    const [homePageText, ondemandFilename] = await this.fetchHomePage();
    const ondemandText = await this.fetchOndemandFile(ondemandFilename);
    
    const key = this.parseMetaTag(homePageText);
    const frames = this.parseSVGFrames(homePageText);
    const indices = this.parseIndices(ondemandText);

    await TransactionCache.set({
      key,
      frames,
      rowIndex: indices.rowIndex,
      keyBytesIndices: indices.keyBytesIndices,
    });

    const keyBytes = Array.from(Buffer.from(key, 'base64'));
    const animationKey = this.computeAnimationKey(keyBytes, frames, indices.rowIndex, indices.keyBytesIndices);
    
    return new TransactionIDGenerator(keyBytes, animationKey);
  }

  private static async fetchHomePage(): Promise<[string, string]> {
    const response = await fetch('https://x.com');
    const text = await response.text();
    
    const filename = ONDEMAND_FILE_REGEX.exec(text)?.[1];
    if (!filename) throw new Error('Could not find ondemand.s file');

    return [text, filename];
  }

  private static async fetchOndemandFile(filename: string): Promise<string> {
    const url = ONDEMAND_FILE_URL.replace('{filename}', filename);
    const response = await fetch(url);
    return await response.text();
  }

  private static parseMetaTag(html: string): string {
    const match = META_TAG_REGEX.exec(html);
    if (!match?.[1]) throw new Error("Couldn't get twitter-site-verification");
    return match[1];
  }

  private static parseSVGFrames(html: string): string[] {
    const frames: string[] = [];
    for (const match of html.matchAll(SVG_ANIM_REGEX)) {
      frames[parseInt(match[1]!)] = match[2]!;
    }
    if (frames.length === 0) throw new Error('Could not find SVG frames');
    return frames;
  }

  private static parseIndices(ondemandText: string): { rowIndex: number; keyBytesIndices: number[] } {
    const indices: number[] = [];
    for (const match of ondemandText.matchAll(INDICES_REGEX)) {
      indices.push(parseInt(match[1]!));
    }
    if (indices.length === 0) throw new Error("Couldn't get KEY_BYTE indices");
    return { rowIndex: indices[0]!, keyBytesIndices: indices.slice(1) };
  }

  private static computeAnimationKey(keyBytes: number[], frames: string[], rowIndex: number, keyBytesIndices: number[]): string {
    const totalTime = 4096;
    const row = keyBytes[rowIndex]! % 16;
    const frameTime = keyBytesIndices.reduce((acc, idx) => acc * (keyBytes[idx]! % 16), 1);
    const roundedTime = mathRound(frameTime / 10) * 10;
    
    const arr = this.parse2DArray(keyBytes, frames);
    const frameRow = arr[row]!;
    const targetTime = roundedTime / totalTime;
    
    return this.animate(frameRow, targetTime);
  }

  private static parse2DArray(keyBytes: number[], frames: string[]): number[][] {
    const targetFrame = frames[keyBytes[5]! % 4]!;
    const pathRegex = /<path[^>]*\s+d=["']([^"']+)["']/g;
    const pathMatches = [...targetFrame.matchAll(pathRegex)];
    if (pathMatches.length < 2) throw new Error('Path elements not found');

    const dAttr = pathMatches[1]![1]!;
    return dAttr.substring(9).split('C').map(part => 
      part.replace(/[^\d]+/g, ' ').trim().split(' ').map(num => parseInt(num, 10))
    );
  }

  private static solve(value: number, minVal: number, maxVal: number, rounding: boolean): number {
    const result = (value * (maxVal - minVal)) / 255 + minVal;
    return rounding ? Math.floor(result) : Math.round(result * 100) / 100;
  }

  private static animate(frames: number[], targetTime: number): string {
    const fromColor = [...frames.slice(0, 3), 1];
    const toColor = [...frames.slice(3, 6), 1];
    const fromRotation = [0.0];
    const toRotation = [this.solve(frames[6]!, 60.0, 360.0, true)];
    
    const curves = frames.slice(7).map((item, counter) => this.solve(item, isOdd(counter), 1.0, false));
    const cubic = new Cubic(curves);
    const val = cubic.getValue(targetTime);
    
    const color = interpolate(fromColor, toColor, val);
    const clampedColor = color.map(v => Math.max(0, Math.min(255, v)));
    
    const rotation = interpolate(fromRotation, toRotation, val);
    const matrix = convertRotationToMatrix(rotation[0]!);
    
    const strArr = clampedColor.slice(0, -1).map(v => Math.round(v).toString(16));
    for (const value of matrix) {
      const rounded = Math.round(value * 100) / 100;
      const hexValue = floatToHex(Math.abs(rounded));
      strArr.push((hexValue.startsWith('.') ? `0${hexValue}` : hexValue || '0').toLowerCase());
    }
    
    strArr.push('0', '0');
    return strArr.join('').replace(/[.-]/g, '');
  }

  generateTransactionId(method: string, path: string, timeNow?: number): string {
    timeNow = timeNow ?? Math.floor((Date.now() - 1682924400 * 1000) / 1000);
    const timeNowBytes = [
      (timeNow >> 0) & 0xff,
      (timeNow >> 8) & 0xff,
      (timeNow >> 16) & 0xff,
      (timeNow >> 24) & 0xff,
    ];

    const hashInput = `${method}!${path}!${timeNow}${this.randomKeyword}${this.animationKey}`;
    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(hashInput);
    const hashBytes = Array.from(new Uint8Array(hasher.digest()));

    const randomNum = Math.floor(Math.random() * 256);
    const bytesArr = [...this.keyBytes, ...timeNowBytes, ...hashBytes.slice(0, 16), this.randomNumber];
    
    const out = new Uint8Array([randomNum, ...bytesArr.map(item => item ^ randomNum)]);
    return Buffer.from(out).toString('base64').replace(/=/g, '');
  }
}
