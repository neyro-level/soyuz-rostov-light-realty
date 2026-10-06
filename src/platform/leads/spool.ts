import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type {
  LeadDelivery,
  LeadSpool,
  LeadSpoolRecord,
  LeadSpoolStatus,
} from "./types";

type EncryptedFile = {
  leadId: string;
  status: LeadSpoolStatus;
  attempts: number;
  updatedAt: string;
  iv: string;
  tag: string;
  data: string;
};

function encrypt(
  key: Buffer,
  plaintext: string,
): { iv: string; tag: string; data: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return {
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: data.toString("base64"),
  };
}

function decrypt(key: Buffer, file: EncryptedFile): LeadDelivery {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(file.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(file.tag, "base64"));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(file.data, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(plain.toString("utf8")) as LeadDelivery;
}

export function createLeadId(): string {
  return randomUUID();
}

export class FileLeadSpool implements LeadSpool {
  constructor(
    private readonly dir: string,
    private readonly key: Buffer,
  ) {
    mkdirSync(dir, { recursive: true });
  }

  write(record: LeadSpoolRecord): void {
    const sealed = encrypt(this.key, JSON.stringify(record.delivery));
    const payload: EncryptedFile = {
      leadId: record.leadId,
      status: record.status,
      attempts: record.attempts,
      updatedAt: record.updatedAt,
      ...sealed,
    };
    const tmp = join(this.dir, `${record.leadId}.tmp`);
    const dest = join(this.dir, `${record.leadId}.json`);
    writeFileSync(tmp, `${JSON.stringify(payload)}\n`);
    renameSync(tmp, dest);
  }

  read(leadId: string): LeadSpoolRecord | null {
    const path = join(this.dir, `${leadId}.json`);
    if (!existsSync(path)) {
      return null;
    }
    const file = JSON.parse(readFileSync(path, "utf8")) as EncryptedFile;
    return {
      leadId: file.leadId,
      status: file.status,
      attempts: file.attempts,
      updatedAt: file.updatedAt,
      delivery: decrypt(this.key, file),
    };
  }

  listPending(): LeadSpoolRecord[] {
    return readdirSync(this.dir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => this.read(name.replace(/\.json$/, "")))
      .filter((record): record is LeadSpoolRecord => record !== null)
      .filter(
        (record) =>
          record.status === "pending" || record.status === "failed-retryable",
      );
  }

  pendingCount(): number {
    return this.listPending().length;
  }

  ciphertextContains(value: string): boolean {
    return readdirSync(this.dir)
      .filter((name) => name.endsWith(".json"))
      .some((name) =>
        readFileSync(join(this.dir, name), "utf8").includes(value),
      );
  }

  remove(leadId: string): void {
    const path = join(this.dir, `${leadId}.json`);
    if (existsSync(path)) {
      rmSync(path);
    }
  }
}

export async function flushLeadSpool(
  spool: LeadSpool,
  sink: { deliver(delivery: LeadDelivery): Promise<void> },
  now = new Date(),
): Promise<number> {
  let delivered = 0;
  for (const record of spool.listPending()) {
    const waitMs = Math.min(60_000, 1000 * 2 ** Math.max(0, record.attempts));
    if (
      now.getTime() - Date.parse(record.updatedAt) < waitMs &&
      record.attempts > 0
    ) {
      continue;
    }
    try {
      await sink.deliver(record.delivery);
      spool.remove(record.leadId);
      delivered += 1;
    } catch {
      spool.write({
        ...record,
        status: "failed-retryable",
        attempts: record.attempts + 1,
        updatedAt: now.toISOString(),
      });
    }
  }
  return delivered;
}
