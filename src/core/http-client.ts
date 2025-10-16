import { HttpError, XApiError } from "../errors";
import { detectCurlBinary } from "./binary";

export class HttpClient {
  private static cachedBinary: string | null = null;

  constructor(private curlBinary?: string) {}

  private async getCurlBinary(): Promise<string> {
    if (this.curlBinary) return this.curlBinary;
    HttpClient.cachedBinary ??= await detectCurlBinary();
    return HttpClient.cachedBinary;
  }

  async execute(args: string[], body?: string | Buffer): Promise<Buffer> {
    const binary = await this.getCurlBinary();

    const proc = Bun.spawn([binary, "-s", ...args], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    if (body) proc.stdin.write(body);
    proc.stdin.end();

    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).arrayBuffer(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    if (exitCode !== 0) {
      const error = stderr.trim() || `curl failed (exit ${exitCode})`;
      throw new HttpError(error, exitCode);
    }

    return Buffer.from(stdout);
  }

  parseJson<T = unknown>(buffer: Buffer): T {
    const text = buffer.toString("utf-8").trim();

    if (!text) {
      throw new XApiError("Empty response from server", "EMPTY_RESPONSE");
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      throw new XApiError(
        `Invalid JSON response: ${msg}`,
        "INVALID_JSON",
        error,
      );
    }
  }

  buildCurlArgs(headers: Record<string, string>): string[] {
    const args: string[] = [];

    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === "cookie") {
        args.push("-b", value);
      } else {
        args.push("-H", `${key}: ${value}`);
      }
    }

    return args;
  }
}
