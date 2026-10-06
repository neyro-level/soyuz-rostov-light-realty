import type { Metadata } from "next";
import Link from "next/link";
import { toNextMetadata } from "@/platform/seo";
import { StarterPageShell } from "@/platform/ui";
import { homeHref } from "@/project/home-href";
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
      breadcrumbs={[{ label: site.brand, href: homeHref }]}
      lead={resolved.description}
      title={resolved.h1 || uiText.notFoundFallback}
    >
      <div data-testid="not-found-content">
        <Link
          className="inline-flex min-h-11 items-center text-[var(--sr-primary)] underline-offset-4 hover:underline"
          href={homeHref}
        >
          {uiText.appShell.homeLinkLabel}
        </Link>
      </div>
    </StarterPageShell>
  );
}
