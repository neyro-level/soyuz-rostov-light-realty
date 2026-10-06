import type { LeadDelivery, LeadSink } from "./types";

export class WebhookLeadSink implements LeadSink {
  constructor(
    private readonly url: string,
    private readonly post: (
      url: string,
      init: { method: string; headers: Record<string, string>; body: string },
    ) => Promise<{ ok: boolean }>,
  ) {}

  async deliver(delivery: LeadDelivery): Promise<void> {
    const response = await this.post(this.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        leadCapturedAt: delivery.capturedAt,
        pageKey: delivery.pageKey,
        consentAt: delivery.consentAt,
      }),
    });
    if (!response.ok) {
      throw new Error("webhook transport failed");
    }
  }
}
