import { buildHref, type FeatureFlags, type GrammarConfig } from "../grammar";
import type { SeoRegistryRow } from "../seo";
import type { NavItem } from "../ui";

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
): { title: string; items: NavItem[] } {
  const items: NavItem[] = [];
  for (const pageKey of group.pageKeys) {
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
