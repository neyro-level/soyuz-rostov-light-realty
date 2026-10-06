import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();

const forbiddenLiterals = [
  "Ростов",
  "Союз",
  "souz-home",
  "souz_home",
  "rostov-na-donu",
  "szrostov",
  "zastroyshchiki",
];

const uiForbiddenImportFragments = [
  "node:fs",
  "snapshot-repository",
  "/catalog/local",
  "/snapshot/store",
  "/snapshot/provider",
  "/snapshot/worker",
  "/snapshot/sync",
];

const appSnapshotForbiddenFragments = [
  "snapshot-repository",
  "/catalog/local",
  "/snapshot/store",
  "/snapshot/provider",
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
      continue;
    }
    if ([".ts", ".tsx", ".js", ".mjs", ".css"].includes(extname(full))) {
      files.push(full);
    }
  }
  return files;
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function isTypeOnlyImport(line) {
  return /^\s*import\s+type\b/.test(line);
}

function checkForbiddenImports(files, fragments, label, options = {}) {
  const { skipRelative = [] } = options;
  for (const file of files) {
    const rel = relative(root, file);
    if (skipRelative.some((prefix) => rel.startsWith(prefix))) {
      continue;
    }
    const lines = readFileSync(file, "utf8").split("\n");
    for (const line of lines) {
      if (!line.includes("import")) {
        continue;
      }
      if (isTypeOnlyImport(line)) {
        continue;
      }
      for (const fragment of fragments) {
        if (line.includes(fragment)) {
          fail(`${label}: ${rel} imports forbidden "${fragment}"`);
        }
      }
    }
  }
}

const platformFiles = walk(join(root, "src/platform"));
for (const file of platformFiles) {
  const text = readFileSync(file, "utf8");
  for (const literal of forbiddenLiterals) {
    if (text.includes(literal)) {
      fail(
        `platform-no-project-literals: ${relative(root, file)} contains "${literal}"`,
      );
    }
  }
}

const hrefPattern = /\bhref\s*=\s*["'][^"']+["']/g;
const codeFiles = [
  ...walk(join(root, "src/app")),
  ...walk(join(root, "src/platform")),
  ...walk(join(root, "src/project")),
];
for (const file of codeFiles) {
  const text = readFileSync(file, "utf8");
  const matches = text.match(hrefPattern);
  if (matches) {
    fail(`no-literal-hrefs: ${relative(root, file)} has ${matches.join(", ")}`);
  }
}

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const cyrillic = /[\u0400-\u04FF]/;
const appAndPlatform = [
  ...walk(join(root, "src/app")),
  ...walk(join(root, "src/platform")),
];
for (const file of appAndPlatform) {
  const stripped = stripComments(readFileSync(file, "utf8"));
  if (cyrillic.test(stripped)) {
    fail(`no-cyrillic: ${relative(root, file)}`);
  }
}

const uiFiles = walk(join(root, "src/ui"));
checkForbiddenImports(uiFiles, uiForbiddenImportFragments, "ui-no-data-source");
checkForbiddenImports(
  uiFiles,
  ['@/platform/snapshot"'],
  "ui-no-data-source",
);

const appFiles = walk(join(root, "src/app"));
checkForbiddenImports(
  appFiles,
  [...appSnapshotForbiddenFragments, "node:fs"],
  "app-no-snapshot-files",
  {
    skipRelative: [
      "src\\app\\api\\internal\\sync",
      "src/app/api/internal/sync",
      "src\\app\\healthz",
      "src/app/healthz",
    ],
  },
);
checkForbiddenImports(
  appFiles,
  ['@/platform/snapshot"'],
  "app-no-snapshot-files",
  { skipRelative: ["src\\app\\api\\internal\\sync", "src/app/api/internal/sync"] },
);

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("platform-no-project-literals: PASS");
console.log("no-literal-hrefs: PASS");
console.log("no-cyrillic: PASS");
console.log("ui-no-data-source: PASS");
console.log("app-no-snapshot-files: PASS");
