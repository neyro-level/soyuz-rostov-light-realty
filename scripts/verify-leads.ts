import {
  MemoryLeadSink,
  SmtpLeadSink,
  submitLead,
  WindowRateLimiter,
} from "../src/platform/leads";
import { lead } from "../src/project/lead.config";

let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`PASS ${name}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
}

async function main() {
  const limiter = new WindowRateLimiter(
    lead.rateLimitMax,
    lead.rateLimitWindowMs,
  );
  const noneSink = new MemoryLeadSink();
  const none = await submitLead(
    {
      name: "Test",
      phone: "+79885552027",
      consent: true,
      pageKey: "contacts",
    },
    {
      ip: "test-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.mode,
      transport: "none",
      sink: noneSink,
      limiter,
    },
  );
  check(
    "none-returns-503-code",
    !none.ok && none.code === "lead_transport_disabled",
  );
  check("none-does-not-store", noneSink.deliveries.length === 0);

  const smtpSink = SmtpLeadSink.jsonTransport("noreply@example.com");
  const smtp = await submitLead(
    {
      name: "Test",
      phone: "+79885552027",
      consent: true,
      pageKey: "contacts",
    },
    {
      ip: "test-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.mode,
      transport: "smtp",
      sink: smtpSink,
      limiter,
    },
  );
  const raw =
    smtpSink.lastResult &&
    typeof smtpSink.lastResult === "object" &&
    "message" in smtpSink.lastResult
      ? String((smtpSink.lastResult as { message: string }).message)
      : "";
  check("smtp-captured", smtp.ok && smtp.captured === true);
  check("smtp-to-config-email", raw.includes(lead.destinationEmail));
  check("smtp-has-pageKey", raw.includes("pageKey=contacts"));
  check("smtp-has-consent", raw.includes("consent=true"));
  check("leads-mode-direct", lead.mode === "direct");

  const noConsent = await submitLead(
    { name: "Test", phone: "+79885552027", consent: false },
    {
      ip: "test-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.mode,
      transport: "none",
      sink: noneSink,
      limiter,
    },
  );
  check("consent-required", !noConsent.ok && noConsent.code === "consent");

  if (failed) {
    process.exit(1);
  }
  console.log("verify:leads PASS");
}

void main();
