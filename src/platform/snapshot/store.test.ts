import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  acquireLock,
  consumeSyncSignal,
  openSnapshotStore,
  pruneRevisions,
  releaseLock,
  writeSyncSignal,
} from "./store";

describe("snapshot store lock and prune", () => {
  it("rejects a second exclusive lock", () => {
    const root = mkdtempSync(join(tmpdir(), "sz-lock-"));
    const store = openSnapshotStore(root);
    acquireLock(store, 60_000);
    expect(() => acquireLock(store, 60_000)).toThrow(/concurrent apply/);
    releaseLock(store);
  });

  it("keeps current and previous revisions and removes tmp", () => {
    const root = mkdtempSync(join(tmpdir(), "sz-prune-"));
    const store = openSnapshotStore(root);
    for (const name of ["1", "2", "3", "4.tmp"]) {
      const dir = join(store.revisionsDir, name);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "manifest.json"), "{}");
    }
    writeFileSync(store.currentPointerPath, "3\n");
    pruneRevisions(store, 2);
    expect(existsSync(join(store.revisionsDir, "3"))).toBe(true);
    expect(existsSync(join(store.revisionsDir, "2"))).toBe(true);
    expect(existsSync(join(store.revisionsDir, "1"))).toBe(false);
    expect(existsSync(join(store.revisionsDir, "4.tmp"))).toBe(false);
  });

  it("consumes a sync signal marker", () => {
    const root = mkdtempSync(join(tmpdir(), "sz-signal-"));
    const store = openSnapshotStore(root);
    expect(consumeSyncSignal(store)).toBe(false);
    writeSyncSignal(store);
    expect(consumeSyncSignal(store)).toBe(true);
    expect(consumeSyncSignal(store)).toBe(false);
  });
});
