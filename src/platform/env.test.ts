import { describe, expect, it } from "vitest";
import { loadEnv } from "./env";

describe("loadEnv", () => {
  it("applies safe local defaults", () => {
    const parsed = loadEnv({ NODE_ENV: "test" });
    expect(parsed.APP_ENV).toBe("local");
    expect(parsed.DATA_MODE).toBe("local");
    expect(parsed.LEADS_ROUTE).toBe("direct");
  });

  it("requires SNAPSHOT_STORE_DIR outside local when DATA_MODE=snapshot", () => {
    expect(() =>
      loadEnv({ APP_ENV: "staging", DATA_MODE: "snapshot" }),
    ).toThrow(/SNAPSHOT_STORE_DIR/);
  });

  it("requires LOCAL_SNAPSHOT_DIR outside local when DATA_MODE=local", () => {
    expect(() =>
      loadEnv({ APP_ENV: "production", DATA_MODE: "local" }),
    ).toThrow(/LOCAL_SNAPSHOT_DIR/);
  });
});
