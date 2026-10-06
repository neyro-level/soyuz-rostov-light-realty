import type { Metadata } from "next";
import { toNextMetadata } from "@/platform/seo";
import { StarterPageShell } from "@/platform/ui";
import { resolveAppMetadata } from "@/project/runtime";
import { site } from "@/project/site.config";
import { uiText } from "@/project/ui-text.config";

export function generateMetadata(): Metadata {
  return toNextMetadata(resolveAppMetadata("notFound"));
}

export default function NotFound() {
  const resolved = resolveAppMetadata("notFound");
  return (
    <StarterPageShell
      breadcrumbs={[{ label: site.brand, href: "/" }]}
      lead={resolved.description}
      title={resolved.h1 || uiText.notFoundFallback}
    >
      <div data-testid="not-found-content">
        <a
          className="inline-flex min-h-11 items-center text-[var(--sr-primary)] underline-offset-4 hover:underline"
          href="/"
        >
          На главную
        </a>
      </div>
    </StarterPageShell>
  );
}
