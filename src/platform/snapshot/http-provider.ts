import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { HTTP_FETCH_MAX_BYTES, HTTP_FETCH_TIMEOUT_MS } from "./constants";

const PRIVATE_IPV4 =
  /^(?:10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[0-1])\.)/;

function isPrivateAddress(address: string): boolean {
  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:")) {
    return isPrivateAddress(normalized.slice(7));
  }
  if (normalized.includes(":")) {
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80")
    );
  }
  return address === "0.0.0.0" || PRIVATE_IPV4.test(address);
}

export function assertAllowedProviderUrl(
  raw: string,
  allowedOrigin: string,
): URL {
  const url = new URL(raw);
  const allowed = new URL(allowedOrigin);
  if (url.protocol !== "https:") {
    throw new Error("provider origin must be https");
  }
  if (url.username || url.password) {
    throw new Error("provider origin credentials are forbidden");
  }
  if (url.origin !== allowed.origin) {
    throw new Error("provider origin is not allowlisted");
  }
  return url;
}

export async function assertPublicHostname(hostname: string): Promise<void> {
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("provider target is a private address");
  }
  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new Error("provider target is a private address");
    }
    return;
  }
  const resolved = await lookup(hostname, { all: true });
  for (const item of resolved) {
    if (isPrivateAddress(item.address)) {
      throw new Error("provider target is a private address");
    }
  }
}

export async function fetchHttpsBuffer(
  rawUrl: string,
  allowedOrigin: string,
  init?: { timeoutMs?: number; maxBytes?: number; redirected?: boolean },
): Promise<Buffer> {
  const url = assertAllowedProviderUrl(rawUrl, allowedOrigin);
  await assertPublicHostname(url.hostname);
  const timeoutMs = init?.timeoutMs ?? HTTP_FETCH_TIMEOUT_MS;
  const maxBytes = init?.maxBytes ?? HTTP_FETCH_MAX_BYTES;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || init?.redirected) {
        throw new Error("provider redirect is not allowed");
      }
      const next = new URL(location, url);
      if (next.origin !== url.origin) {
        throw new Error("provider redirect to another host is forbidden");
      }
      return fetchHttpsBuffer(next.toString(), allowedOrigin, {
        ...init,
        redirected: true,
      });
    }
    if (!response.ok) {
      throw new Error(`provider http ${response.status}`);
    }
    const declared = response.headers.get("content-length");
    if (declared) {
      const size = Number(declared);
      if (Number.isFinite(size) && size > maxBytes) {
        throw new Error("provider payload exceeds size limit");
      }
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > maxBytes) {
      throw new Error("provider payload exceeds size limit");
    }
    return bytes;
  } finally {
    clearTimeout(timer);
  }
}

export async function downloadProviderSnapshot(
  origin: string,
  destDir: string,
  writeFile: (path: string, bytes: Buffer) => void,
  joinPath: (dir: string, key: string) => string,
): Promise<void> {
  const manifest = await fetchHttpsBuffer(
    new URL("manifest.json", origin).toString(),
    origin,
  );
  const signature = await fetchHttpsBuffer(
    new URL("manifest.sig", origin).toString(),
    origin,
  );
  writeFile(joinPath(destDir, "manifest.json"), manifest);
  writeFile(joinPath(destDir, "manifest.sig"), signature);
  const parsed = JSON.parse(manifest.toString("utf8")) as {
    files?: Array<{ key?: unknown }>;
  };
  if (!Array.isArray(parsed.files)) {
    throw new Error("hard schema/envelope error");
  }
  for (const file of parsed.files) {
    if (typeof file.key !== "string") {
      throw new Error("hard schema/envelope error");
    }
    if (
      file.key.includes("..") ||
      file.key.includes("\\") ||
      file.key.startsWith("/")
    ) {
      throw new Error("invalid snapshot file key");
    }
    const bytes = await fetchHttpsBuffer(
      new URL(file.key, origin).toString(),
      origin,
    );
    writeFile(joinPath(destDir, file.key), bytes);
  }
}
