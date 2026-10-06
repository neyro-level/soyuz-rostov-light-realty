import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCatalogSnapshot } from "@/platform/catalog/entities";
import { SnapshotRepository } from "@/platform/catalog/snapshot-repository";
import { env } from "@/platform/env";
import {
  buildSitemapEntries,
  type PageMetadataContext,
  parseSeoRegistryCsv,
  resolvePageMetadata,
} from "@/platform/seo";
import { data } from "./data.config";
import { features } from "./features.config";
import { grammar } from "./grammar.config";
import { seo } from "./seo.config";
import { seoVarsForPage } from "./seo-vars";
import { site } from "./site.config";

function revisionDir(): string {
  return data.fixtureDir;
}

export function getRealtyRepository(): SnapshotRepository {
  return SnapshotRepository.fromRevisionDir(process.cwd(), revisionDir());
}

export function loadSnapshot() {
  return loadCatalogSnapshot(process.cwd(), revisionDir());
}

export function loadRegistry() {
  return parseSeoRegistryCsv(
    readFileSync(
      join(/* turbopackIgnore: true */ process.cwd(), seo.registryPath),
      "utf8",
    ),
  );
}

export function metadataContext(): PageMetadataContext {
  return {
    siteUrl: site.siteUrl,
    indexingMode: env.INDEXING_MODE,
    grammar,
    features,
    registry: loadRegistry(),
    mapVars: seoVarsForPage,
    thresholds: {
      hideAfterDays: seo.priceHideAfterDays,
      failAfterDays: seo.priceGateFailAfterDays,
      developmentTextFailAfterDays: seo.developmentTextFailAfterDays,
    },
  };
}

export function resolveAppMetadata(
  pageKey: string,
  params: Record<string, string> = {},
) {
  return resolvePageMetadata(
    pageKey,
    params,
    loadSnapshot(),
    metadataContext(),
  );
}

export function buildAppSitemap() {
  return buildSitemapEntries(loadSnapshot(), metadataContext());
}
