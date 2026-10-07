import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { SnapshotManifest } from "../hub/contract";
import {
  bumpPendingAck,
  clearPendingAck,
  listPendingAcks,
  writePendingAck,
} from "./ack";
import type { DataProvider } from "./provider";
import { openSnapshotStore } from "./store";
import { applyLocalSnapshot, loadCurrentSnapshot } from "./sync";
import type { TrustSet } from "./trust";

export type ProviderSyncResult =
  | {
      status: "activated" | "already-current";
      manifest: SnapshotManifest;
      ack: "sent" | "pending";
    }
  | { status: "rejected"; reason: string }
  | { status: "provider-unavailable"; reason: string };

function deliverAck(
  provider: DataProvider,
  storeRoot: string,
  sequence: number,
): "sent" | "pending" {
  const store = openSnapshotStore(storeRoot);
  writePendingAck(store, sequence);
  try {
    provider.ack(sequence);
    clearPendingAck(store, sequence);
    return "sent";
  } catch {
    bumpPendingAck(store, sequence);
    return "pending";
  }
}

export function flushPendingAcks(
  storeRoot: string,
  provider: DataProvider,
): void {
  const store = openSnapshotStore(storeRoot);
  for (const pending of listPendingAcks(store)) {
    try {
      provider.ack(pending.publishSequence);
      clearPendingAck(store, pending.publishSequence);
    } catch {
      bumpPendingAck(store, pending.publishSequence);
    }
  }
}

export function runProviderSync(input: {
  storeRoot: string;
  provider: DataProvider;
  trust: TrustSet;
  expectedProjectId: string;
  reservedRoots?: readonly string[];
}): ProviderSyncResult {
  const pullDir = mkdtempSync(join(tmpdir(), "sz-pull-"));
  try {
    let manifestBytes: Buffer;
    let signature: Buffer;
    try {
      manifestBytes = input.provider.fetchManifest();
      signature = input.provider.fetchSignature();
    } catch (error) {
      return {
        status: "provider-unavailable",
        reason: error instanceof Error ? error.message : "provider down",
      };
    }
    writeFileSync(join(pullDir, "manifest.json"), manifestBytes);
    writeFileSync(join(pullDir, "manifest.sig"), signature);
    const parsed = JSON.parse(manifestBytes.toString("utf8")) as {
      publishSequence?: unknown;
      files?: Array<{ key?: unknown }>;
      keyId?: unknown;
    };
    if (typeof parsed.publishSequence !== "number") {
      return { status: "rejected", reason: "hard schema/envelope error" };
    }
    if (typeof parsed.keyId !== "string" || parsed.keyId.length === 0) {
      return { status: "rejected", reason: "hard schema/envelope error" };
    }
    let signed = false;
    try {
      signed = input.trust.verifySignature(
        parsed.keyId,
        manifestBytes,
        signature,
      );
    } catch {
      signed = false;
    }
    if (!signed) {
      return { status: "rejected", reason: "invalid signature" };
    }
    const sequence = parsed.publishSequence;
    const current = loadCurrentSnapshot(input.storeRoot);
    if (current?.publishSequence === sequence) {
      return {
        status: "already-current",
        manifest: current,
        ack: deliverAck(input.provider, input.storeRoot, sequence),
      };
    }
    if (!Array.isArray(parsed.files)) {
      return { status: "rejected", reason: "hard schema/envelope error" };
    }
    try {
      for (const file of parsed.files) {
        if (typeof file.key !== "string") {
          return { status: "rejected", reason: "hard schema/envelope error" };
        }
        writeFileSync(
          join(pullDir, file.key),
          input.provider.fetchFile(file.key),
        );
      }
    } catch (error) {
      return {
        status: "provider-unavailable",
        reason: error instanceof Error ? error.message : "provider down",
      };
    }
    const applied = applyLocalSnapshot({
      storeRoot: input.storeRoot,
      candidateDir: pullDir,
      trust: input.trust,
      expectedProjectId: input.expectedProjectId,
      reservedRoots: input.reservedRoots,
    });
    if (applied.status === "rejected") {
      return { status: "rejected", reason: applied.reason };
    }
    return {
      status: "activated",
      manifest: applied.manifest,
      ack: deliverAck(
        input.provider,
        input.storeRoot,
        applied.manifest.publishSequence,
      ),
    };
  } finally {
    rmSync(pullDir, { recursive: true, force: true });
  }
}
