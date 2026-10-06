import { grammar as altGrammar } from "../fixtures/fixture-alt/project/grammar.config";
import {
  assertNoCollisions,
  buildUrl,
  parseUrl,
} from "../src/platform/grammar";
import { features } from "../src/project/features.config";
import { grammar } from "../src/project/grammar.config";

function fail(message: string) {
  console.error(message);
  process.exitCode = 1;
}

const sampleParams = {
  slug: "listing-1",
  publicUrlId: "aaaaab",
};

function verifyGrammar(
  label: string,
  config: typeof grammar,
  flags: typeof features,
) {
  assertNoCollisions(config);
  const property = config.routes.find((route) => route.pageKey === "property");
  if (property?.template !== "/{objectNamespace}/{slug}-{publicUrlId}/") {
    fail(`${label}: property must be /{objectNamespace}/{slug}-{publicUrlId}/`);
  }
  const development = config.routes.find(
    (route) => route.pageKey === "development",
  );
  if (development?.template !== "/{developmentSegment}/zhk-{slug}/") {
    fail(`${label}: development must be /{developmentSegment}/zhk-{slug}/`);
  }
  const builtDevelopment = buildUrl(config, flags, "development", {
    slug: "1",
  });
  if (builtDevelopment !== `/${config.developmentSegment}/zhk-1/`) {
    fail(
      `${label}: development URL must be /novostroyki/zhk-{slug}/ got ${builtDevelopment}`,
    );
  }

  for (const route of config.routes) {
    const href = buildUrl(config, flags, route.pageKey, sampleParams);
    if (href === null) {
      continue;
    }
    if (!href.endsWith("/") && href !== "/") {
      fail(`${label}: ${route.pageKey} missing trailing slash`);
    }
    const parsed = parseUrl(config, flags, href);
    if (parsed?.pageKey !== route.pageKey) {
      fail(
        `${label}: parseUrl is not inverse of buildUrl for ${route.pageKey} (${href} → ${parsed?.pageKey})`,
      );
      continue;
    }
    const rebuilt = buildUrl(config, flags, parsed.pageKey, {
      ...sampleParams,
      ...parsed.params,
    });
    if (rebuilt !== href) {
      fail(
        `${label}: rebuild mismatch for ${route.pageKey}: ${href} vs ${rebuilt}`,
      );
    }
  }
}

const home = buildUrl(grammar, features, "home");
if (home !== "/") {
  fail(`home href must be / got ${home}`);
}

const novostroyki = buildUrl(grammar, features, "catNovostroyki");
if (!novostroyki?.endsWith("/")) {
  fail("catalog href must use trailing slash");
}

const hasVtorichka = grammar.routes.some(
  (route) => route.pageKey === "facetVtorichka",
);
if (hasVtorichka && features.vtorichka === "ON") {
  if (buildUrl(grammar, features, "facetVtorichka") === null) {
    fail("vtorichka is ON and must produce an href");
  }
}

if (
  hasVtorichka &&
  buildUrl(
    grammar,
    { ...features, vtorichka: "DISABLED" },
    "facetVtorichka",
  ) !== null
) {
  fail("disabled feature must not produce an href");
}

verifyGrammar("main", grammar, features);
verifyGrammar("alt", altGrammar, {
  journal: "DISABLED",
  vtorichka: "DISABLED",
  yurist: "DISABLED",
  vacancies: "DISABLED",
  favorites: "DISABLED",
  search: "DISABLED",
});

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("grammar-collisions: PASS");
console.log("feature-flags: PASS");
console.log("buildUrl/parseUrl inverses: PASS");
console.log("reserved-roots: PASS");
console.log("core-url-classes: PASS");
