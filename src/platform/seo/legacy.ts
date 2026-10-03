import { buildHref, type FeatureFlags, type GrammarConfig } from "../grammar";

export type LegacyRedirect = {
  from: string;
  status: 301;
  toPageKey: string;
};

export type LegacyGone = {
  from: string;
  status: 410;
  match: "exact" | "prefix";
};

export type LegacyRule = LegacyRedirect | LegacyGone;

function normalizePath(pathname: string): string {
  if (pathname === "/") {
    return "/";
  }
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function matchLegacy(
  pathname: string,
  rules: LegacyRule[],
): LegacyRule | undefined {
  const path = normalizePath(pathname);
  for (const rule of rules) {
    if (rule.status === 301) {
      if (normalizePath(rule.from) === path) {
        return rule;
      }
      continue;
    }
    if (rule.match === "prefix") {
      if (path.startsWith(rule.from) || path === rule.from) {
        return rule;
      }
      continue;
    }
    if (normalizePath(rule.from) === path) {
      return rule;
    }
  }
  return undefined;
}

export function legacyLocation(
  rule: LegacyRule,
  grammar: GrammarConfig,
  flags: FeatureFlags,
): string | null {
  if (rule.status !== 301) {
    return null;
  }
  return buildHref(grammar, flags, rule.toPageKey);
}
