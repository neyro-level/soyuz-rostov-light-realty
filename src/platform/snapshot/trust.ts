import { createPublicKey, verify } from "node:crypto";

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
