import { existsSync, readdirSync } from "node:fs";
import { NextResponse } from "next/server";
import { env } from "@/platform/env";

export function GET() {
  const dir = env.LEAD_SPOOL_DIR;
  const leadSpoolPending =
    dir && existsSync(dir)
      ? readdirSync(dir).filter((name) => name.endsWith(".json")).length
      : 0;
  return NextResponse.json({
    ok: true,
    service: "lite",
    leadSpoolPending,
  });
}
