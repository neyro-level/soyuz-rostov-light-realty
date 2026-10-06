import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { SnapshotManifest } from "../hub/contract";
import { DEFAULT_LOCK_TTL_MS } from "./constants";

export type SnapshotStore = {
  root: string;
  revisionsDir: string;
  currentPointerPath: string;
  pendingAckDir: string;
  quarantineDir: string;
  lockPath: string;
};

export function openSnapshotStore(root: string): SnapshotStore {
  mkdirSync(root, { recursive: true });
  const revisionsDir = join(root, "revisions");
  mkdirSync(revisionsDir, { recursive: true });
  mkdirSync(join(root, "pending-ack"), { recursive: true });
  mkdirSync(join(root, "quarantine"), { recursive: true });
  return {
    root,
    revisionsDir,
    currentPointerPath: join(root, "CURRENT"),
    pendingAckDir: join(root, "pending-ack"),
    quarantineDir: join(root, "quarantine"),
    lockPath: join(root, "apply.lock"),
  };
}

export function revisionDir(store: SnapshotStore, sequence: number): string {
  return join(store.revisionsDir, String(sequence));
}

export function revisionTmpDir(store: SnapshotStore, sequence: number): string {
  return join(store.revisionsDir, `${sequence}.tmp`);
}

export function readCurrentSequence(store: SnapshotStore): number | null {
  if (!existsSync(store.currentPointerPath)) {
    return null;
  }
  const raw = readFileSync(store.currentPointerPath, "utf8").trim();
  const sequence = Number.parseInt(raw, 10);
  if (!Number.isInteger(sequence) || sequence < 0) {
    return null;
  }
  return sequence;
}

export function resolveCurrentRevisionDir(store: SnapshotStore): string | null {
  const sequence = readCurrentSequence(store);
  if (sequence === null) {
    return null;
  }
  const dir = revisionDir(store, sequence);
  if (!existsSync(join(dir, "manifest.json"))) {
    return null;
  }
  return dir;
}

export function readCurrentManifest(
  store: SnapshotStore,
): SnapshotManifest | null {
  const dir = resolveCurrentRevisionDir(store);
  if (!dir) {
    return null;
  }
  return JSON.parse(
    readFileSync(join(dir, "manifest.json"), "utf8"),
  ) as SnapshotManifest;
}

export function acquireLock(
  store: SnapshotStore,
  ttlMs = DEFAULT_LOCK_TTL_MS,
): void {
  if (existsSync(store.lockPath)) {
    const raw = JSON.parse(readFileSync(store.lockPath, "utf8")) as {
      at: number;
    };
    if (Date.now() - raw.at < ttlMs) {
      throw new Error("concurrent apply");
    }
  }
  writeFileSync(
    store.lockPath,
    JSON.stringify({ at: Date.now(), pid: process.pid }),
  );
}

export function releaseLock(store: SnapshotStore): void {
  if (existsSync(store.lockPath)) {
    rmSync(store.lockPath);
  }
}

function writeCurrentPointer(store: SnapshotStore, sequence: number): void {
  const tmp = `${store.currentPointerPath}.tmp`;
  writeFileSync(tmp, `${sequence}\n`);
  renameSync(tmp, store.currentPointerPath);
}

export function prepareStaging(
  store: SnapshotStore,
  candidateDir: string,
  sequence: number,
): void {
  const tmp = revisionTmpDir(store, sequence);
  if (existsSync(tmp)) {
    rmSync(tmp, { recursive: true, force: true });
  }
  mkdirSync(store.revisionsDir, { recursive: true });
  cpSync(candidateDir, tmp, { recursive: true });
}

export function activateStaging(store: SnapshotStore, sequence: number): void {
  const tmp = revisionTmpDir(store, sequence);
  const dest = revisionDir(store, sequence);
  if (!existsSync(join(tmp, "manifest.json"))) {
    throw new Error("activation failure");
  }
  if (existsSync(dest)) {
    throw new Error("activation failure");
  }
  renameSync(tmp, dest);
  writeCurrentPointer(store, sequence);
}

export function quarantineCandidate(
  store: SnapshotStore,
  candidateDir: string,
  reason: string,
): string {
  mkdirSync(store.quarantineDir, { recursive: true });
  const target = join(store.quarantineDir, `${Date.now()}-${reason}`);
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, "reason.txt"), reason);
  writeFileSync(
    join(target, "report.json"),
    JSON.stringify({ reason, at: new Date().toISOString() }),
  );
  if (existsSync(join(candidateDir, "manifest.json"))) {
    writeFileSync(
      join(target, "manifest.json"),
      readFileSync(join(candidateDir, "manifest.json")),
    );
  }
  return target;
}
