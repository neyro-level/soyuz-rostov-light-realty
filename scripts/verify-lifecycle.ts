import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  decideEntityLifecycle,
  normalizeLifecycle,
} from "../src/platform/lifecycle";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`PASS ${name}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
}

check("alias-active-is-visible", normalizeLifecycle("active") === "VISIBLE");
check(
  "alias-hidden-is-archived",
  normalizeLifecycle("hidden") === "ARCHIVED_VISIBLE",
);
check("alias-departed-is-gone", normalizeLifecycle("departed") === "GONE");
check("alias-redirected", normalizeLifecycle("redirected") === "REDIRECTED");

const missing = decideEntityLifecycle({ missing: true });
check(
  "missing-entity-never-200",
  missing.status === 404,
  String(missing.status),
);

const archived = decideEntityLifecycle({
  missing: false,
  lifecycle: "ARCHIVED_VISIBLE",
});
check("archived-200", archived.status === 200);
check(
  "archived-noindex-follow",
  archived.robots?.index === false && archived.robots?.follow === true,
);

const redirected = decideEntityLifecycle({
  missing: false,
  lifecycle: "REDIRECTED",
  redirectHref: "/novostroyki/zhk-1/",
});
check("redirected-308", redirected.status === 308);
check("redirected-location", redirected.location === "/novostroyki/zhk-1/");

const gone = decideEntityLifecycle({ missing: false, lifecycle: "GONE" });
check("gone-410", gone.status === 410);

const visible = decideEntityLifecycle({ missing: false, lifecycle: "VISIBLE" });
check("visible-200", visible.status === 200);

const oldSlug = decideEntityLifecycle({
  missing: false,
  lifecycle: "VISIBLE",
  requestSlug: "old-name",
  canonicalSlug: "listing-1",
  slugHistory: ["old-name"],
  canonicalHref: "/kvartiry/listing-1-aaaaab/",
});
check("slug-history-308", oldSlug.status === 308);
check(
  "slug-history-canonical",
  oldSlug.location === "/kvartiry/listing-1-aaaaab/",
);

const developmentHistory = decideEntityLifecycle({
  missing: false,
  lifecycle: "VISIBLE",
  requestSlug: "old-zhk",
  canonicalSlug: "reka",
  slugHistory: ["old-zhk"],
  canonicalHref: "/novostroyki/zhk-reka/",
});
check("development-slug-history-308", developmentHistory.status === 308);
check(
  "development-slug-history-canonical",
  developmentHistory.location === "/novostroyki/zhk-reka/",
);

const redirectedNoTarget = decideEntityLifecycle({
  missing: false,
  lifecycle: "REDIRECTED",
});
check("redirected-without-location-is-410", redirectedNoTarget.status === 410);
check("redirected-does-not-use-home", redirectedNoTarget.location !== "/");

const applySource = readFileSync(
  join(root, "src/app/apply-lifecycle.ts"),
  "utf8",
);
check("rsc-410-calls-gone", applySource.includes("gone()"));
check("rsc-410-status-branch", applySource.includes("status === 410"));

const fromRoute = readFileSync(
  join(root, "src/platform/lifecycle/from-route.ts"),
  "utf8",
);
check(
  "lifecycle-fallback-not-home",
  !fromRoute.includes('buildHref(grammar, flags, "home")'),
);

const proxySource = readFileSync(join(root, "src/proxy.ts"), "utf8");
check("lowercase-308", proxySource.includes("asciiLowerPath"));
check("lifecycle-legacy-chain", proxySource.includes("resolvePublicLocation"));

if (failed) {
  process.exit(1);
}
console.log("verify:lifecycle PASS");
