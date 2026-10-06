import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { buildHref, matchPath } from "@/platform/grammar";
import { toNextMetadata } from "@/platform/seo";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { getRealtyRepository, resolveAppMetadata } from "@/project/runtime";
import { SitePage } from "../site-page";

function hrefToSegments(href: string): string[] {
  return href
    .replace(/^\/|\/$/g, "")
    .split("/")
    .filter(Boolean);
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const repo = getRealtyRepository();
  const paths: Array<{ path: string[] }> = [];
  for (const route of grammar.routes) {
    if (route.pageKey === "home") {
      continue;
    }
    if (
      route.template.includes("{slug}") ||
      route.template.includes("{publicUrlId}") ||
      route.template.includes("{semantic}") ||
      route.template.includes("{id}")
    ) {
      continue;
    }
    const href = buildHref(grammar, features, route.pageKey);
    if (href && href !== "/") {
      paths.push({ path: hrefToSegments(href) });
    }
  }
  for (const item of await repo.listDevelopers()) {
    const href = buildHref(grammar, features, "developer", {
      slug: item.slug,
    });
    if (href) {
      paths.push({ path: hrefToSegments(href) });
    }
  }
  for (const item of await repo.listDevelopments()) {
    const href = buildHref(grammar, features, "development", {
      slug: item.slug,
    });
    if (href) {
      paths.push({ path: hrefToSegments(href) });
    }
  }
  for (const item of await repo.listAgents()) {
    const href = buildHref(grammar, features, "agent", {
      slug: item.slug,
    });
    if (href) {
      paths.push({ path: hrefToSegments(href) });
    }
  }
  for (const item of await repo.listProperties()) {
    const href = buildHref(grammar, features, "property", {
      slug: item.slug,
      publicUrlId: item.publicUrlId,
    });
    if (href) {
      paths.push({ path: hrefToSegments(href) });
    }
  }
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  const pathname = `/${path.join("/")}/`;
  const matched = matchPath(grammar, features, pathname);
  if (!matched) {
    notFound();
  }
  const repo = getRealtyRepository();
  if (matched.pageKey === "property") {
    const listing = await repo.getProperty(matched.params.publicUrlId ?? "");
    if (!listing) {
      notFound();
    }
    if (matched.params.slug !== listing.slug) {
      const href = buildHref(grammar, features, "property", {
        slug: listing.slug,
        publicUrlId: listing.publicUrlId,
      });
      if (href) {
        permanentRedirect(href);
      }
      notFound();
    }
  }
  if (
    matched.pageKey === "development" &&
    !(await repo.getDevelopment(matched.params.slug ?? ""))
  ) {
    notFound();
  }
  if (
    matched.pageKey === "developer" &&
    !(await repo.getDeveloper(matched.params.slug ?? ""))
  ) {
    notFound();
  }
  if (
    matched.pageKey === "agent" &&
    !(await repo.getAgent(matched.params.slug ?? ""))
  ) {
    notFound();
  }
  return toNextMetadata(resolveAppMetadata(matched.pageKey, matched.params));
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const pathname = `/${path.join("/")}/`;
  const matched = matchPath(grammar, features, pathname);
  if (!matched) {
    notFound();
  }
  return <SitePage pageKey={matched.pageKey} params={matched.params} />;
}
