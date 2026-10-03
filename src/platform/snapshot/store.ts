import {
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
  currentDir: string;
  lastGoodDir: string;
  quarantineDir: string;
  stagingDir: string;
  lockPath: string;
};

export function openSnapshotStore(root: string): SnapshotStore {
  mkdirSync(root, { recursive: true });
  return {
    root,
    currentDir: join(root, "current"),
    lastGoodDir: join(root, "last-good"),
    quarantineDir: join(root, "quarantine"),
    stagingDir: join(root, "staging"),
    lockPath: join(root, "apply.lock"),
  };
}

export function readCurrentManifest(
  store: SnapshotStore,
): SnapshotManifest | null {
  const path = join(store.currentDir, "manifest.json");
  if (!existsSync(path)) {
    return null;
  }
  return JSON.parse(readFileSync(path, "utf8")) as SnapshotManifest;
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

function replaceDir(from: string, to: string): void {
  if (existsSync(to)) {
    rmSync(to, { recursive: true, force: true });
  }
  renameSync(from, to);
}

export function activateStaging(store: SnapshotStore): void {
  if (!existsSync(join(store.stagingDir, "manifest.json"))) {
    throw new Error("activation failure");
  }
  if (existsSync(store.currentDir)) {
    replaceDir(store.currentDir, store.lastGoodDir);
  }
  try {
    replaceDir(store.stagingDir, store.currentDir);
  } catch (error) {
    if (existsSync(store.lastGoodDir) && !existsSync(store.currentDir)) {
      replaceDir(store.lastGoodDir, store.currentDir);
    }
    throw error;
  }
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
