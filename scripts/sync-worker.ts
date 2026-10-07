import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { loadEnv } from "../src/platform/env";
import {
  createLeadTransportSink,
  flushLeadSpool,
  processLeadSpool,
} from "../src/platform/leads";
import {
  consumeSyncSignal,
  createHubAdapter,
  DEFAULT_RESERVED_SLUGS,
  downloadProviderSnapshot,
  flushPendingAcks,
  loadTrustSetFromFile,
  openSnapshotStore,
  runProviderSync,
} from "../src/platform/snapshot";
import { grammar } from "../src/project/grammar.config";

const POLL_MS = Number(process.env.SYNC_POLL_MS ?? 15_000);
const TICK_MS = Number(process.env.SYNC_TICK_MS ?? 1_000);

function resolveTrustFile(
  cwd: string,
  fixture: string,
  storeDir: string,
): string {
  const candidates = [
    process.env.SNAPSHOT_TRUST_FILE,
    join(storeDir, "trust.json"),
    join(cwd, "fixtures", fixture, "trust.json"),
  ].filter((value): value is string => Boolean(value));
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    throw new Error("snapshot trust file is required");
  }
  return found;
}

async function syncOnce(cwd: string): Promise<void> {
  const env = loadEnv();
  if (env.DATA_MODE !== "snapshot" || !env.SNAPSHOT_STORE_DIR) {
    throw new Error(
      "sync worker requires DATA_MODE=snapshot and SNAPSHOT_STORE_DIR",
    );
  }
  const fixture = env.PROJECT_FIXTURE ?? "fixture-sz-rostov";
  const store = openSnapshotStore(env.SNAPSHOT_STORE_DIR);
  const trust = loadTrustSetFromFile(
    resolveTrustFile(cwd, fixture, env.SNAPSHOT_STORE_DIR),
  );
  let providerDir: string | null = null;
  try {
    if (env.PROVIDER_ORIGIN) {
      providerDir = mkdtempSync(join(tmpdir(), "sz-http-"));
      await downloadProviderSnapshot(
        env.PROVIDER_ORIGIN,
        providerDir,
        (path, bytes) => {
          mkdirSync(dirname(path), { recursive: true });
          writeFileSync(path, bytes);
        },
        join,
      );
    }
    const originDir =
      providerDir ?? process.env.PROVIDER_DIR ?? join(cwd, "fixtures", fixture);
    const provider = createHubAdapter(originDir);
    runProviderSync({
      storeRoot: env.SNAPSHOT_STORE_DIR,
      provider,
      trust,
      expectedProjectId: fixture,
      reservedRoots: [
        ...DEFAULT_RESERVED_SLUGS,
        grammar.developersSegment,
        grammar.developmentSegment,
        grammar.propertySegment,
        grammar.objectNamespace,
        grammar.teamSegment,
      ],
    });
    flushPendingAcks(env.SNAPSHOT_STORE_DIR, provider);
  } finally {
    if (providerDir) {
      rmSync(providerDir, { recursive: true, force: true });
    }
  }
  consumeSyncSignal(store);
}

async function flushLeads(): Promise<void> {
  const env = loadEnv();
  if (env.LEAD_TRANSPORT === "none") {
    return;
  }
  if (!env.LEAD_SPOOL_KEY || !env.LEAD_SPOOL_DIR) {
    return;
  }
  const sink = createLeadTransportSink(env);
  if (!sink) {
    return;
  }
  await flushLeadSpool(processLeadSpool(env), sink);
}

async function main(): Promise<void> {
  const cwd = process.cwd();
  let lastPoll = 0;
  while (true) {
    const env = loadEnv();
    if (env.DATA_MODE !== "snapshot" || !env.SNAPSHOT_STORE_DIR) {
      throw new Error(
        "sync worker requires DATA_MODE=snapshot and SNAPSHOT_STORE_DIR",
      );
    }
    const store = openSnapshotStore(env.SNAPSHOT_STORE_DIR);
    const signaled = consumeSyncSignal(store);
    const due = Date.now() - lastPoll >= POLL_MS;
    if (signaled || due) {
      lastPoll = Date.now();
      try {
        await flushLeads();
        await syncOnce(cwd);
      } catch (error) {
        const reason = error instanceof Error ? error.message : "sync failed";
        console.error(reason);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, TICK_MS));
  }
}

void main();
