export { submitLead } from "./handler";
export { MemoryLeadSink, WindowRateLimiter } from "./sink";
export { SmtpLeadSink } from "./smtp-sink";
export { createLeadId, FileLeadSpool, flushLeadSpool } from "./spool";
export {
  createLeadTransportSink,
  processLeadSpool,
  resetProcessLeadSpool,
} from "./transport";
export type {
  LeadDelivery,
  LeadMode,
  LeadResult,
  LeadRoute,
  LeadSink,
  LeadSpool,
  LeadSpoolRecord,
  LeadSpoolStatus,
  LeadSubmission,
  LeadSubmitContext,
  LeadTransport,
  RateLimiter,
} from "./types";
export { parseLeadSubmission } from "./validate";
export { WebhookLeadSink } from "./webhook-sink";
