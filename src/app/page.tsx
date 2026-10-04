import type { Metadata } from "next";
import { resolvePageMetadata, toNextMetadata } from "@/platform/seo";
import { loadSnapshot, metadataContext } from "@/project/runtime";
import { SitePage } from "./site-page";

export function generateMetadata(): Metadata {
  const resolved = resolvePageMetadata(
    "home",
    {},
    loadSnapshot(),
    metadataContext(),
  );
  return toNextMetadata(resolved);
}

export default function Home() {
  return <SitePage pageKey="home" />;
}
