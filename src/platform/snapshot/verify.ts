import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  AgentPageDtoSchema,
  DevelopmentDtoSchema,
  FORBIDDEN_PUBLIC_FIELDS,
  GeoDtoSchema,
  PublicInventoryDtoSchema,
  parseSnapshotManifest,
  type SnapshotManifest,
} from "../hub/contract";
import {
  QUARANTINE_RATIO_THRESHOLD,
  REQUIRED_DATASET_KINDS,
} from "./constants";
import type { TrustSet } from "./trust";

export type SnapshotIssue = {
  code: string;
  message: string;
};

function readDetachedManifest(candidateDir: string): {
  bytes: Buffer;
  keyId: string;
  parsed: unknown;
} {
  const manifestPath = join(candidateDir, "manifest.json");
  let bytes: Buffer;
  try {
    bytes = readFileSync(manifestPath);
  } catch {
    throw new Error("hard schema/envelope error");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("hard schema/envelope error");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("hard schema/envelope error");
  }
  const keyId = (parsed as { keyId?: unknown }).keyId;
  if (typeof keyId !== "string" || keyId.length === 0) {
    throw new Error("hard schema/envelope error");
  }
  return { bytes, keyId, parsed };
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function rejectForbidden(record: Record<string, unknown>): boolean {
  return FORBIDDEN_PUBLIC_FIELDS.some((field) => field in record);
}

function uidOf(item: unknown): string | null {
  if (!item || typeof item !== "object") {
    return null;
  }
  const uid = (item as { uid?: unknown }).uid;
  return typeof uid === "string" && uid.length > 0 ? uid : null;
}

export function inspectInventory(
  raw: unknown,
  relations?: {
    developmentUids: Set<string>;
    agentUids: Set<string>;
  },
): {
  issues: SnapshotIssue[];
  quarantined: number;
  total: number;
} {
  if (!Array.isArray(raw)) {
    return {
      issues: [{ code: "schema", message: "inventory must be an array" }],
      quarantined: 1,
      total: 1,
    };
  }
  const issues: SnapshotIssue[] = [];
  const seenUid = new Set<string>();
  const seenPublicUrlId = new Set<string>();
  let quarantined = 0;
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      quarantined += 1;
      issues.push({
        code: "schema",
        message: "inventory item is not an object",
      });
      continue;
    }
    const record = item as Record<string, unknown>;
    if (rejectForbidden(record)) {
      issues.push({
        code: "private-leak",
        message: "forbidden field",
      });
      return { issues, quarantined: raw.length, total: raw.length };
    }
    const parsed = PublicInventoryDtoSchema.safeParse(item);
    if (!parsed.success) {
      quarantined += 1;
      issues.push({
        code: "schema",
        message: "inventory item failed DTO schema",
      });
      continue;
    }
    if (seenUid.has(parsed.data.uid)) {
      issues.push({
        code: "identity-collision",
        message: `duplicate uid ${parsed.data.uid}`,
      });
      return { issues, quarantined: raw.length, total: raw.length };
    }
    seenUid.add(parsed.data.uid);
    if (seenPublicUrlId.has(parsed.data.publicUrlId)) {
      issues.push({
        code: "identity-collision",
        message: `duplicate publicUrlId ${parsed.data.publicUrlId}`,
      });
      return { issues, quarantined: raw.length, total: raw.length };
    }
    seenPublicUrlId.add(parsed.data.publicUrlId);
    if (
      parsed.data.developmentUid &&
      relations &&
      !relations.developmentUids.has(parsed.data.developmentUid)
    ) {
      quarantined += 1;
      issues.push({
        code: "relation",
        message: `missing development ${parsed.data.developmentUid}`,
      });
    }
    if (
      parsed.data.agentUid &&
      relations &&
      !relations.agentUids.has(parsed.data.agentUid)
    ) {
      quarantined += 1;
      issues.push({
        code: "relation",
        message: `missing agent ${parsed.data.agentUid}`,
      });
    }
  }
  return { issues, quarantined, total: raw.length };
}

function collectUids(
  raw: unknown,
  schema: { safeParse: (item: unknown) => { success: boolean } },
): Set<string> {
  const uids = new Set<string>();
  if (!Array.isArray(raw)) {
    return uids;
  }
  for (const item of raw) {
    const uid = uidOf(item);
    if (uid && schema.safeParse(item).success) {
      uids.add(uid);
    }
  }
  return uids;
}

export function verifyCandidate(input: {
  candidateDir: string;
  trust: TrustSet;
  expectedProjectId: string;
  currentSequence?: number;
}): { manifest: SnapshotManifest; warnings: SnapshotIssue[] } {
  const envelope = readDetachedManifest(input.candidateDir);
  const signaturePath = join(input.candidateDir, "manifest.sig");
  if (!existsSync(signaturePath)) {
    throw new Error("invalid signature");
  }
  const signature = readFileSync(signaturePath);
  const ok = input.trust.verifySignature(
    envelope.keyId,
    envelope.bytes,
    signature,
  );
  if (!ok) {
    throw new Error("invalid signature");
  }
  const manifest = parseSnapshotManifest(envelope.parsed);
  if (manifest.projectId !== input.expectedProjectId) {
    throw new Error("wrong projectId");
  }
  if (
    input.currentSequence !== undefined &&
    manifest.publishSequence <= input.currentSequence
  ) {
    throw new Error("lower/equal sequence");
  }
  const kinds = new Set(manifest.files.map((file) => file.kind));
  for (const kind of REQUIRED_DATASET_KINDS) {
    if (!kinds.has(kind)) {
      throw new Error(`missing required dataset ${kind}`);
    }
  }
  const payloads = new Map<string, unknown>();
  for (const file of manifest.files) {
    const full = join(input.candidateDir, file.key);
    const bytes = readFileSync(full);
    if (bytes.byteLength !== file.bytes) {
      throw new Error("bytes mismatch");
    }
    if (sha256(bytes) !== file.sha256) {
      throw new Error("hash mismatch");
    }
    try {
      payloads.set(file.kind, JSON.parse(bytes.toString("utf8")));
    } catch {
      throw new Error("hard schema/envelope error");
    }
  }
  const developments = payloads.get("developments");
  const agents = payloads.get("agents");
  const geo = payloads.get("geo");
  if (Array.isArray(developments)) {
    for (const item of developments) {
      if (
        item &&
        typeof item === "object" &&
        rejectForbidden(item as Record<string, unknown>)
      ) {
        throw new Error("private forbidden field leak");
      }
    }
  }
  if (Array.isArray(agents)) {
    for (const item of agents) {
      if (
        item &&
        typeof item === "object" &&
        rejectForbidden(item as Record<string, unknown>)
      ) {
        throw new Error("private forbidden field leak");
      }
    }
  }
  if (Array.isArray(geo)) {
    for (const item of geo) {
      if (
        item &&
        typeof item === "object" &&
        rejectForbidden(item as Record<string, unknown>)
      ) {
        throw new Error("private forbidden field leak");
      }
    }
  }
  const inventory = payloads.get("inventory");
  const report = inspectInventory(inventory, {
    developmentUids: collectUids(developments, DevelopmentDtoSchema),
    agentUids: collectUids(agents, AgentPageDtoSchema),
  });
  if (report.issues.some((issue) => issue.code === "private-leak")) {
    throw new Error("private forbidden field leak");
  }
  if (report.issues.some((issue) => issue.code === "identity-collision")) {
    throw new Error("critical identity collision");
  }
  if (Array.isArray(geo)) {
    for (const item of geo) {
      if (
        item &&
        typeof item === "object" &&
        !GeoDtoSchema.safeParse(item).success
      ) {
        report.quarantined += 1;
        report.total += 1;
        report.issues.push({
          code: "schema",
          message: "geo item failed DTO schema",
        });
      }
    }
  }
  const ratio = report.total === 0 ? 0 : report.quarantined / report.total;
  if (ratio > QUARANTINE_RATIO_THRESHOLD) {
    throw new Error("quarantine ratio above threshold");
  }
  return { manifest, warnings: report.issues };
}

export function fileStatBytes(path: string): number {
  return statSync(path).size;
}
