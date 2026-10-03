export type IndexingMode = "staging" | "live";

export function buildRobotsTxt(indexingMode: IndexingMode): string {
  if (indexingMode === "staging") {
    return "User-agent: *\nDisallow: /\n";
  }
  return "User-agent: *\nAllow: /\n";
}

export function sitemapAllowed(indexingMode: IndexingMode): boolean {
  return indexingMode === "live";
}
