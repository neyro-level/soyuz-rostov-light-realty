import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "../src/project/performance.config";

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

const gallery = readFileSync(join(root, "src/platform/ui/gallery.tsx"), "utf8");
const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");

check("lcp-budget-2500ms", performance.lcpMs <= 2500 && performance.lcpMs > 0);
check("cls-budget-0.1", performance.cls <= 0.1 && performance.cls > 0);
check("gallery-lazy-below-fold", gallery.includes('loading="lazy"'));
check("gallery-uses-next-image", gallery.includes('from "next/image"'));
check("custom-image-loader", nextConfig.includes('loader: "custom"'));
check("no-wildcard-remote-patterns", !nextConfig.includes("remotePatterns"));

if (failed) {
  process.exit(1);
}
console.log("verify:performance PASS");
