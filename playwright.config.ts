import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

function resolveDevCommand(): string {
  if (process.platform === "win32" && process.env.APPDATA) {
    const pnpm = join(process.env.APPDATA, "npm", "pnpm.cmd");
    if (existsSync(pnpm)) {
      return `"${pnpm}" dev --port 3000`;
    }
  }
  if (process.env.npm_execpath && existsSync(process.env.npm_execpath)) {
    return `"${process.env.npm_execpath}" dev --port 3000`;
  }
  return "pnpm dev --port 3000";
}

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: resolveDevCommand(),
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
