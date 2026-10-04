import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildMediaSrc } from "../src/platform/media";

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
check("custom-loader", config.includes('loader: "custom"'));
check(
  "project-loader-file",
  config.includes('loaderFile: "./src/project/image-loader.ts"'),
);
check("no-remotePatterns", !config.includes("remotePatterns"));
check("no-wildcard-hosts", !config.includes("hostname: '*'"));
check("no-wildcard-pathname", !config.includes("pathname: '**'"));

const origin = "https://media.example.test";
check(
  "relative-src-uses-origin",
  buildMediaSrc("/photo.webp", 960, origin) ===
    "https://media.example.test/photo.webp?w=960",
);
check(
  "foreign-origin-unchanged",
  buildMediaSrc("https://other.example/a.jpg", 480, origin) ===
    "https://other.example/a.jpg",
);

if (failed) {
  process.exit(1);
}
console.log("verify:media PASS");
