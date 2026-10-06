import { readFileSync } from "node:fs";
import { join } from "node:path";

export type DataProvider = {
  fetchManifest(): Buffer;
  fetchSignature(): Buffer;
  fetchFile(key: string): Buffer;
  ack(publishSequence: number): void;
};

export type SyncTrigger = { kind: "signal" } | { kind: "signal"; at: string };

const FORBIDDEN_TRIGGER_KEYS = [
  "url",
  "href",
  "origin",
  "files",
  "manifest",
  "snapshot",
  "payload",
  "candidate",
] as const;

export function parseSyncTrigger(input: unknown): SyncTrigger {
  if (input === undefined || input === null || input === "") {
    return { kind: "signal" };
  }
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("signal-only trigger");
  }
  const record = input as Record<string, unknown>;
  for (const key of FORBIDDEN_TRIGGER_KEYS) {
    if (key in record) {
      throw new Error("signal-only trigger");
    }
  }
  if (record.at !== undefined && typeof record.at !== "string") {
    throw new Error("signal-only trigger");
  }
  if (typeof record.at === "string") {
    return { kind: "signal", at: record.at };
  }
  return { kind: "signal" };
}

export function createHubAdapter(originDir: string): DataProvider {
  return {
    fetchManifest() {
      return readFileSync(join(originDir, "manifest.json"));
    },
    fetchSignature() {
      return readFileSync(join(originDir, "manifest.sig"));
    },
    fetchFile(key: string) {
      if (key.includes("..") || key.includes("\\") || key.startsWith("/")) {
        throw new Error("invalid snapshot file key");
      }
      return readFileSync(join(originDir, key));
    },
    ack() {
      // Local Hub contour: ACK is recorded by the site pending-ack store.
    },
  };
}
