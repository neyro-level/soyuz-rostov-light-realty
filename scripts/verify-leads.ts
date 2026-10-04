import {
  MemoryLeadSink,
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
  const sink = new MemoryLeadSink();
  const limiter = new WindowRateLimiter(
    lead.rateLimitMax,
    lead.rateLimitWindowMs,
  );
  const ctx = {
    ip: "test-ip",
    now: new Date("2026-10-03T12:00:00.000Z"),
    destinationEmail: lead.destinationEmail,
    mode: lead.mode,
    sink,
    limiter,
  };

  const captured = await submitLead(
    {
      name: "Тест",
      phone: "+79885552027",
      consent: true,
      pageKey: "contacts",
    },
    ctx,
  );
  check(
    "test-lead-captured-in-sink",
    captured.ok && captured.captured === true && sink.deliveries.length === 1,
  );
  check(
    "sink-destination-from-site-config",
    sink.deliveries[0]?.to === lead.destinationEmail,
  );
  check("leads-mode-direct", lead.mode === "direct");
  check("mock-sink-no-production-mailbox", lead.sinkKind === "mock");

  const noConsent = await submitLead(
    { name: "Тест", phone: "+79885552027", consent: false },
    ctx,
  );
  check(
    "consent-required",
    !noConsent.ok &&
      noConsent.code === "consent" &&
      sink.deliveries.length === 1,
  );

  const honeypot = await submitLead(
    {
      name: "Тест",
      phone: "+79885552027",
      consent: true,
      website: "http://spam.example",
    },
    ctx,
  );
  check(
    "honeypot-not-captured",
    honeypot.ok && honeypot.captured === false && sink.deliveries.length === 1,
  );

  if (failed) {
    process.exit(1);
  }
  console.log("verify:leads PASS");
}

void main();
