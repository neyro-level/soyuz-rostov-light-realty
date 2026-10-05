import { NextResponse } from "next/server";
import { env } from "@/platform/env";
import { SmtpLeadSink, submitLead, WindowRateLimiter } from "@/platform/leads";
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
  });
  if (!result.ok && result.code === "lead_transport_disabled") {
    return NextResponse.json(
      { code: "lead_transport_disabled" },
      { status: 503 },
    );
  }
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
  });
}
