import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
) as { dependencies?: Record<string, string> };
let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`PASS ${name}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}${detail ? `: ${detail}` : ""}`);
}

const layoutComponents = [
  "header.tsx",
  "footer.tsx",
  "breadcrumbs.tsx",
  "page-shell.tsx",
  "starter-page-shell.tsx",
  "mobile-navigation.tsx",
];
const domainComponents = [
  "property-card.tsx",
  "development-card.tsx",
  "developer-card.tsx",
  "agent-card.tsx",
  "catalog-grid.tsx",
  "filter-bar.tsx",
  "catalog-toolbar.tsx",
  "pagination.tsx",
  "gallery.tsx",
  "lead-form.tsx",
  "price-display.tsx",
  "decision-sidebar.tsx",
];
const sharedComponents = [
  "container.tsx",
  "section.tsx",
  "section-header.tsx",
  "image-frame.tsx",
  "cta.tsx",
  "empty-state.tsx",
  "error-state.tsx",
];

const shadcnPrimitives = [
  "button.tsx",
  "input.tsx",
  "label.tsx",
  "checkbox.tsx",
  "card.tsx",
  "badge.tsx",
  "sheet.tsx",
  "dialog.tsx",
  "accordion.tsx",
  "navigation-menu.tsx",
  "breadcrumb.tsx",
  "skeleton.tsx",
  "separator.tsx",
  "dropdown-menu.tsx",
];
for (const file of shadcnPrimitives) {
  const full = join(root, "src/ui/primitives", file);
  try {
    statSync(full);
    check(`primitive:${file}`, true);
  } catch {
    check(`primitive:${file}`, false, "missing");
  }
}
const componentsJson = JSON.parse(
  readFileSync(join(root, "components.json"), "utf8"),
) as { aliases?: { ui?: string } };
check(
  "components-json-ui-alias",
  componentsJson.aliases?.ui === "@/ui/primitives",
);
check("dep-lucide-react", Boolean(packageJson.dependencies?.["lucide-react"]));
check("dep-radix-ui", Boolean(packageJson.dependencies?.["radix-ui"]));
check(
  "dep-cva",
  Boolean(packageJson.dependencies?.["class-variance-authority"]),
);

for (const file of layoutComponents) {
  const full = join(root, "src/ui/layout", file);
  try {
    statSync(full);
    check(`layout:${file}`, true);
  } catch {
    check(`layout:${file}`, false, "missing");
  }
}
for (const file of domainComponents) {
  const full = join(root, "src/ui/domain", file);
  try {
    statSync(full);
    check(`domain:${file}`, true);
  } catch {
    check(`domain:${file}`, false, "missing");
  }
}
for (const file of sharedComponents) {
  const full = join(root, "src/ui/shared", file);
  try {
    statSync(full);
    check(`shared:${file}`, true);
  } catch {
    check(`shared:${file}`, false, "missing");
  }
}
check("ui-sections-dir", statSync(join(root, "src/ui/sections")).isDirectory());
const platformUiDir = join(root, "src/platform/ui");
const platformVisual = readdirSync(platformUiDir).filter((name) =>
  name.endsWith(".tsx"),
);
check(
  "platform-ui-not-visual-owner",
  platformVisual.length === 0,
  platformVisual.join(", "),
);

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
check("souz-primary-014eba", /--sr-primary:\s*#014eba/i.test(theme));
check("souz-radius-5px", /--sr-radius-md:\s*5px/.test(theme));
check("souz-container-1360", /--sr-container-max:\s*1360px/.test(theme));
check(
  "souz-h2-typography",
  theme.includes("--sr-text-h2-mobile") &&
    theme.includes("--sr-text-h2-desktop") &&
    theme.includes("--sr-text-h2-weight: 600"),
);

const rawColor = /#(?:[0-9a-fA-F]{3,8})\b|\brgb\(|\bhsl\(|\boklch\(/;
const bannedRadius = /\brounded-(?:xl|2xl|3xl)\b/;
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

for (const file of walk(join(root, "src/ui"))) {
  const text = readFileSync(file, "utf8");
  check(
    `ui-no-repository:${relative(root, file)}`,
    !text.includes("@/platform/catalog") &&
      !text.includes("RealtyRepository") &&
      !text.includes("getRealtyRepository"),
  );
}

for (const dir of ["src/platform/ui", "src/ui"]) {
  const base = join(root, dir);
  try {
    statSync(base);
  } catch {
    continue;
  }
  for (const file of walk(base)) {
    const text = readFileSync(file, "utf8");
    const colorMatch = text.match(rawColor);
    check(
      `no-raw-color:${relative(root, file)}`,
      !colorMatch,
      colorMatch ? colorMatch[0] : "",
    );
    const radiusMatch = text.match(bannedRadius);
    check(
      `no-banned-radius:${relative(root, file)}`,
      !radiusMatch,
      radiusMatch ? radiusMatch[0] : "",
    );
  }
}

const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
check("no-google-fonts-import", !layout.includes("next/font/google"));
check(
  "manrope-local-font",
  readFileSync(join(root, "src/ui/lib/fonts.ts"), "utf8").includes(
    "Manrope-cyrillic.woff2",
  ) &&
    readFileSync(join(root, "src/ui/lib/fonts.ts"), "utf8").includes(
      "Manrope-latin.woff2",
    ),
);
check(
  "manrope-files",
  statSync(join(root, "src/ui/lib/fonts/Manrope-latin.woff2")).isFile() &&
    statSync(join(root, "src/ui/lib/fonts/Manrope-cyrillic.woff2")).isFile(),
);
check(
  "manrope-license",
  statSync(join(root, "src/ui/lib/fonts/OFL.txt")).isFile(),
);
check(
  "no-googleapis-fonts",
  !readFileSync(join(root, "src/app/layout.tsx"), "utf8").includes(
    "fonts.googleapis",
  ) &&
    !readFileSync(
      join(root, "src/platform/security/headers.ts"),
      "utf8",
    ).includes("fonts.googleapis"),
);

if (failed) {
  process.exit(1);
}
console.log("verify:ui-core PASS");
