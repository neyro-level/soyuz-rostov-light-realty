export type LeadRoute = "direct";
export type LeadMode = LeadRoute;

export type LeadSubmission = {
  name: string;
  phone: string;
  consent: boolean;
  pageKey?: string;
  publicUrlId?: string;
  website?: string;
};

export type LeadDelivery = {
  leadId: string;
  to: string;
  subject: string;
  capturedAt: string;
  pageKey?: string;
  publicUrlId?: string;
  name: string;
  phone: string;
  consentAt: string;
};

export type LeadSink = {
  deliver(delivery: LeadDelivery): Promise<void>;
};

export type LeadTransport = "none" | "smtp" | "webhook";

export type LeadResult =
  | { ok: true; captured: true; leadId: string }
  | { ok: true; captured: false; reason: "honeypot" }
  | {
      ok: false;
      code:
        | "consent"
        | "validation"
        | "rate_limit"
        | "sink"
        | "lead_transport_disabled";
    };

export type LeadSpoolStatus = "pending" | "delivered" | "failed-retryable";

export type LeadSpoolRecord = {
  leadId: string;
  status: LeadSpoolStatus;
  attempts: number;
  updatedAt: string;
  delivery: LeadDelivery;
};

export type LeadSpool = {
  write(record: LeadSpoolRecord): void;
  read(leadId: string): LeadSpoolRecord | null;
  listPending(): LeadSpoolRecord[];
  pendingCount(): number;
  remove(leadId: string): void;
};

export type LeadSubmitContext = {
  ip: string;
  now: Date;
  destinationEmail: string;
  mode: LeadMode;
  transport: LeadTransport;
  sink?: LeadSink;
  limiter: RateLimiter;
  spool?: LeadSpool;
};

export type RateLimiter = {
  allow(ip: string, now: Date): boolean;
};
