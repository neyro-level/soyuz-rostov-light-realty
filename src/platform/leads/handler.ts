import { createLeadId } from "./spool";
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
  if (!context.sink || !context.spool) {
    return { ok: false, code: "sink" };
  }
  const capturedAt = context.now.toISOString();
  const leadId = createLeadId();
  const delivery = {
    leadId,
    to: context.destinationEmail,
    subject: "lead",
    capturedAt,
    pageKey: submission.pageKey,
    publicUrlId: submission.publicUrlId,
    name: submission.name,
    phone: submission.phone,
    consentAt: capturedAt,
  };
  context.spool.write({
    leadId,
    status: "pending",
    attempts: 0,
    updatedAt: capturedAt,
    delivery,
  });
  try {
    await context.sink.deliver(delivery);
    context.spool.remove(leadId);
  } catch {
    context.spool.write({
      leadId,
      status: "failed-retryable",
      attempts: 1,
      updatedAt: capturedAt,
      delivery,
    });
  }
  return { ok: true, captured: true, leadId };
}
