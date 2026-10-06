import {
  decideEntityLifecycle,
  normalizeLifecycle,
} from "../src/platform/lifecycle";

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

if (failed) {
  process.exit(1);
}
console.log("verify:lifecycle PASS");
