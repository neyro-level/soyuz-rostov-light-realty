import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSecurityHeaders } from "../src/platform/security";
import { analytics } from "../src/project/analytics.config";

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

const config = readFileSync(join(root, "next.config.ts"), "utf8");
check("next-config-headers", config.includes("buildSecurityHeaders"));
check("no-wildcard-csp-in-config", !config.includes("script-src *"));

const health = readFileSync(join(root, "src/app/healthz/route.ts"), "utf8");
check(
  "healthz-route",
  health.includes('degraded ? "degraded" : "ok"') &&
    health.includes("ok: !degraded") &&
    health.includes("leadSpoolPending"),
);

const optIn = readFileSync(
  join(root, "src/platform/analytics/opt-in.tsx"),
  "utf8",
);
check("metrika-gated-by-consent", optIn.includes("analytics_consent=1"));
check(
  "metrika-not-eager",
  optIn.includes('consent !== "yes"') && optIn.includes("mc.yandex.ru"),
);

const headers = buildSecurityHeaders({
  analyticsOrigins: analytics.origins,
});
const csp = headers.find((item) => item.key === "Content-Security-Policy");
const nonceHeaders = buildSecurityHeaders({
  analyticsOrigins: analytics.origins,
  nonce: "test-nonce",
  hsts: true,
});
const nonceCsp = nonceHeaders.find(
  (item) => item.key === "Content-Security-Policy",
);
check("csp-present", Boolean(csp?.value.includes("default-src 'self'")));
check("csp-no-wildcard", Boolean(csp && !csp.value.includes("*")));
check("csp-nonce", Boolean(nonceCsp?.value.includes("'nonce-test-nonce'")));
check(
  "hsts-production",
  nonceHeaders.some(
    (item) =>
      item.key === "Strict-Transport-Security" &&
      item.value.includes("max-age=31536000"),
  ),
);
check(
  "x-frame-deny",
  headers.some(
    (item) => item.key === "X-Frame-Options" && item.value === "DENY",
  ),
);
check(
  "nosniff",
  headers.some(
    (item) => item.key === "X-Content-Type-Options" && item.value === "nosniff",
  ),
);

const proxy = readFileSync(join(root, "src/proxy.ts"), "utf8");
check("csp-nonce-via-proxy", proxy.includes("createCspNonce"));
const dockerfile = readFileSync(join(root, "Dockerfile"), "utf8");
check("docker-healthcheck", dockerfile.includes("HEALTHCHECK"));
check("dockerfile-leads-route", dockerfile.includes("LEADS_ROUTE=direct"));
check("dockerfile-no-leads-mode", !dockerfile.includes("LEADS_MODE"));
check(
  "global-error-present",
  existsSync(join(root, "src/app/global-error.tsx")),
);

if (failed) {
  process.exit(1);
}
console.log("verify:security PASS");
