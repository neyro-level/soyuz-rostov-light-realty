import type { MetadataRoute } from "next";
import type { CatalogSnapshot } from "../catalog/entities";
import {
  findDeveloper,
  findProperty,
  propertySemantic,
} from "../catalog/entities";
import { buildHref, isFeatureEnabled } from "../grammar";
import {
  isSitemapUrl,
  type PageMetadataContext,
  resolvePageMetadata,
} from "./resolve-page-metadata";
import { sitemapAllowed } from "./robots";

export function buildSitemapEntries(
  snapshot: CatalogSnapshot,
  context: PageMetadataContext,
): MetadataRoute.Sitemap {
  if (!sitemapAllowed(context.indexingMode)) {
    return [];
  }
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  const push = (pageKey: string, params: Record<string, string> = {}) => {
    const href = buildHref(context.grammar, context.features, pageKey, params);
    if (!href) {
      return;
    }
    const resolved = resolvePageMetadata(pageKey, params, snapshot, context);
    if (!isSitemapUrl(resolved)) {
      return;
    }
    if (seen.has(resolved.canonical)) {
      return;
    }
    seen.add(resolved.canonical);
    entries.push({ url: resolved.canonical });
  };

  for (const route of context.grammar.routes) {
    if (!isFeatureEnabled(context.features, route.feature)) {
      continue;
    }
    if (route.pageKey === "developer") {
      for (const developer of snapshot.developers) {
        if (findDeveloper(snapshot, developer.slug)) {
          push("developer", { slug: developer.slug });
        }
      }
      continue;
    }
    if (route.pageKey === "development") {
      for (const development of snapshot.developments) {
        if (development.publicUrlId) {
          push("development", { slug: development.publicUrlId });
        }
      }
      continue;
    }
    if (route.pageKey === "property") {
      for (const listing of snapshot.inventory) {
        if (findProperty(snapshot, listing.publicUrlId)) {
          push("property", {
            semantic: propertySemantic(listing),
            id: listing.publicUrlId,
          });
        }
      }
      continue;
    }
    push(route.pageKey);
  }
  return entries;
}
