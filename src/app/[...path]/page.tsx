import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  findDeveloper,
  findDevelopment,
  findProperty,
  propertySemantic,
} from "@/platform/catalog/entities";
import {
  loadFixtureInventory,
  loadFixtureJson,
} from "@/platform/catalog/local";
import { buildHref, matchPath } from "@/platform/grammar";
import { resolvePageMetadata, toNextMetadata } from "@/platform/seo";
import { data } from "@/project/data.config";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { loadSnapshot, metadataContext } from "@/project/runtime";
import { SitePage } from "../site-page";

function hrefToSegments(href: string): string[] {
  return href
    .replace(/^\/|\/$/g, "")
    .split("/")
    .filter(Boolean);
}

export const dynamicParams = true;

export function generateStaticParams() {
  const snapshotRoot = process.cwd();
  const paths: Array<{ path: string[] }> = [];
  for (const route of grammar.routes) {
    if (route.pageKey === "home") {
      continue;
    }
    if (
      route.template.includes("{slug}") ||
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
  const developers = loadFixtureJson<Array<{ slug: string }>>(
    snapshotRoot,
    data.fixtureDir,
    "developers.json",
  );
  for (const item of developers) {
    const href = buildHref(grammar, features, "developer", {
      slug: item.slug,
    });
    if (href) {
      paths.push({ path: hrefToSegments(href) });
    }
  }
  const developments = loadFixtureJson<Array<{ publicUrlId?: string }>>(
    snapshotRoot,
    data.fixtureDir,
    "developments.json",
  );
  for (const item of developments) {
    if (!item.publicUrlId) {
      continue;
    }
    const href = buildHref(grammar, features, "development", {
      slug: item.publicUrlId,
    });
    if (href) {
      paths.push({ path: hrefToSegments(href) });
    }
  }
  for (const item of loadFixtureInventory(snapshotRoot, data.fixtureDir)) {
    const href = buildHref(grammar, features, "property", {
      semantic: propertySemantic(item),
      id: item.publicUrlId,
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
  const snapshot = loadSnapshot();
  if (matched.pageKey === "property") {
    const listing = findProperty(snapshot, matched.params.id);
    if (!listing) {
      notFound();
    }
    const canonicalSemantic = propertySemantic(listing);
    if (matched.params.semantic !== canonicalSemantic) {
      const href = buildHref(grammar, features, "property", {
        semantic: canonicalSemantic,
        id: listing.publicUrlId,
      });
      if (href) {
        permanentRedirect(href);
      }
      notFound();
    }
  }
  if (
    matched.pageKey === "development" &&
    !findDevelopment(snapshot, matched.params.slug)
  ) {
    notFound();
  }
  if (
    matched.pageKey === "developer" &&
    !findDeveloper(snapshot, matched.params.slug)
  ) {
    notFound();
  }
  return toNextMetadata(
    resolvePageMetadata(
      matched.pageKey,
      matched.params,
      snapshot,
      metadataContext(),
    ),
  );
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
