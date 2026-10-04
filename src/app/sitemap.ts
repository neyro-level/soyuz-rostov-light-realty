import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/platform/seo";
import { loadSnapshot, metadataContext } from "@/project/runtime";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(loadSnapshot(), metadataContext());
}
