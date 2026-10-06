import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { env } from "@/platform/env";
import {
  FileLeadSpool,
  SmtpLeadSink,
  submitLead,
  WindowRateLimiter,
} from "@/platform/leads";
import { lead } from "@/project/lead.config";

const limiter = new WindowRateLimiter(
  lead.rateLimitMax,
  lead.rateLimitWindowMs,
);

function smtpSink() {
  return SmtpLeadSink.create({
    host: env.SMTP_HOST ?? "",
    port: env.SMTP_PORT ?? 0,
    secure: env.SMTP_SECURE === true,
    user: env.SMTP_USER ?? "",
    pass: env.SMTP_PASS ?? "",
    from: env.SMTP_FROM ?? "",
  });
}

function spoolFromEnv() {
  const key = env.LEAD_SPOOL_KEY
    ? Buffer.from(env.LEAD_SPOOL_KEY, "base64")
    : randomBytes(32);
  const dir = env.LEAD_SPOOL_DIR ?? join(tmpdir(), "souz-lead-spool");
  return new FileLeadSpool(dir, key.length === 32 ? key : randomBytes(32));
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  const transport = env.LEAD_TRANSPORT;
  const result = await submitLead(payload, {
    ip,
    now: new Date(),
    destinationEmail: lead.destinationEmail,
    mode: env.LEADS_ROUTE,
    transport,
    sink:
      transport === "smtp" ? smtpSink() : { deliver: async () => undefined },
    limiter,
    spool: spoolFromEnv(),
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
