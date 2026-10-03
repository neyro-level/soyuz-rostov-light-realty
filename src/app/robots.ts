import type { MetadataRoute } from "next";
import { env } from "@/platform/env";
import { buildRobotsTxt } from "@/platform/seo";

export default function robots(): MetadataRoute.Robots {
  const body = buildRobotsTxt(env.INDEXING_MODE);
  const disallowAll = body.includes("Disallow: /");
  return {
    rules: {
      userAgent: "*",
      allow: disallowAll ? undefined : "/",
      disallow: disallowAll ? "/" : undefined,
    },
  };
}
