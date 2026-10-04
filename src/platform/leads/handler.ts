import type { LeadResult, LeadSubmitContext } from "./types";
import { parseLeadSubmission } from "./validate";

export async function submitLead(
  input: unknown,
  context: LeadSubmitContext,
): Promise<LeadResult> {
  if (context.mode !== "direct") {
    return { ok: false, code: "sink" };
  }
  const parsed = parseLeadSubmission(input);
  if (!parsed.ok) {
    return { ok: false, code: "validation" };
  }
  const submission = parsed.value;
  if (submission.website && submission.website.trim() !== "") {
    return { ok: true, captured: false, reason: "honeypot" };
  }
  if (!submission.consent) {
    return { ok: false, code: "consent" };
  }
  if (!context.limiter.allow(context.ip, context.now)) {
    return { ok: false, code: "rate_limit" };
  }
  if (context.transport === "none") {
    return { ok: false, code: "lead_transport_disabled" };
  }
  const capturedAt = context.now.toISOString();
  try {
    await context.sink.deliver({
      to: context.destinationEmail,
      subject: "lead",
      capturedAt,
      pageKey: submission.pageKey,
      name: submission.name,
      phone: submission.phone,
      consentAt: capturedAt,
    });
  } catch {
    return { ok: false, code: "sink" };
  }
  return { ok: true, captured: true };
}
