import { matchLegacy } from "../src/platform/seo";
import { features } from "../src/project/features.config";
import { grammar } from "../src/project/grammar.config";
import { legacyRules } from "../src/project/redirects/legacy";

let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`PASS ${name}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
}

check("journal-flag-disabled", features.journal === "DISABLED");
check(
  "journal-route-absent",
  grammar.routes.every(
    (route) =>
      !route.template.includes("blog") && !route.pageKey.includes("journal"),
  ),
);
check(
  "blog-path-gone",
  matchLegacy("/blog/", legacyRules)?.status === 410 &&
    matchLegacy("/blog/any/", legacyRules)?.status === 410,
);

if (failed) {
  process.exit(1);
}
console.log("verify:journal PASS");
