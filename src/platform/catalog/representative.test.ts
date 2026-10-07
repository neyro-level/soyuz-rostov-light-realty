import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  REPRESENTATIVE_DEVELOPMENT_COUNT,
  REPRESENTATIVE_PROPERTY_COUNT,
  writeRepresentativeFixtureTo,
} from "../../../scripts/generate-representative-fixture";
import { SnapshotRepository } from "./snapshot-repository";

const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("representative TEST dataset", () => {
  it("loads 5000 listings and 100 developments", async () => {
    const dir = mkdtempSync(join(tmpdir(), "sz-representative-"));
    dirs.push(dir);
    writeRepresentativeFixtureTo(dir);
    const marker = JSON.parse(readFileSync(join(dir, "TEST.json"), "utf8")) as {
      test?: boolean;
      kind?: string;
    };
    expect(marker.test).toBe(true);
    expect(marker.kind).toBe("representative");
    const repo = SnapshotRepository.fromRevisionDir(dir, ".", true, {
      thresholds: {
        hideAfterDays: 45,
        failAfterDays: 120,
        developmentTextFailAfterDays: 180,
      },
      now: new Date("2026-09-20T00:00:00Z"),
    });
    const properties = await repo.listProperties();
    const developments = await repo.listDevelopments();
    expect(properties).toHaveLength(REPRESENTATIVE_PROPERTY_COUNT);
    expect(developments).toHaveLength(REPRESENTATIVE_DEVELOPMENT_COUNT);
  });
});
