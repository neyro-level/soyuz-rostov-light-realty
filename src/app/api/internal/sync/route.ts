import { NextResponse } from "next/server";
import { WindowRateLimiter } from "@/platform/leads";
import { parseSyncTrigger } from "@/platform/snapshot";

const limiter = new WindowRateLimiter(10, 60_000);

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  if (!limiter.allow(ip, new Date())) {
    return NextResponse.json(
      { ok: false, code: "rate_limit" },
      { status: 429 },
    );
  }
  const payload = await request.json().catch(() => null);
  try {
    parseSyncTrigger(payload);
  } catch {
    return NextResponse.json(
      { ok: false, code: "signal_only" },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, signal: true }, { status: 202 });
}
