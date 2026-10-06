/** H3 catalog entry routes (geo hub, category hubs, districts). */
export const H3_CATALOG_ENTRY_PAGE_KEYS = [
  "geoHub",
  "catNovostroyki",
  "catKvartiry",
  "facetVtorichka",
  "distLeninskiy",
  "distVoroshilovskiy",
  "distSevernyy",
  "distTsentr",
] as const;

export type H3CatalogEntryPageKey = (typeof H3_CATALOG_ENTRY_PAGE_KEYS)[number];

export function isH3CatalogEntryPageKey(
  pageKey: string,
): pageKey is H3CatalogEntryPageKey {
  return (H3_CATALOG_ENTRY_PAGE_KEYS as readonly string[]).includes(pageKey);
}

export function isDevelopmentCatalogEntry(pageKey: string): boolean {
  return (
    pageKey === "geoHub" ||
    pageKey === "catNovostroyki" ||
    pageKey.startsWith("dist")
  );
}
