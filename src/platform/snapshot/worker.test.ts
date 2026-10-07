import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listPendingAcks } from "./ack";
import { REQUIRED_DATASET_KINDS } from "./constants";
import { createHubAdapter } from "./provider";
import { openSnapshotStore } from "./store";
import { TrustSet } from "./trust";
import { runProviderSync } from "./worker";

const PROJECT_ID = "lite-demo";

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function listing() {
  return {
    uid: "uid-0",
    publicUrlId: "aaaaaa",
    propertyType: "APARTMENT",
    transactionType: "SALE",
    dealKind: "SECONDARY_SALE",
    addressPublic: "Public street",
    geoPrecision: "street",
    slugHistory: [],
    facts: { rooms: 1 },
    media: [],
    status: "ACTIVE",
  };
}

function contact() {
  return {
    projectId: PROJECT_ID,
    phone: "+70000000000",
    email: "office@example.test",
    updatedAt: "2026-10-03T00:00:00Z",
  };
}

function writeCandidate(input: {
  sequence: number;
  keyId: string;
  privateKey: Parameters<typeof sign>[2];
  corruptSignature?: boolean;
}) {
  const dir = mkdtempSync(join(tmpdir(), "sz-cand-"));
  const files = [];
  for (const kind of REQUIRED_DATASET_KINDS) {
    const payload = Buffer.from(
      JSON.stringify(
        kind === "inventory"
          ? [listing()]
          : kind === "contacts"
            ? [contact()]
            : [],
      ),
      "utf8",
    );
    const key = `${kind}.json`;
    writeFileSync(join(dir, key), payload);
    files.push({
      kind,
      key,
      sha256: sha256(payload),
      bytes: payload.byteLength,
      count: kind === "inventory" || kind === "contacts" ? 1 : 0,
    });
  }
  const unsigned = {
    schemaMajor: 3,
    schemaMinor: 1,
    projectId: PROJECT_ID,
    publishSequence: input.sequence,
    generatedAt: "2026-10-03T00:00:00Z",
    publishedAt: "2026-10-03T00:00:00Z",
    catalogRevision: `r${input.sequence}`,
    sourceRevisions: ["src-1"],
    files,
    keyId: input.keyId,
  };
  const manifestBytes = Buffer.from(JSON.stringify(unsigned), "utf8");
  const signature = sign(null, manifestBytes, input.privateKey);
  if (input.corruptSignature) {
    signature[0] = signature[0] ^ 0xff;
  }
  writeFileSync(join(dir, "manifest.json"), manifestBytes);
  writeFileSync(join(dir, "manifest.sig"), signature);
  return dir;
}

describe("provider worker", () => {
  it("does not ACK already-current without a valid signature", () => {
    const pair = generateKeyPairSync("ed25519");
    const publicKeyDer = pair.publicKey.export({
      type: "spki",
      format: "der",
    }) as Buffer;
    const trust = new TrustSet();
    trust.add({ keyId: "trusted", publicKeyDer });
    const storeRoot = mkdtempSync(join(tmpdir(), "sz-worker-"));
    const origin = writeCandidate({
      sequence: 1,
      keyId: "trusted",
      privateKey: pair.privateKey,
    });
    const first = runProviderSync({
      storeRoot,
      provider: createHubAdapter(origin),
      trust,
      expectedProjectId: PROJECT_ID,
    });
    expect(first.status).toBe("activated");
    const forged = writeCandidate({
      sequence: 1,
      keyId: "trusted",
      privateKey: pair.privateKey,
      corruptSignature: true,
    });
    const replay = runProviderSync({
      storeRoot,
      provider: createHubAdapter(forged),
      trust,
      expectedProjectId: PROJECT_ID,
    });
    expect(replay.status).toBe("rejected");
    if (replay.status === "rejected") {
      expect(replay.reason).toBe("invalid signature");
    }
    expect(listPendingAcks(openSnapshotStore(storeRoot))).toEqual([]);
  });

  it("keeps current when a later file fetch fails mid-pull", () => {
    const pair = generateKeyPairSync("ed25519");
    const publicKeyDer = pair.publicKey.export({
      type: "spki",
      format: "der",
    }) as Buffer;
    const trust = new TrustSet();
    trust.add({ keyId: "trusted", publicKeyDer });
    const storeRoot = mkdtempSync(join(tmpdir(), "sz-partial-"));
    const origin = writeCandidate({
      sequence: 1,
      keyId: "trusted",
      privateKey: pair.privateKey,
    });
    expect(
      runProviderSync({
        storeRoot,
        provider: createHubAdapter(origin),
        trust,
        expectedProjectId: PROJECT_ID,
      }).status,
    ).toBe("activated");
    const next = writeCandidate({
      sequence: 2,
      keyId: "trusted",
      privateKey: pair.privateKey,
    });
    const adapter = createHubAdapter(next);
    const partial = runProviderSync({
      storeRoot,
      provider: {
        ...adapter,
        fetchFile(key) {
          if (key === "inventory.json") {
            throw new Error("truncated download");
          }
          return adapter.fetchFile(key);
        },
      },
      trust,
      expectedProjectId: PROJECT_ID,
    });
    expect(partial.status).toBe("provider-unavailable");
  });
});
