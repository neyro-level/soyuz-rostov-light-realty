import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RealtyRepository } from "../src/platform/catalog";

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

const operations: (keyof RealtyRepository)[] = [
  "getProjectContact",
  "getGeo",
  "listProperties",
  "getProperty",
  "listDevelopments",
  "getDevelopment",
  "listDevelopers",
  "getDeveloper",
  "listAgents",
  "getAgent",
];

const repoSource = readFileSync(
  join(root, "src/platform/catalog/repository.ts"),
  "utf8",
);
const dtoSource = readFileSync(
  join(root, "src/platform/catalog/dto.ts"),
  "utf8",
);

for (const name of operations) {
  check(`operation-${name}`, repoSource.includes(name));
}

const dtos = [
  "PropertyCardDTO",
  "PropertyDetailsDTO",
  "DevelopmentCardDTO",
  "DevelopmentDetailsDTO",
  "DeveloperDTO",
  "AgentCardDTO",
  "AgentDetailsDTO",
  "ProjectContactDTO",
  "GeoDTO",
];
for (const name of dtos) {
  check(`dto-${name}`, dtoSource.includes(`export type ${name}`));
}

const snapshotRepo = readFileSync(
  join(root, "src/platform/catalog/snapshot-repository.ts"),
  "utf8",
);
check(
  "snapshot-repository-class",
  snapshotRepo.includes("class SnapshotRepository") &&
    snapshotRepo.includes("fromRevisionDir"),
);

const appFiles = [
  "src/app/site-page.tsx",
  "src/app/page.tsx",
  "src/app/not-found.tsx",
  "src/app/sitemap.ts",
  "src/app/[...path]/page.tsx",
];
for (const rel of appFiles) {
  const text = readFileSync(join(root, rel), "utf8");
  check(
    `app-no-fixture:${rel}`,
    !text.includes("fixture") &&
      !text.includes("catalog/local") &&
      !text.includes("catalog/entities"),
  );
}
check(
  "site-page-uses-repository",
  readFileSync(join(root, "src/app/site-page.tsx"), "utf8").includes(
    "getRealtyRepository",
  ),
);

if (failed) {
  process.exit(1);
}
console.log("verify:repository PASS");
