export type IndexingMode = "private" | "staging" | "public";

export function buildRobotsTxt(indexingMode: IndexingMode): string {
  if (indexingMode === "public") {
    return "User-agent: *\nAllow: /\n";
  }
  return "User-agent: *\nDisallow: /\n";
}

export function sitemapAllowed(indexingMode: IndexingMode): boolean {
  return indexingMode === "public";
}
