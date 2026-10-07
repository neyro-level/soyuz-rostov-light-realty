import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { SnapshotRepository } from "@/platform/catalog/snapshot-repository";
import { type AppEnv, env } from "@/platform/env";
import {
  buildSitemapEntries,
  type PageMetadataContext,
  parseSeoRegistryCsv,
  resolvePageMetadata,
} from "@/platform/seo";
import {
  openSnapshotStore,
  readCurrentSequence,
  resolveCurrentRevisionDir,
} from "@/platform/snapshot";
import { data } from "./data.config";
import { features } from "./features.config";
import { grammar } from "./grammar.config";
import { seo } from "./seo.config";
import { seoVarsForPage } from "./seo-vars";
import { site } from "./site.config";

type CacheKey = string;

let cached: { key: CacheKey; repo: SnapshotRepository } | null = null;

function absolutePath(cwd: string, value: string): string {
  return isAbsolute(value) ? value : join(cwd, value);
}

export function resolveRevisionDir(
  appEnv: AppEnv = env,
  cwd = process.cwd(),
): { dir: string | null; key: CacheKey; ready: boolean } {
  if (appEnv.DATA_MODE === "snapshot") {
    if (appEnv.SNAPSHOT_STORE_DIR) {
      const store = openSnapshotStore(
        absolutePath(cwd, appEnv.SNAPSHOT_STORE_DIR),
      );
      const sequence = readCurrentSequence(store);
      const dir = resolveCurrentRevisionDir(store);
      if (!dir || sequence === null) {
        return { dir: null, key: `snapshot:empty:${store.root}`, ready: false };
      }
      return { dir, key: `snapshot:${store.root}:${sequence}`, ready: true };
    }
    if (appEnv.APP_ENV === "local") {
      const dir = absolutePath(cwd, data.fixtureDir);
      return { dir, key: `fixture:${dir}`, ready: true };
    }
    return { dir: null, key: "snapshot:unconfigured", ready: false };
  }

  if (appEnv.LOCAL_SNAPSHOT_DIR) {
    const localRoot = absolutePath(cwd, appEnv.LOCAL_SNAPSHOT_DIR);
    if (existsSync(join(localRoot, "CURRENT"))) {
      const store = openSnapshotStore(localRoot);
      const sequence = readCurrentSequence(store);
      const dir = resolveCurrentRevisionDir(store);
      if (!dir || sequence === null) {
        return { dir: null, key: `local:empty:${localRoot}`, ready: false };
      }
      return { dir, key: `local:${localRoot}:${sequence}`, ready: true };
    }
    if (existsSync(join(localRoot, "manifest.json"))) {
      return {
        dir: localRoot,
        key: `local-revision:${localRoot}`,
        ready: true,
      };
    }
    return { dir: null, key: `local:missing:${localRoot}`, ready: false };
  }

  const dir = absolutePath(cwd, data.fixtureDir);
  return { dir, key: `fixture:${dir}`, ready: true };
}

export function resetRepositoryCache(): void {
  cached = null;
}

export function loadRepository(
  appEnv: AppEnv = env,
  cwd = process.cwd(),
): SnapshotRepository {
  const resolved = resolveRevisionDir(appEnv, cwd);
  if (cached && cached.key === resolved.key) {
    return cached.repo;
  }
  const repo = resolved.dir
    ? SnapshotRepository.fromRevisionDir(
        isAbsolute(resolved.dir) ? resolved.dir : cwd,
        isAbsolute(resolved.dir) ? "." : resolved.dir,
        resolved.ready,
        {
          thresholds: {
            hideAfterDays: seo.priceHideAfterDays,
            failAfterDays: seo.priceGateFailAfterDays,
            developmentTextFailAfterDays: seo.developmentTextFailAfterDays,
          },
        },
      )
    : SnapshotRepository.empty();
  cached = { key: resolved.key, repo };
  return repo;
}

export function getRealtyRepository(): SnapshotRepository {
  return loadRepository();
}

export function metadataContext(): PageMetadataContext {
  const repo = getRealtyRepository();
  return {
    siteUrl: site.siteUrl,
    indexingMode: env.INDEXING_MODE,
    grammar,
    features,
    registry: loadRegistry(),
    catalogReady: repo.hasCatalog(),
    mapVars: seoVarsForPage,
    thresholds: {
      hideAfterDays: seo.priceHideAfterDays,
      failAfterDays: seo.priceGateFailAfterDays,
      developmentTextFailAfterDays: seo.developmentTextFailAfterDays,
    },
    noindexAutoPageKeys: seo.noindexAutoPageKeys,
    listingIndexMinCount: seo.listingIndexMinCount,
  };
}

export function loadRegistry() {
  return parseSeoRegistryCsv(
    readFileSync(
      join(/* turbopackIgnore: true */ process.cwd(), seo.registryPath),
      "utf8",
    ),
  );
}

export function resolveAppMetadata(
  pageKey: string,
  params: Record<string, string> = {},
) {
  const repo = getRealtyRepository();
  return resolvePageMetadata(
    pageKey,
    params,
    repo.catalogSnapshot(),
    metadataContext(),
  );
}

export function buildAppSitemap() {
  const repo = getRealtyRepository();
  return buildSitemapEntries(repo.catalogSnapshot(), metadataContext());
}
