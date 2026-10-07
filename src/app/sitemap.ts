import type { MetadataRoute } from "next";
import { buildAppSitemap } from "@/project/runtime";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildAppSitemap();
}
