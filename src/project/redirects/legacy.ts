import type { LegacyRule } from "@/platform/seo";

export const legacyRules: LegacyRule[] = [
  {
    from: "/novostroyki-rostova/",
    status: 308,
    toPageKey: "catNovostroyki",
  },
  {
    from: "/kvartiry-rostova/",
    status: 308,
    toPageKey: "catKvartiry",
  },
  { from: "/blog/", status: 410, match: "prefix" },
  { from: "/stroitelstvo-domov/", status: 410, match: "exact" },
  { from: "/otzyvy/", status: 410, match: "exact" },
];
