import type { KeyObject } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  listing,
  loadOrCreateKeyPair,
  publicUrlIdFromIndex,
  writeSnapshotCandidate,
} from "./write-snapshot-candidate";

export const REPRESENTATIVE_PROPERTY_COUNT = 5000;
export const REPRESENTATIVE_DEVELOPMENT_COUNT = 100;

export function writeRepresentativeFixture(
  dir: string,
  keys: { privateKey: KeyObject; publicKeyDer: Buffer },
) {
  const developments = Array.from(
    { length: REPRESENTATIVE_DEVELOPMENT_COUNT },
    (_, index) => ({
      uid: `dvl-${index + 1}`,
      publicUrlId: publicUrlIdFromIndex(index + 8000),
      slug: `zhk-${index + 1}`,
      slugHistory: [],
      name: `TEST ЖК ${index + 1}`,
      developerUid: `dev-${(index % 10) + 1}`,
      checkedAt: "2026-09-01T00:00:00Z",
    }),
  );
  const developers = Array.from({ length: 10 }, (_, index) => ({
    uid: `dev-${index + 1}`,
    name: `TEST Developer ${index + 1}`,
  }));
  const agents = Array.from({ length: 8 }, (_, index) => ({
    uid: `agt-${index + 1}`,
    slug: `agent-${index + 1}`,
    slugHistory: [],
    displayName: `TEST Agent ${index + 1}`,
    listingPresenceStatus: "HAS_ACTIVE_LISTINGS",
  }));
  const geo = Array.from({ length: 4 }, (_, index) => ({
    uid: `geo-${index + 1}`,
    slug: `geo-${index + 1}`,
    slugHistory: [],
    name: `TEST Geo ${index + 1}`,
  }));
  const inventory = Array.from(
    { length: REPRESENTATIVE_PROPERTY_COUNT },
    (_, index) =>
      listing(index, {
        developmentUid: `dvl-${(index % REPRESENTATIVE_DEVELOPMENT_COUNT) + 1}`,
        agentUid: `agt-${(index % 8) + 1}`,
        descriptionText: "TEST representative",
      }),
  );
  writeSnapshotCandidate({
    dir,
    sequence: 1,
    keyId: "fixture-representative",
    privateKey: keys.privateKey,
    projectId: "fixture-representative",
    inventory,
    developments,
    developers,
    agents,
    geo,
  });
  writeFileSync(
    join(dir, "TEST.json"),
    `${JSON.stringify({ kind: "representative", test: true }, null, 2)}\n`,
  );
}

export function writeRepresentativeFixtureTo(dir: string) {
  const keys = loadOrCreateKeyPair(join(dir, "keys"));
  writeRepresentativeFixture(dir, keys);
  return dir;
}
