import { BinaryNotFoundError, XApiError } from "../errors";

let cachedBinaryPath: string | null = null;

export function getCurlBinaryPath(): string | null {
  return cachedBinaryPath;
}

export async function detectCurlBinary(): Promise<string> {
  if (cachedBinaryPath) return cachedBinaryPath;

  const osDir = getOsDir(Bun.env.OS ?? process.platform);
  const archDir = getArchDir(process.arch);

  const projectRoot = import.meta.dir.replace(/\/src\/core$/, "");
  const binPath = `${projectRoot}/bin/curl-impersonate/${osDir}/${archDir}/curl_edge101`;

  if (!(await Bun.file(binPath).exists())) {
    throw new BinaryNotFoundError(
      `curl-impersonate binary not found at ${binPath}`,
    );
  }

  cachedBinaryPath = binPath;
  return binPath;
}

const getOsDir = (platform: string): string => {
  switch (platform) {
    case "darwin":
      return "macos";
    case "linux":
      return "linux";
    case "win32":
      throw new XApiError(
        "Windows is not supported. Please use WSL2 (Windows Subsystem for Linux)",
        "UNSUPPORTED_PLATFORM",
      );
    default:
      throw new XApiError(
        `Unsupported platform: ${platform}`,
        "UNSUPPORTED_PLATFORM",
      );
  }
};

const getArchDir = (arch: string): string => {
  switch (arch) {
    case "x64":
      return "amd64";
    case "arm64":
      return "arm64";
    default:
      throw new XApiError(
        `Unsupported architecture: ${arch}`,
        "UNSUPPORTED_ARCH",
      );
  }
};
