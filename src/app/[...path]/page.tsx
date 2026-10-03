import { notFound } from "next/navigation";
import {
  loadFixtureInventory,
  loadFixtureJson,
} from "@/platform/catalog/local";
import { buildHref, matchPath } from "@/platform/grammar";
import { data } from "@/project/data.config";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { SitePage } from "../site-page";

function hrefToSegments(href: string): string[] {
  return href
    .replace(/^\/|\/$/g, "")
    .split("/")
    .filter(Boolean);
}

export function generateStaticParams() {
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
  const developers = loadFixtureJson<Array<{ uid: string }>>(
    process.cwd(),
    data.fixtureDir,
    "developers.json",
  ).slice(0, 3);
  for (const item of developers) {
    const href = buildHref(grammar, features, "developer", { slug: item.uid });
    if (href) {
      paths.push({ path: hrefToSegments(href) });
    }
  }
  const developments = loadFixtureJson<Array<{ publicUrlId?: string }>>(
    process.cwd(),
    data.fixtureDir,
    "developments.json",
  ).slice(0, 3);
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
  for (const item of loadFixtureInventory(process.cwd(), data.fixtureDir).slice(
    0,
    3,
  )) {
    const rooms =
      "rooms" in item.facts && typeof item.facts.rooms === "number"
        ? item.facts.rooms
        : 1;
    const href = buildHref(grammar, features, "property", {
      semantic: `${rooms}k`,
      id: item.publicUrlId,
    });
    if (href) {
      paths.push({ path: hrefToSegments(href) });
    }
  }
  return paths;
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
