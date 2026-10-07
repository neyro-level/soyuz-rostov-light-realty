import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  listing,
  loadOrCreateKeyPair,
  writeSnapshotCandidate,
} from "./write-snapshot-candidate";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brokenRoot = join(root, "fixtures/fixture-broken");
const keys = loadOrCreateKeyPair(join(brokenRoot, "keys"));
const projectId = "fixture-broken";
const keyId = "fixture-broken";

writeFileSync(
  join(brokenRoot, "keys/README.md"),
  "TEST keys for fixture-broken candidates. Not for production.\n",
);
writeFileSync(
  join(brokenRoot, "trust.json"),
  `${JSON.stringify(
    {
      keyId,
      publicKeySpkiBase64: keys.publicKeyDer.toString("base64"),
    },
    null,
    2,
  )}\n`,
);

const base = {
  sequence: 1,
  keyId,
  privateKey: keys.privateKey,
  projectId,
};

mkdirSync(brokenRoot, { recursive: true });

writeSnapshotCandidate({
  ...base,
  dir: join(brokenRoot, "bad-signature"),
  corruptSignature: true,
});

writeSnapshotCandidate({
  ...base,
  dir: join(brokenRoot, "hash-mismatch"),
  corruptHash: true,
});

writeSnapshotCandidate({
  ...base,
  dir: join(brokenRoot, "duplicate-publicUrlId"),
  inventory: [listing(0), listing(1, { publicUrlId: listing(0).publicUrlId })],
});

writeSnapshotCandidate({
  ...base,
  dir: join(brokenRoot, "privacy-leak"),
  inventory: [listing(0, { apartmentNumberPrivate: "12" })],
});

writeSnapshotCandidate({
  ...base,
  dir: join(brokenRoot, "broken-relation"),
  inventory: [listing(0, { developmentUid: "missing-development-uid" })],
});

writeSnapshotCandidate({
  ...base,
  dir: join(brokenRoot, "invalid-slug"),
  inventory: [listing(0, { slug: "kvartiry" })],
});

writeSnapshotCandidate({
  ...base,
  dir: join(brokenRoot, "excessive-quarantine"),
  inventory: Array.from({ length: 200 }, (_, index) =>
    index < 2 ? { broken: true } : listing(index),
  ),
});

writeFileSync(
  join(brokenRoot, "README.md"),
  [
    "# fixture-broken",
    "",
    "TEST candidates that snapshot verify must reject:",
    "",
    "- `bad-signature`",
    "- `hash-mismatch`",
    "- `duplicate-publicUrlId`",
    "- `privacy-leak`",
    "- `broken-relation`",
    "- `invalid-slug`",
    "- `excessive-quarantine`",
    "",
    "Regenerate with `pnpm exec tsx scripts/generate-broken-fixtures.ts`.",
    "",
  ].join("\n"),
);

console.log("generated fixtures/fixture-broken");
