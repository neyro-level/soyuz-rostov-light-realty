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

if (failed) {
  process.exit(1);
}
console.log("verify:repository PASS");
