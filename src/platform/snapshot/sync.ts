import { cpSync, existsSync, rmSync } from "node:fs";
import type { SnapshotManifest } from "../hub/contract";
import {
  acquireLock,
  activateStaging,
  openSnapshotStore,
  quarantineCandidate,
  readCurrentManifest,
  releaseLock,
  type SnapshotStore,
} from "./store";
import type { TrustSet } from "./trust";
import { verifyCandidate } from "./verify";

export type ApplyResult =
  | { status: "activated"; manifest: SnapshotManifest; warnings: string[] }
  | { status: "rejected"; reason: string; quarantinePath: string };

export function applyLocalSnapshot(input: {
  storeRoot: string;
  candidateDir: string;
  trust: TrustSet;
  expectedProjectId: string;
  lockTtlMs?: number;
}): ApplyResult {
  const store = openSnapshotStore(input.storeRoot);
  try {
    acquireLock(store, input.lockTtlMs);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "apply failed";
    return { status: "rejected", reason, quarantinePath: "" };
  }
  try {
    const current = readCurrentManifest(store);
    try {
      const verified = verifyCandidate({
        candidateDir: input.candidateDir,
        trust: input.trust,
        expectedProjectId: input.expectedProjectId,
        currentSequence: current?.publishSequence,
      });
      prepareStaging(store, input.candidateDir);
      activateStaging(store);
      return {
        status: "activated",
        manifest: verified.manifest,
        warnings: verified.warnings.map((issue) => issue.message),
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "apply failed";
      const quarantinePath = quarantineCandidate(
        store,
        input.candidateDir,
        reason.replace(/\s+/g, "-").slice(0, 80),
      );
      return { status: "rejected", reason, quarantinePath };
    }
  } finally {
    releaseLock(store);
  }
}

export function prepareStaging(
  store: SnapshotStore,
  candidateDir: string,
): void {
  if (existsSync(store.stagingDir)) {
    rmSync(store.stagingDir, { recursive: true, force: true });
  }
  cpSync(candidateDir, store.stagingDir, { recursive: true });
}

export function loadCurrentSnapshot(
  storeRoot: string,
): SnapshotManifest | null {
  return readCurrentManifest(openSnapshotStore(storeRoot));
}
