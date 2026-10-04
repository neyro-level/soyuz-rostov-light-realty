import { buildHref } from "../src/platform/grammar";
import { features } from "../src/project/features.config";
import { grammar } from "../src/project/grammar.config";

function fail(message: string) {
  console.error(message);
  process.exitCode = 1;
}

const home = buildHref(grammar, features, "home");
if (home !== "/") {
  fail(`home href must be / got ${home}`);
}

const novostroyki = buildHref(grammar, features, "catNovostroyki");
if (!novostroyki?.endsWith("/")) {
  fail("catalog href must use trailing slash");
}

if (buildHref(grammar, features, "facetVtorichka") === null) {
  fail("vtorichka is ON and must produce an href");
}

if (
  buildHref(
    grammar,
    { ...features, vtorichka: "DISABLED" },
    "facetVtorichka",
  ) !== null
) {
  fail("disabled feature must not produce an href");
}

const seen = new Set<string>();
for (const route of grammar.routes) {
  if (route.template.includes("{")) {
    continue;
  }
  if (seen.has(route.template)) {
    fail(`static collision ${route.template}`);
  }
  seen.add(route.template);
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("grammar-collisions: PASS");
console.log("feature-flags: PASS");
