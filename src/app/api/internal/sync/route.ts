import { NextResponse } from "next/server";
import { env } from "@/platform/env";
import { WindowRateLimiter } from "@/platform/leads";
import {
  openSnapshotStore,
  verifySyncSignal,
  writeSyncSignal,
} from "@/platform/snapshot";

const limiter = new WindowRateLimiter(10, 60_000);

export async function POST(request: Request) {
  if (env.DATA_MODE === "local") {
    return NextResponse.json({ ok: false, code: "not_found" }, { status: 404 });
  }
  if (!env.SYNC_SIGNAL_SECRET) {
    return NextResponse.json(
      { ok: false, code: "unauthorized" },
      { status: 401 },
    );
  }
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  if (!limiter.allow(ip, new Date())) {
    return NextResponse.json(
      { ok: false, code: "rate_limit" },
      { status: 429 },
    );
  }
  const body = await request.text();
  try {
    verifySyncSignal({
      secret: env.SYNC_SIGNAL_SECRET,
      timestamp: request.headers.get("x-ams-timestamp"),
      signature: request.headers.get("x-ams-signature"),
      body,
    });
  } catch {
    return NextResponse.json(
      { ok: false, code: "unauthorized" },
      { status: 401 },
    );
  }
  if (!env.SNAPSHOT_STORE_DIR) {
    return NextResponse.json(
      { ok: false, code: "unconfigured" },
      { status: 503 },
    );
  }
  writeSyncSignal(openSnapshotStore(env.SNAPSHOT_STORE_DIR));
  return NextResponse.json({ ok: true, signal: true }, { status: 202 });
}
