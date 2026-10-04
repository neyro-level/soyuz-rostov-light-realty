import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCatalogSnapshot } from "@/platform/catalog/entities";
import { env } from "@/platform/env";
import { type PageMetadataContext, parseSeoRegistryCsv } from "@/platform/seo";
import { data } from "./data.config";
import { features } from "./features.config";
import { grammar } from "./grammar.config";
import { seo } from "./seo.config";
import { seoVarsForPage } from "./seo-vars";
import { site } from "./site.config";

export function loadSnapshot() {
  return loadCatalogSnapshot(process.cwd(), data.fixtureDir);
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
