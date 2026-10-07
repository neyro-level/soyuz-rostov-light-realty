import { describe, expect, it } from "vitest";
import { signSyncSignal, verifySyncSignal } from "./signal";

const secret = "sync-test-secret-value";

describe("sync HMAC signal", () => {
  it("accepts a fresh signed empty trigger", () => {
    const timestamp = new Date("2026-10-07T12:00:00.000Z").toISOString();
    const body = "{}";
    const signature = signSyncSignal(secret, timestamp, body);
    expect(() =>
      verifySyncSignal({
        secret,
        timestamp,
        signature,
        body,
        now: new Date("2026-10-07T12:02:00.000Z"),
      }),
    ).not.toThrow();
  });

  it("rejects timestamp skew over five minutes", () => {
    const timestamp = new Date("2026-10-07T12:00:00.000Z").toISOString();
    const body = "{}";
    const signature = signSyncSignal(secret, timestamp, body);
    expect(() =>
      verifySyncSignal({
        secret,
        timestamp,
        signature,
        body,
        now: new Date("2026-10-07T12:06:00.000Z"),
      }),
    ).toThrow(/skew/);
  });

  it("rejects a url payload and a bad signature", () => {
    const timestamp = new Date("2026-10-07T12:00:00.000Z").toISOString();
    expect(() =>
      verifySyncSignal({
        secret,
        timestamp,
        signature: signSyncSignal(
          secret,
          timestamp,
          '{"url":"https://evil.test"}',
        ),
        body: '{"url":"https://evil.test"}',
        now: new Date("2026-10-07T12:00:00.000Z"),
      }),
    ).toThrow(/signal-only/);
    expect(() =>
      verifySyncSignal({
        secret,
        timestamp,
        signature: "deadbeef",
        body: "{}",
        now: new Date("2026-10-07T12:00:00.000Z"),
      }),
    ).toThrow(/invalid sync signature/);
  });
});
