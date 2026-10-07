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
export const HTTP_FETCH_TIMEOUT_MS = 15_000;
export const HTTP_FETCH_MAX_BYTES = 32 * 1024 * 1024;
export const SYNC_TIMESTAMP_SKEW_MS = 5 * 60 * 1000;
export const DEFAULT_RESERVED_SLUGS = [
  "journal",
  "komanda",
  "ipoteka",
  "yurist",
  "about",
  "contacts",
  "vacancies",
  "politika",
  "soglasie",
  "search",
  "favorites",
  "novostroyki",
  "kvartiry",
] as const;
