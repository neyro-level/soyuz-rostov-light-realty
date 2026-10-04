import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "../src/platform/env";
import { lead } from "../src/project/lead.config";

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

const envFile = readFileSync(join(root, "src/platform/env.ts"), "utf8");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const deps = {
  ...pkg.dependencies,
  ...pkg.devDependencies,
};
const dockerfile = readFileSync(join(root, "Dockerfile"), "utf8");
const compose = readFileSync(join(root, "compose.yaml"), "utf8");
const bundle = readFileSync(join(root, "docs/EXIT_BUNDLE.md"), "utf8");
const example = readFileSync(join(root, ".env.example"), "utf8");
const defaults = loadEnv({} as NodeJS.ProcessEnv);

check("data-mode-default-local", defaults.DATA_MODE === "local");
check("leads-mode-default-direct", defaults.LEADS_MODE === "direct");
check("runtime-leads-direct", lead.mode === "direct");
check("env-has-no-database-url", !envFile.includes("DATABASE_URL"));
check(
  "no-payload-postgres-deps",
  !Object.keys(deps).some((name) => /payload|prisma|postgres|pg\b/i.test(name)),
);
check(
  "dockerfile-is-artifact",
  dockerfile.includes("not a production rollout") &&
    dockerfile.includes("node:"),
);
check("dockerfile-no-postgres", !dockerfile.toLowerCase().includes("postgres"));
check(
  "compose-is-artifact",
  compose.includes("not a production rollout") &&
    compose.includes("DATA_MODE: local") &&
    compose.includes("LEADS_MODE: direct"),
);
check(
  "exit-bundle-notes",
  bundle.includes("DATA_MODE=local") &&
    bundle.includes("LEADS_MODE=direct") &&
    bundle.includes("DATABASE_URL"),
);
check(
  "env-example-exit-mode",
  example.includes("DATA_MODE=local") && example.includes("LEADS_MODE=direct"),
);

if (failed) {
  process.exit(1);
}
console.log("verify:exit-mode PASS");
