import type { LegacyRule } from "@/platform/seo";

export const legacyRules: LegacyRule[] = [
  {
    from: "/novostroyki-krasnodar/",
    status: 308,
    toPageKey: "catNovostroyki",
  },
  { from: "/blog/", status: 410, match: "prefix" },
  { from: "/stroitelstvo-domov/", status: 410, match: "exact" },
  { from: "/otzyvy/", status: 410, match: "exact" },
];
