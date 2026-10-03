import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

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

const requiredComponents = [
  "header.tsx",
  "footer.tsx",
  "breadcrumbs.tsx",
  "property-card.tsx",
  "development-card.tsx",
  "catalog-grid.tsx",
  "filters.tsx",
  "pagination.tsx",
  "gallery.tsx",
  "lead-form.tsx",
];

for (const file of requiredComponents) {
  const full = join(root, "src/platform/ui", file);
  try {
    statSync(full);
    check(`component:${file}`, true);
  } catch {
    check(`component:${file}`, false, "missing");
  }
}

const theme = readFileSync(join(root, "src/project/theme.css"), "utf8");
const tokenNames = [
  "--sr-bg",
  "--sr-fg",
  "--sr-muted",
  "--sr-border",
  "--sr-accent",
  "--sr-radius-md",
  "--sr-space-md",
];
for (const token of tokenNames) {
  check(`token:${token}`, theme.includes(token));
}

const rawColor = /#(?:[0-9a-fA-F]{3,8})\b|\brgb\(|\bhsl\(|\boklch\(/;
function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, files);
      continue;
    }
    if (extname(full) === ".tsx") {
      files.push(full);
    }
  }
  return files;
}

for (const file of walk(join(root, "src/platform/ui"))) {
  const text = readFileSync(file, "utf8");
  const match = text.match(rawColor);
  check(
    `no-raw-color:${relative(root, file)}`,
    !match,
    match ? match[0] : "",
  );
}

if (failed) {
  process.exit(1);
}
console.log("verify:ui-core PASS");
