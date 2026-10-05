import { site } from "./site.config";

export const lead = {
  route: "direct" as const,
  mode: "direct" as const,
  sinkKind: "mock" as const,
  destinationEmail: site.email,
  rateLimitMax: 8,
  rateLimitWindowMs: 60_000,
};
