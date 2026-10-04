import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadFixtureInventory } from "../src/platform/catalog/local";
import {
  assertNoCollisions,
  type FeatureFlags,
  type GrammarConfig,
} from "../src/platform/grammar";
import { TrustSet } from "../src/platform/snapshot/trust";
import { verifyCandidate } from "../src/platform/snapshot/verify";
import { data } from "../src/project/data.config";
import { features as primaryFeatures } from "../src/project/features.config";
import { grammar as primaryGrammar } from "../src/project/grammar.config";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const altDir = "fixtures/fixture-alt";
let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`PASS ${name}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
}

function loadTrust(fixtureDir: string) {
  const trustJson = JSON.parse(
    readFileSync(join(root, fixtureDir, "trust.json"), "utf8"),
  ) as { keyId: string; publicKeySpkiBase64: string };
  const trust = new TrustSet();
  trust.add({
    keyId: trustJson.keyId,
    publicKeyDer: Buffer.from(trustJson.publicKeySpkiBase64, "base64"),
  });
  return trust;
}

const overlay = JSON.parse(
  readFileSync(join(root, altDir, "project.json"), "utf8"),
) as GrammarConfig & { features: FeatureFlags };

assertNoCollisions(overlay);
const altInventory = loadFixtureInventory(root, altDir);
const primaryInventory = loadFixtureInventory(root, data.fixtureDir);

const primarySnapshot = verifyCandidate({
  candidateDir: join(root, data.fixtureDir),
  trust: loadTrust(data.fixtureDir),
  expectedProjectId: "fixture-sz-rostov",
});
const altSnapshot = verifyCandidate({
  candidateDir: join(root, altDir),
  trust: loadTrust(altDir),
  expectedProjectId: "fixture-alt",
});

check(
  "primary-snapshot-ok",
  primarySnapshot.manifest.projectId === "fixture-sz-rostov",
);
check("alt-snapshot-ok", altSnapshot.manifest.projectId === "fixture-alt");
check("primary-inventory-loaded", primaryInventory.length > 0);
check("alt-inventory-loaded", altInventory.length > 0);
check("alt-geo-differs", overlay.geo !== primaryGrammar.geo);
check(
  "alt-categories-differs",
  overlay.categories.join(",") !== primaryGrammar.categories.join(","),
);
check(
  "alt-flags-differs",
  overlay.features.vtorichka !== primaryFeatures.vtorichka &&
    overlay.features.yurist !== primaryFeatures.yurist,
);
check(
  "platform-untouched-by-alt-geo",
  !readFileSync(join(root, "src/platform/grammar/engine.ts"), "utf8").includes(
    overlay.geo,
  ),
);

if (failed) {
  process.exit(1);
}
console.log("template:check PASS");
