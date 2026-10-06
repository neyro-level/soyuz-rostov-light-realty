export const REQUIRED_DATASET_KINDS = [
  "inventory",
  "agents",
  "contacts",
  "developments",
  "geo",
  "media",
  "urls",
  "redirects",
  "lifecycle",
] as const;

export const QUARANTINE_RATIO_THRESHOLD = 0.005;
export const DEFAULT_LOCK_TTL_MS = 30_000;
