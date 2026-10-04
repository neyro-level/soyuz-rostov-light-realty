export type LeadMode = "direct";

export type LeadSubmission = {
  name: string;
  phone: string;
  consent: boolean;
  pageKey?: string;
  website?: string;
};

export type LeadDelivery = {
  to: string;
  subject: string;
  capturedAt: string;
  pageKey?: string;
  name: string;
  phone: string;
  consentAt: string;
};

export type LeadSink = {
  deliver(delivery: LeadDelivery): Promise<void>;
};

export type LeadResult =
  | { ok: true; captured: true }
  | { ok: true; captured: false; reason: "honeypot" }
  | { ok: false; code: "consent" | "validation" | "rate_limit" | "sink" };

export type LeadSubmitContext = {
  ip: string;
  now: Date;
  destinationEmail: string;
  mode: LeadMode;
  sink: LeadSink;
  limiter: RateLimiter;
};

export type RateLimiter = {
  allow(ip: string, now: Date): boolean;
};
