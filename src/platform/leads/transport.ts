import type { AppEnv } from "../env";
import { assertLeadSpoolKey } from "../env";
import { SmtpLeadSink } from "./smtp-sink";
import { FileLeadSpool } from "./spool";
import type { LeadSink } from "./types";
import { WebhookLeadSink } from "./webhook-sink";

let processSpool: FileLeadSpool | null = null;

export function resetProcessLeadSpool(): void {
  processSpool = null;
}

export function processLeadSpool(env: AppEnv): FileLeadSpool {
  if (!env.LEAD_SPOOL_KEY || !env.LEAD_SPOOL_DIR) {
    throw new Error("LEAD_SPOOL_KEY and LEAD_SPOOL_DIR are required");
  }
  if (!processSpool) {
    processSpool = new FileLeadSpool(
      env.LEAD_SPOOL_DIR,
      assertLeadSpoolKey(env.LEAD_SPOOL_KEY),
    );
  }
  return processSpool;
}

export function createLeadTransportSink(env: AppEnv): LeadSink | null {
  if (env.LEAD_TRANSPORT === "none") {
    return null;
  }
  if (env.LEAD_TRANSPORT === "smtp") {
    return SmtpLeadSink.create({
      host: env.SMTP_HOST ?? "",
      port: env.SMTP_PORT ?? 0,
      secure: env.SMTP_SECURE === true,
      user: env.SMTP_USER ?? "",
      pass: env.SMTP_PASS ?? "",
      from: env.SMTP_FROM ?? "",
    });
  }
  if (!env.LEAD_WEBHOOK_URL) {
    throw new Error("LEAD_WEBHOOK_URL is required when LEAD_TRANSPORT=webhook");
  }
  return new WebhookLeadSink(env.LEAD_WEBHOOK_URL, async (url, init) => {
    const response = await fetch(url, init);
    return { ok: response.ok };
  });
}
