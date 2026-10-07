import { existsSync, readdirSync } from "node:fs";
import { NextResponse } from "next/server";
import { env } from "@/platform/env";
import {
  listPendingAcks,
  openSnapshotStore,
  readCurrentSequence,
  readLastSyncSuccess,
  resolveCurrentRevisionDir,
} from "@/platform/snapshot";

export function GET() {
  const dir = env.LEAD_SPOOL_DIR;
  const leadSpoolPending =
    dir && existsSync(dir)
      ? readdirSync(dir).filter((name) => name.endsWith(".json")).length
      : 0;
  let publishSequence: number | null = null;
  let snapshotAgeSec: number | null = null;
  let lastSuccessfulSync: string | null = null;
  let pendingAck = 0;
  let degraded = false;
  if (env.SNAPSHOT_STORE_DIR) {
    const store = openSnapshotStore(env.SNAPSHOT_STORE_DIR);
    publishSequence = readCurrentSequence(store);
    const revision = resolveCurrentRevisionDir(store);
    lastSuccessfulSync = readLastSyncSuccess(store);
    pendingAck = listPendingAcks(store).length;
    if (!revision || publishSequence === null) {
      degraded = true;
    } else if (lastSuccessfulSync) {
      const at = Date.parse(lastSuccessfulSync);
      if (Number.isFinite(at)) {
        snapshotAgeSec = Math.max(0, Math.round((Date.now() - at) / 1000));
      }
    }
  } else if (env.DATA_MODE === "snapshot") {
    degraded = true;
  }
  return NextResponse.json({
    status: degraded ? "degraded" : "ok",
    ok: !degraded,
    publishSequence,
    snapshotAgeSec,
    lastSuccessfulSync,
    pendingAck,
    leadSpoolPending,
  });
}
