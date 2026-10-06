import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { SnapshotStore } from "./store";

export type PendingAck = {
  publishSequence: number;
  attempts: number;
  updatedAt: string;
};

function ackPath(store: SnapshotStore, sequence: number): string {
  return join(store.pendingAckDir, `${sequence}.json`);
}

export function writePendingAck(
  store: SnapshotStore,
  sequence: number,
  attempts = 0,
): void {
  const previous = readPendingAck(store, sequence);
  const next: PendingAck = {
    publishSequence: sequence,
    attempts: previous ? previous.attempts + attempts : attempts,
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(ackPath(store, sequence), `${JSON.stringify(next)}\n`);
}

export function readPendingAck(
  store: SnapshotStore,
  sequence: number,
): PendingAck | null {
  const path = ackPath(store, sequence);
  if (!existsSync(path)) {
    return null;
  }
  return JSON.parse(readFileSync(path, "utf8")) as PendingAck;
}

export function listPendingAcks(store: SnapshotStore): PendingAck[] {
  if (!existsSync(store.pendingAckDir)) {
    return [];
  }
  return readdirSync(store.pendingAckDir)
    .filter((name) => name.endsWith(".json"))
    .map(
      (name) =>
        JSON.parse(
          readFileSync(join(store.pendingAckDir, name), "utf8"),
        ) as PendingAck,
    );
}

export function clearPendingAck(store: SnapshotStore, sequence: number): void {
  const path = ackPath(store, sequence);
  if (existsSync(path)) {
    rmSync(path);
  }
}

export function bumpPendingAck(store: SnapshotStore, sequence: number): void {
  const previous = readPendingAck(store, sequence);
  writeFileSync(
    ackPath(store, sequence),
    `${JSON.stringify({
      publishSequence: sequence,
      attempts: (previous?.attempts ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    } satisfies PendingAck)}\n`,
  );
}
