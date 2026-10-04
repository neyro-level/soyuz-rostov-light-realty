import { createHash, createPrivateKey, sign } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalManifestPayload } from "../src/platform/snapshot/verify";

const dir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../fixtures/fixture-alt",
);
const manifestPath = join(dir, "manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
  projectId: string;
  catalogRevision: string;
  files: Array<{
    kind: string;
    key: string;
    sha256: string;
    bytes: number;
    count: number;
  }>;
  keyId: string;
  signature: string;
  schemaMajor: number;
  schemaMinor: number;
  publishSequence: number;
  generatedAt: string;
  publishedAt: string;
  sourceRevisions: string[];
};

manifest.projectId = "fixture-alt";
manifest.catalogRevision = "fixture-alt-1";
manifest.sourceRevisions = ["local-fixture-alt"];

for (const file of manifest.files) {
  const bytes = readFileSync(join(dir, file.key));
  file.sha256 = createHash("sha256").update(bytes).digest("hex");
  file.bytes = bytes.byteLength;
  if (file.kind === "geo") {
    file.count = JSON.parse(bytes.toString("utf8")).length;
  }
}

const keyB64 = readFileSync(join(dir, "keys/pkcs8.b64"), "utf8").trim();
const privateKey = createPrivateKey({
  key: Buffer.from(keyB64, "base64"),
  format: "der",
  type: "pkcs8",
});
manifest.signature = sign(
  null,
  canonicalManifestPayload(manifest),
  privateKey,
).toString("base64");

writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);
console.log(
  "resigned fixture-alt",
  manifest.projectId,
  manifest.files.find((f) => f.kind === "geo"),
);
