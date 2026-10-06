import { randomBytes } from "node:crypto";
import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  FileLeadSpool,
  flushLeadSpool,
  MemoryLeadSink,
  SmtpLeadSink,
  submitLead,
  WebhookLeadSink,
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

function makeSpool() {
  const dir = mkdtempSync(join(tmpdir(), "sz-lead-"));
  return {
    dir,
    spool: new FileLeadSpool(dir, randomBytes(32)),
  };
}

async function main() {
  const limiter = new WindowRateLimiter(
    lead.rateLimitMax,
    lead.rateLimitWindowMs,
  );
  const noneSink = new MemoryLeadSink();
  const noneSpool = makeSpool().spool;
  const phone = "+79885552027";
  const none = await submitLead(
    {
      name: "Test",
      phone,
      consent: true,
      pageKey: "contacts",
    },
    {
      ip: "test-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.route,
      transport: "none",
      sink: noneSink,
      limiter,
      spool: noneSpool,
    },
  );
  check("none-allowed", none.ok && none.captured === true);
  check("none-has-leadId", none.ok && none.captured && none.leadId.length > 0);
  check("none-does-not-call-sink", noneSink.deliveries.length === 0);
  check("none-keeps-spool", noneSpool.pendingCount() === 1);
  check("pii-encrypted-at-rest", !noneSpool.ciphertextContains(phone));

  const smtpSink = SmtpLeadSink.jsonTransport("noreply@example.com");
  const smtpSpool = makeSpool().spool;
  const smtp = await submitLead(
    {
      name: "Test",
      phone,
      consent: true,
      pageKey: "contacts",
    },
    {
      ip: "test-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.route,
      transport: "smtp",
      sink: smtpSink,
      limiter,
      spool: smtpSpool,
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
  check("smtp-clears-spool", smtpSpool.pendingCount() === 0);
  check("leads-route-direct", lead.route === "direct");

  const noConsent = await submitLead(
    { name: "Test", phone, consent: false },
    {
      ip: "test-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.route,
      transport: "none",
      sink: noneSink,
      limiter,
      spool: makeSpool().spool,
    },
  );
  check("consent-required", !noConsent.ok && noConsent.code === "consent");

  const honeypotSpool = makeSpool();
  const honeypot = await submitLead(
    {
      name: "Bot",
      phone,
      consent: true,
      website: "https://spam.example",
      pageKey: "contacts",
    },
    {
      ip: "honeypot-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.route,
      transport: "none",
      sink: noneSink,
      limiter,
      spool: honeypotSpool.spool,
    },
  );
  check(
    "honeypot-silent-success",
    honeypot.ok &&
      honeypot.captured === false &&
      honeypot.reason === "honeypot",
  );
  check("honeypot-skips-spool", honeypotSpool.spool.pendingCount() === 0);

  const invalid = await submitLead(
    { name: "A", phone: "not-a-phone", consent: true },
    {
      ip: "validation-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.route,
      transport: "none",
      sink: noneSink,
      limiter,
      spool: makeSpool().spool,
    },
  );
  check("validation-reject", !invalid.ok && invalid.code === "validation");

  const rateLimiter = new WindowRateLimiter(2, lead.rateLimitWindowMs);
  const rateSpool = makeSpool().spool;
  const rateNow = new Date("2026-10-03T12:00:00.000Z");
  for (let index = 0; index < 2; index += 1) {
    await submitLead(
      {
        name: "Rate",
        phone: `+7988555203${index}`,
        consent: true,
        pageKey: "contacts",
      },
      {
        ip: "rate-ip",
        now: rateNow,
        destinationEmail: lead.destinationEmail,
        mode: lead.route,
        transport: "none",
        sink: noneSink,
        limiter: rateLimiter,
        spool: rateSpool,
      },
    );
  }
  const rateLimited = await submitLead(
    {
      name: "Rate",
      phone: "+79885552039",
      consent: true,
      pageKey: "contacts",
    },
    {
      ip: "rate-ip",
      now: rateNow,
      destinationEmail: lead.destinationEmail,
      mode: lead.route,
      transport: "none",
      sink: noneSink,
      limiter: rateLimiter,
      spool: rateSpool,
    },
  );
  check(
    "rate-limit-reject",
    !rateLimited.ok && rateLimited.code === "rate_limit",
  );

  const second = await submitLead(
    {
      name: "Other",
      phone: "+79885552028",
      consent: true,
      pageKey: "contacts",
    },
    {
      ip: "test-ip-2",
      now: new Date("2026-10-03T12:00:01.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.route,
      transport: "none",
      sink: noneSink,
      limiter,
      spool: makeSpool().spool,
    },
  );
  check(
    "leadId-unique",
    Boolean(
      none.ok &&
        none.captured &&
        second.ok &&
        second.captured &&
        none.leadId !== second.leadId,
    ),
  );

  let down = true;
  const mockSink = {
    async deliver() {
      if (down) {
        throw new Error("transport down");
      }
    },
  };
  const retrySpool = makeSpool().spool;
  const accepted = await submitLead(
    {
      name: "Retry",
      phone,
      consent: true,
      pageKey: "contacts",
    },
    {
      ip: "retry-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.route,
      transport: "smtp",
      sink: mockSink,
      limiter,
      spool: retrySpool,
    },
  );
  check(
    "spool-accepts-when-transport-down",
    accepted.ok && accepted.captured && retrySpool.pendingCount() === 1,
  );
  down = false;
  const later = new Date("2026-10-03T12:05:00.000Z");
  const delivered = await flushLeadSpool(retrySpool, mockSink, later);
  check(
    "retry-delivers-once",
    delivered === 1 && retrySpool.pendingCount() === 0,
  );
  const duplicateFlush = await flushLeadSpool(retrySpool, mockSink, later);
  check("duplicate-delivery-protected", duplicateFlush === 0);

  const atomic = makeSpool();
  await submitLead(
    {
      name: "Atomic",
      phone,
      consent: true,
      pageKey: "contacts",
    },
    {
      ip: "atomic-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.route,
      transport: "none",
      sink: noneSink,
      limiter,
      spool: atomic.spool,
    },
  );
  check(
    "spool-atomic-no-tmp",
    !readdirSync(atomic.dir).some((name) => name.endsWith(".tmp")),
  );
  check("spool-persists-encrypted-file", atomic.spool.pendingCount() === 1);

  let posts = 0;
  const webhook = new WebhookLeadSink(
    "https://example.test/leads",
    async () => {
      posts += 1;
      return { ok: true };
    },
  );
  const hookSpool = makeSpool().spool;
  const hooked = await submitLead(
    {
      name: "Hook",
      phone,
      consent: true,
      pageKey: "contacts",
    },
    {
      ip: "hook-ip",
      now: new Date("2026-10-03T12:00:00.000Z"),
      destinationEmail: lead.destinationEmail,
      mode: lead.route,
      transport: "webhook",
      sink: webhook,
      limiter,
      spool: hookSpool,
    },
  );
  check("webhook-adapter", hooked.ok && hooked.captured && posts === 1);

  if (failed) {
    process.exit(1);
  }
  console.log("verify:leads PASS");
}

void main();
