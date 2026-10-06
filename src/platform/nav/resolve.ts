import { buildHref, type FeatureFlags, type GrammarConfig } from "../grammar";
import type { SeoRegistryRow } from "../seo";
export type NavItem = {
  label: string;
  href: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export type NavGroupConfig = {
  title: string;
  pageKeys: string[];
  includeNoindex?: boolean;
};

function isNoindex(robots: string): boolean {
  return robots.toLowerCase().includes("noindex");
}

export function resolveNavGroup(
  group: NavGroupConfig,
  grammar: GrammarConfig,
  flags: FeatureFlags,
  registry: SeoRegistryRow[],
  labels: Record<string, string>,
): NavGroup {
  const items: NavItem[] = [];
  for (const pageKey of group.pageKeys) {
    if (!grammar.routes.some((route) => route.pageKey === pageKey)) {
      continue;
    }
    const href = buildHref(grammar, flags, pageKey);
    if (!href) {
      continue;
    }
    const row = registry.find((item) => item.pageKey === pageKey);
    if (!group.includeNoindex && row && isNoindex(row.robotsDefault)) {
      continue;
    }
    items.push({
      label: labels[pageKey] ?? pageKey,
      href,
    });
  }
  return { title: group.title, items };
}
