import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(async () => [{ address: "8.8.8.8", family: 4 }]),
}));

import {
  assertAllowedProviderUrl,
  assertPublicHostname,
  fetchHttpsBuffer,
} from "./http-provider";

const origin = "https://hub.example.test";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("HTTP provider SSRF controls", () => {
  it("allows only https allowlisted origin", () => {
    expect(
      assertAllowedProviderUrl(`${origin}/manifest.json`, origin).origin,
    ).toBe(origin);
    expect(() =>
      assertAllowedProviderUrl("http://hub.example.test/manifest.json", origin),
    ).toThrow(/https/);
    expect(() =>
      assertAllowedProviderUrl(
        "https://other.example.test/manifest.json",
        origin,
      ),
    ).toThrow(/allowlisted/);
  });

  it("rejects loopback and private hosts", async () => {
    await expect(assertPublicHostname("127.0.0.1")).rejects.toThrow(/private/);
    await expect(assertPublicHostname("localhost")).rejects.toThrow(/private/);
    await expect(assertPublicHostname("10.1.2.3")).rejects.toThrow(/private/);
  });

  it("rejects a redirect to another host", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        status: 302,
        ok: false,
        headers: {
          get: (name: string) =>
            name === "location" ? "https://evil.test/x" : null,
        },
        arrayBuffer: async () => new ArrayBuffer(0),
      })),
    );
    await expect(
      fetchHttpsBuffer(`${origin}/manifest.json`, origin),
    ).rejects.toThrow(/another host/);
  });

  it("enforces the payload size limit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        status: 200,
        ok: true,
        headers: {
          get: (name: string) =>
            name === "content-length" ? "999999999" : null,
        },
        arrayBuffer: async () => new ArrayBuffer(0),
      })),
    );
    await expect(
      fetchHttpsBuffer(`${origin}/manifest.json`, origin),
    ).rejects.toThrow(/size limit/);
  });
});
