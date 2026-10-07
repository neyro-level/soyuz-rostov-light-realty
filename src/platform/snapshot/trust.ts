import { createPublicKey, verify } from "node:crypto";
import { readFileSync } from "node:fs";

export type TrustKey = {
  keyId: string;
  publicKeyDer: Buffer;
  revoked?: boolean;
};

export class TrustSet {
  private readonly keys = new Map<string, TrustKey>();

  add(key: TrustKey): void {
    this.keys.set(key.keyId, key);
  }

  resolve(keyId: string): TrustKey {
    const found = this.keys.get(keyId);
    if (!found) {
      throw new Error(`unknown keyId ${keyId}`);
    }
    if (found.revoked) {
      throw new Error(`revoked keyId ${keyId}`);
    }
    return found;
  }

  verifySignature(keyId: string, payload: Buffer, signature: Buffer): boolean {
    const key = this.resolve(keyId);
    const publicKey = createPublicKey({
      key: key.publicKeyDer,
      format: "der",
      type: "spki",
    });
    return verify(null, payload, publicKey, signature);
  }
}

type TrustFile = {
  keyId?: string;
  publicKeySpkiBase64?: string;
  revoked?: boolean;
  keys?: Array<{
    keyId: string;
    publicKeySpkiBase64: string;
    revoked?: boolean;
  }>;
};

export function loadTrustSetFromFile(path: string): TrustSet {
  const raw = JSON.parse(readFileSync(path, "utf8")) as TrustFile;
  const entries =
    raw.keys ??
    (raw.keyId && raw.publicKeySpkiBase64
      ? [
          {
            keyId: raw.keyId,
            publicKeySpkiBase64: raw.publicKeySpkiBase64,
            revoked: raw.revoked,
          },
        ]
      : []);
  const trust = new TrustSet();
  for (const entry of entries) {
    trust.add({
      keyId: entry.keyId,
      publicKeyDer: Buffer.from(entry.publicKeySpkiBase64, "base64"),
      revoked: entry.revoked,
    });
  }
  return trust;
}
