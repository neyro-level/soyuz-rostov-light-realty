import { describe, expect, it } from "vitest";
import { loadEnv } from "./env";

describe("loadEnv", () => {
  it("applies safe local defaults", () => {
    const parsed = loadEnv({});
    expect(parsed.APP_ENV).toBe("local");
    expect(parsed.DATA_MODE).toBe("local");
    expect(parsed.LEADS_ROUTE).toBe("direct");
  });
});
