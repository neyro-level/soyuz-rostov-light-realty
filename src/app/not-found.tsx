import type { Metadata } from "next";
import { resolvePageMetadata, toNextMetadata } from "@/platform/seo";
import { PageBlock } from "@/platform/ui";
import { loadSnapshot, metadataContext } from "@/project/runtime";
import { uiText } from "@/project/ui-text.config";

export function generateMetadata(): Metadata {
  return toNextMetadata(
    resolvePageMetadata("notFound", {}, loadSnapshot(), metadataContext()),
  );
}

export default function NotFound() {
  const resolved = resolvePageMetadata(
    "notFound",
    {},
    loadSnapshot(),
    metadataContext(),
  );
  return (
    <PageBlock
      body={resolved.description}
      heading={resolved.h1 || uiText.notFoundFallback}
    />
  );
}
