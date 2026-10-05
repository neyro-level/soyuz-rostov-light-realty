export { submitLead } from "./handler";
export { MemoryLeadSink, WindowRateLimiter } from "./sink";
export { SmtpLeadSink } from "./smtp-sink";
export type {
  LeadDelivery,
  LeadMode,
  LeadRoute,
  LeadResult,
  LeadSink,
  LeadSubmission,
  LeadSubmitContext,
  LeadTransport,
  RateLimiter,
} from "./types";
export { parseLeadSubmission } from "./validate";
