import type { Metadata } from "next";
import { toNextMetadata } from "@/platform/seo";
import { PageBlock } from "@/platform/ui";
import { resolveAppMetadata } from "@/project/runtime";
import { uiText } from "@/project/ui-text.config";

export function generateMetadata(): Metadata {
  return toNextMetadata(resolveAppMetadata("notFound"));
}

export default function NotFound() {
  const resolved = resolveAppMetadata("notFound");
  return (
    <PageBlock
      body={resolved.description}
      heading={resolved.h1 || uiText.notFoundFallback}
    />
  );
}
