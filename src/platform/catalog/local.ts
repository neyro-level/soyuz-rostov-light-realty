import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parsePublicInventoryDto } from "../hub/contract";

export function loadFixtureJson<T>(
  root: string,
  fixtureDir: string,
  fileName: string,
): T {
  return JSON.parse(
    readFileSync(join(root, fixtureDir, fileName), "utf8"),
  ) as T;
}

export function loadFixtureInventory(root: string, fixtureDir: string) {
  const raw = loadFixtureJson<unknown[]>(root, fixtureDir, "inventory.json");
  return raw.map((item) => parsePublicInventoryDto(item));
}
