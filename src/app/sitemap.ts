import type { MetadataRoute } from "next";
import { buildAppSitemap } from "@/project/runtime";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildAppSitemap();
}
