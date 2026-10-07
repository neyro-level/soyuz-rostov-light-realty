import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "../src/platform/env";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`PASS ${name}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
}

function throws(run: () => void): boolean {
  try {
    run();
    return false;
  } catch {
    return true;
  }
}

const example = readFileSync(join(root, ".env.example"), "utf8").replaceAll(
  "\r\n",
  "\n",
);
const envSource = readFileSync(join(root, "src/platform/env.ts"), "utf8");
const names = [
  "APP_ENV",
  "INDEXING_MODE",
  "DATA_MODE",
  "LEADS_ROUTE",
  "LEAD_TRANSPORT",
  "PROJECT_FIXTURE",
  "SNAPSHOT_STORE_DIR",
  "LOCAL_SNAPSHOT_DIR",
  "MEDIA_ORIGIN",
  "ANALYTICS_METRIKA_ID",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "LEAD_SPOOL_KEY",
  "LEAD_SPOOL_DIR",
  "LEAD_WEBHOOK_URL",
  "SYNC_SIGNAL_SECRET",
  "PROVIDER_ORIGIN",
];

for (const name of names) {
  check(`example-has-${name}`, new RegExp(`^${name}$`, "m").test(example));
}
check("example-no-assignments", !/^[A-Z][A-Z0-9_]*=/m.test(example));
check("zod-schema-present", envSource.includes("z.object"));
check(
  "smtp-pass-has-no-default",
  envSource.includes("assertNoSilentSecretFallback") &&
    envSource.includes("PLACEHOLDER_SECRETS"),
);

const defaults = loadEnv({} as NodeJS.ProcessEnv);
check("secret-undefined-by-default", defaults.SMTP_PASS === undefined);
check("indexing-default-staging", defaults.INDEXING_MODE === "staging");
check("data-mode-default-local", defaults.DATA_MODE === "local");
check("lead-transport-default-none", defaults.LEAD_TRANSPORT === "none");

check(
  "smtp-missing-secret-throws",
  throws(() =>
    loadEnv({ LEAD_TRANSPORT: "smtp" } as unknown as NodeJS.ProcessEnv),
  ),
);
check(
  "smtp-placeholder-secret-throws",
  throws(() =>
    loadEnv({
      LEAD_TRANSPORT: "smtp",
      SMTP_HOST: "smtp.example.test",
      SMTP_PORT: "587",
      SMTP_SECURE: "false",
      SMTP_USER: "user",
      SMTP_PASS: "changeme",
      SMTP_FROM: "noreply@example.test",
    } as unknown as NodeJS.ProcessEnv),
  ),
);

const smtp = loadEnv({
  LEAD_TRANSPORT: "smtp",
  SMTP_HOST: "smtp.example.test",
  SMTP_PORT: "587",
  SMTP_SECURE: "true",
  SMTP_USER: "user",
  SMTP_PASS: "ephemeral-test-key",
  SMTP_FROM: "noreply@example.test",
} as unknown as NodeJS.ProcessEnv);
check("smtp-explicit-secret-loads", smtp.SMTP_PASS === "ephemeral-test-key");

if (failed) {
  process.exit(1);
}
console.log("verify:env PASS");
