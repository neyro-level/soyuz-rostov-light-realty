import { createHmac, timingSafeEqual } from "node:crypto";
import { SYNC_TIMESTAMP_SKEW_MS } from "./constants";
import { parseSyncTrigger } from "./provider";

export function signSyncSignal(
  secret: string,
  timestamp: string,
  body: string,
): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
}

export function verifySyncSignal(input: {
  secret: string;
  timestamp: string | null;
  signature: string | null;
  body: string;
  now?: Date;
}): void {
  if (!input.timestamp || !input.signature) {
    throw new Error("missing sync authentication");
  }
  const at = Date.parse(input.timestamp);
  if (!Number.isFinite(at)) {
    throw new Error("invalid sync timestamp");
  }
  const now = input.now ?? new Date();
  if (Math.abs(now.getTime() - at) > SYNC_TIMESTAMP_SKEW_MS) {
    throw new Error("sync timestamp skew");
  }
  const expected = signSyncSignal(input.secret, input.timestamp, input.body);
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(input.signature, "utf8");
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new Error("invalid sync signature");
  }
  parseSyncTrigger(input.body ? JSON.parse(input.body) : null);
}

export function parseSyncTimestamp(value: string | undefined): void {
  if (!value) {
    throw new Error("invalid sync timestamp");
  }
  const at = Date.parse(value);
  if (!Number.isFinite(at)) {
    throw new Error("invalid sync timestamp");
  }
  if (Math.abs(Date.now() - at) > SYNC_TIMESTAMP_SKEW_MS) {
    throw new Error("sync timestamp skew");
  }
}
