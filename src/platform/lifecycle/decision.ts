export type PublicLifecycle =
  | "VISIBLE"
  | "ARCHIVED_VISIBLE"
  | "REDIRECTED"
  | "GONE";

export type LifecycleDecision = {
  status: 200 | 308 | 410 | 404;
  robots?: { index: boolean; follow: boolean };
  location?: string;
};

const ALIASES: Record<string, PublicLifecycle> = {
  VISIBLE: "VISIBLE",
  active: "VISIBLE",
  ARCHIVED_VISIBLE: "ARCHIVED_VISIBLE",
  hidden: "ARCHIVED_VISIBLE",
  REDIRECTED: "REDIRECTED",
  redirected: "REDIRECTED",
  GONE: "GONE",
  departed: "GONE",
};

export function normalizeLifecycle(raw?: string | null): PublicLifecycle {
  if (!raw) {
    return "VISIBLE";
  }
  return ALIASES[raw] ?? "VISIBLE";
}

export function isPubliclyListed(lifecycle?: string | null): boolean {
  const normalized = normalizeLifecycle(lifecycle);
  return normalized === "VISIBLE" || normalized === "ARCHIVED_VISIBLE";
}

export function decideEntityLifecycle(input: {
  missing: boolean;
  lifecycle?: string | null;
  requestSlug?: string;
  canonicalSlug?: string;
  slugHistory?: string[];
  canonicalHref?: string | null;
  redirectHref?: string | null;
}): LifecycleDecision {
  if (input.missing) {
    return { status: 404 };
  }
  if (
    input.requestSlug &&
    input.canonicalSlug &&
    input.requestSlug !== input.canonicalSlug &&
    input.canonicalHref
  ) {
    const historic = input.slugHistory ?? [];
    if (
      historic.length === 0 ||
      historic.includes(input.requestSlug) ||
      historic.includes(`zhk-${input.requestSlug}`)
    ) {
      return { status: 308, location: input.canonicalHref };
    }
  }
  const lifecycle = normalizeLifecycle(input.lifecycle);
  if (lifecycle === "GONE") {
    return { status: 410 };
  }
  if (lifecycle === "REDIRECTED") {
    const location = input.redirectHref ?? input.canonicalHref;
    if (location) {
      return { status: 308, location };
    }
    return { status: 410 };
  }
  if (lifecycle === "ARCHIVED_VISIBLE") {
    return { status: 200, robots: { index: false, follow: true } };
  }
  return { status: 200 };
}
