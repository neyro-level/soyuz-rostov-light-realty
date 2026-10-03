import type { MetadataRoute } from "next";
import { env } from "@/platform/env";
import { sitemapAllowed } from "@/platform/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!sitemapAllowed(env.INDEXING_MODE)) {
    return [];
  }
  return [];
}
