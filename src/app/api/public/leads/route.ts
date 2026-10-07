import { NextResponse } from "next/server";
import { env } from "@/platform/env";
import {
  createLeadTransportSink,
  processLeadSpool,
  submitLead,
  WindowRateLimiter,
} from "@/platform/leads";
import { lead } from "@/project/lead.config";

const limiter = new WindowRateLimiter(
  lead.rateLimitMax,
  lead.rateLimitWindowMs,
);

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  const transport = env.LEAD_TRANSPORT;
  const sink = createLeadTransportSink(env);
  const result = await submitLead(payload, {
    ip,
    now: new Date(),
    destinationEmail: lead.destinationEmail,
    mode: env.LEADS_ROUTE,
    transport,
    sink: sink ?? undefined,
    limiter,
    spool: transport === "none" ? undefined : processLeadSpool(env),
  });
  if (!result.ok) {
    const status =
      result.code === "rate_limit"
        ? 429
        : result.code === "consent" || result.code === "validation"
          ? 400
          : 503;
    return NextResponse.json({ ok: false, code: result.code }, { status });
  }
  return NextResponse.json({
    ok: true,
    captured: result.captured,
    leadId: result.captured ? result.leadId : undefined,
  });
}
