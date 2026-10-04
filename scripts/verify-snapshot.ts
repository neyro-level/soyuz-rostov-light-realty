import { createHash, generateKeyPairSync, sign } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { env } from "../src/platform/env";
import { REQUIRED_DATASET_KINDS } from "../src/platform/snapshot/constants";
import {
  acquireLock,
  activateStaging,
  openSnapshotStore,
  readCurrentManifest,
  releaseLock,
} from "../src/platform/snapshot/store";
import {
  applyLocalSnapshot,
  loadCurrentSnapshot,
  prepareStaging,
} from "../src/platform/snapshot/sync";
import { TrustSet } from "../src/platform/snapshot/trust";
import { canonicalManifestPayload } from "../src/platform/snapshot/verify";

const PROJECT_ID = "lite-demo";
let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`PASS ${name}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function listing(index: number, extra: Record<string, unknown> = {}) {
  const token = "234567abc"[index] ?? "a";
  return {
    uid: `uid-${index}`,
    publicUrlId: `abcde${token}`,
    propertyType: "APARTMENT",
    transactionType: "SALE",
    dealKind: "SECONDARY_SALE",
    addressPublic: "Public street",
    locationPrecision: "STREET",
    facts: { rooms: 1 },
    media: [],
    status: "ACTIVE",
    ...extra,
  };
}

function createKeys() {
  const pair = generateKeyPairSync("ed25519");
  return {
    privateKey: pair.privateKey,
    publicKeyDer: pair.publicKey.export({
      type: "spki",
      format: "der",
    }) as Buffer,
  };
}

function writeCandidate(input: {
  sequence: number;
  keyId: string;
  privateKey: Parameters<typeof sign>[2];
  inventory?: unknown[];
  projectId?: string;
  schemaMajor?: number;
  omitKind?: string;
  corruptHash?: boolean;
  corruptBytes?: boolean;
  corruptSignature?: boolean;
  envelopeBroken?: boolean;
}) {
  const dir = mkdtempSync(join(tmpdir(), "sz-snap-"));
  if (input.envelopeBroken) {
    writeFileSync(join(dir, "manifest.json"), "{");
    return dir;
  }
  const files = [];
  for (const kind of REQUIRED_DATASET_KINDS) {
    if (kind === input.omitKind) {
      continue;
    }
    const payload =
      kind === "inventory"
        ? Buffer.from(JSON.stringify(input.inventory ?? [listing(0)]), "utf8")
        : Buffer.from("[]", "utf8");
    const key = `${kind}.json`;
    writeFileSync(join(dir, key), payload);
    files.push({
      kind,
      key,
      sha256: input.corruptHash ? "c".repeat(64) : sha256(payload),
      bytes: input.corruptBytes ? payload.byteLength + 9 : payload.byteLength,
      count:
        kind === "inventory" ? (input.inventory ?? [listing(0)]).length : 0,
    });
  }
  const unsigned = {
    schemaMajor: input.schemaMajor ?? 3,
    schemaMinor: 1,
    projectId: input.projectId ?? PROJECT_ID,
    publishSequence: input.sequence,
    generatedAt: "2026-10-03T00:00:00Z",
    publishedAt: "2026-10-03T00:00:00Z",
    catalogRevision: `r${input.sequence}`,
    sourceRevisions: ["src-1"],
    files,
    keyId: input.keyId,
    signature: "",
  };
  const signature = sign(
    null,
    canonicalManifestPayload(unsigned),
    input.privateKey,
  );
  if (input.corruptSignature) {
    signature[0] = signature[0] ^ 0xff;
  }
  unsigned.signature = signature.toString("base64");
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(unsigned));
  return dir;
}

const trusted = createKeys();
const other = createKeys();
const trust = new TrustSet();
trust.add({ keyId: "trusted", publicKeyDer: trusted.publicKeyDer });
trust.add({
  keyId: "revoked",
  publicKeyDer: other.publicKeyDer,
  revoked: true,
});

const storeRoot = mkdtempSync(join(tmpdir(), "sz-store-"));

function apply(candidateDir: string) {
  return applyLocalSnapshot({
    storeRoot,
    candidateDir,
    trust,
    expectedProjectId: PROJECT_ID,
    lockTtlMs: 5_000,
  });
}

check("data-mode-local", env.DATA_MODE === "local");

const pkg = readFileSync(join(process.cwd(), "package.json"), "utf8");
check("no-database-client", !/payload|prisma|postgres|pg\b/i.test(pkg));

const accepted = apply(
  writeCandidate({
    sequence: 1,
    keyId: "trusted",
    privateKey: trusted.privateKey,
  }),
);
check(
  "valid-signature-accept",
  accepted.status === "activated",
  accepted.status === "rejected" ? accepted.reason : "",
);

const current = loadCurrentSnapshot(storeRoot);
check("current-readable", current?.publishSequence === 1);

check(
  "invalid-signature-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "trusted",
      privateKey: trusted.privateKey,
      corruptSignature: true,
    }),
  ).status === "rejected",
);
check(
  "last-good-after-invalid",
  loadCurrentSnapshot(storeRoot)?.publishSequence === 1,
);

check(
  "unknown-key-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "missing",
      privateKey: trusted.privateKey,
    }),
  ).status === "rejected",
);

check(
  "revoked-key-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "revoked",
      privateKey: other.privateKey,
    }),
  ).status === "rejected",
);

check(
  "wrong-project-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "trusted",
      privateKey: trusted.privateKey,
      projectId: "other-project",
    }),
  ).status === "rejected",
);

check(
  "unsupported-major-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "trusted",
      privateKey: trusted.privateKey,
      schemaMajor: 4,
    }),
  ).status === "rejected",
);

check(
  "equal-sequence-reject",
  apply(
    writeCandidate({
      sequence: 1,
      keyId: "trusted",
      privateKey: trusted.privateKey,
    }),
  ).status === "rejected",
);

check(
  "hash-mismatch-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "trusted",
      privateKey: trusted.privateKey,
      corruptHash: true,
    }),
  ).status === "rejected",
);

check(
  "bytes-mismatch-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "trusted",
      privateKey: trusted.privateKey,
      corruptBytes: true,
    }),
  ).status === "rejected",
);

check(
  "missing-dataset-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "trusted",
      privateKey: trusted.privateKey,
      omitKind: "inventory",
    }),
  ).status === "rejected",
);

check(
  "envelope-error-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "trusted",
      privateKey: trusted.privateKey,
      envelopeBroken: true,
    }),
  ).status === "rejected",
);

check(
  "private-leak-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "trusted",
      privateKey: trusted.privateKey,
      inventory: [listing(0, { apartmentNumberPrivate: "12" })],
    }),
  ).status === "rejected",
);

check(
  "identity-collision-reject",
  apply(
    writeCandidate({
      sequence: 2,
      keyId: "trusted",
      privateKey: trusted.privateKey,
      inventory: [listing(0), listing(1, { uid: "uid-0" })],
    }),
  ).status === "rejected",
);

const underThreshold = Array.from({ length: 10 }, (_, index) =>
  index === 0 ? { broken: true } : listing(index),
);
const warned = apply(
  writeCandidate({
    sequence: 2,
    keyId: "trusted",
    privateKey: trusted.privateKey,
    inventory: underThreshold,
  }),
);
check(
  "quarantine-under-threshold-activate",
  warned.status === "activated",
  warned.status === "rejected" ? warned.reason : "",
);

const overThreshold = Array.from({ length: 10 }, (_, index) =>
  index < 3 ? { broken: true } : listing(index),
);
check(
  "quarantine-over-threshold-reject",
  apply(
    writeCandidate({
      sequence: 3,
      keyId: "trusted",
      privateKey: trusted.privateKey,
      inventory: overThreshold,
    }),
  ).status === "rejected",
);

const store = openSnapshotStore(storeRoot);
const seqBeforeCrash = readCurrentManifest(store)?.publishSequence;
const crashDir = writeCandidate({
  sequence: (seqBeforeCrash ?? 1) + 1,
  keyId: "trusted",
  privateKey: trusted.privateKey,
});
prepareStaging(store, crashDir);
rmSync(store.stagingDir, { recursive: true, force: true });
try {
  activateStaging(store);
  check("activation-failure-throws", false);
} catch {
  check("activation-failure-throws", true);
}
check(
  "last-good-untouched",
  loadCurrentSnapshot(storeRoot)?.publishSequence === seqBeforeCrash,
);

check(
  "hub-unavailable-current-works",
  loadCurrentSnapshot(storeRoot)?.publishSequence === seqBeforeCrash,
);

acquireLock(store, 60_000);
const concurrent = apply(
  writeCandidate({
    sequence: (seqBeforeCrash ?? 1) + 1,
    keyId: "trusted",
    privateKey: trusted.privateKey,
  }),
);
releaseLock(store);
check("concurrent-apply-reject", concurrent.status === "rejected");

writeFileSync(
  store.lockPath,
  JSON.stringify({ at: Date.now() - 120_000, pid: 1 }),
);
mkdirSync(storeRoot, { recursive: true });
const stale = apply(
  writeCandidate({
    sequence: (loadCurrentSnapshot(storeRoot)?.publishSequence ?? 1) + 1,
    keyId: "trusted",
    privateKey: trusted.privateKey,
  }),
);
check(
  "stale-lock-recovery",
  stale.status === "activated",
  stale.status === "rejected" ? stale.reason : "",
);

const fixtureDir = join(process.cwd(), "fixtures", "fixture-sz-rostov");
const fixtureTrust = JSON.parse(
  readFileSync(join(fixtureDir, "trust.json"), "utf8"),
) as { keyId: string; publicKeySpkiBase64: string };
const fixtureStore = mkdtempSync(join(tmpdir(), "sz-fixture-"));
const fixtureKeys = new TrustSet();
fixtureKeys.add({
  keyId: fixtureTrust.keyId,
  publicKeyDer: Buffer.from(fixtureTrust.publicKeySpkiBase64, "base64"),
});
const fixtureApply = applyLocalSnapshot({
  storeRoot: fixtureStore,
  candidateDir: fixtureDir,
  trust: fixtureKeys,
  expectedProjectId: "fixture-sz-rostov",
});
check(
  "fixture-apply",
  fixtureApply.status === "activated",
  fixtureApply.status === "rejected" ? fixtureApply.reason : "",
);
const fixtureGeo = JSON.parse(
  readFileSync(join(fixtureDir, "geo.json"), "utf8"),
) as unknown[];
const fixtureDevelopers = JSON.parse(
  readFileSync(join(fixtureDir, "developers.json"), "utf8"),
) as unknown[];
const fixtureInventory = JSON.parse(
  readFileSync(join(fixtureDir, "inventory.json"), "utf8"),
) as unknown[];
check(
  "fixture-counts",
  fixtureGeo.length === 10 &&
    fixtureDevelopers.length === 20 &&
    fixtureInventory.length === 300,
  `geo=${fixtureGeo.length} developers=${fixtureDevelopers.length} inventory=${fixtureInventory.length}`,
);

if (failed) {
  process.exit(1);
}
console.log("verify:snapshot PASS");
