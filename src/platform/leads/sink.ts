import type { LeadDelivery, LeadSink } from "./types";

export class MemoryLeadSink implements LeadSink {
  readonly deliveries: LeadDelivery[] = [];

  async deliver(delivery: LeadDelivery): Promise<void> {
    this.deliveries.push(delivery);
  }
}

export class WindowRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  allow(ip: string, now: Date): boolean {
    const t = now.getTime();
    const recent = (this.hits.get(ip) ?? []).filter(
      (stamp) => t - stamp < this.windowMs,
    );
    if (recent.length >= this.max) {
      this.hits.set(ip, recent);
      return false;
    }
    recent.push(t);
    this.hits.set(ip, recent);
    return true;
  }
}
