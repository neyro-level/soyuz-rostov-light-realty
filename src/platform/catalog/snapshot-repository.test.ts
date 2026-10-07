import { describe, expect, it } from "vitest";
import type { PublicInventoryDto } from "../hub/contract";
import { roomsOf } from "./entities";
import { SnapshotRepository } from "./snapshot-repository";

const thresholds = {
  hideAfterDays: 45,
  failAfterDays: 120,
  developmentTextFailAfterDays: 180,
};

function listing(facts: PublicInventoryDto["facts"]): PublicInventoryDto {
  return {
    uid: "uid-1",
    publicUrlId: "aaaaa2",
    propertyType: "LAND",
    transactionType: "SALE",
    addressPublic: "Public street",
    geoPrecision: "street",
    facts,
    slugHistory: [],
    media: [],
    status: "ACTIVE",
  };
}

describe("honest catalog DTO", () => {
  it("returns null rooms instead of inventing 1", () => {
    expect(roomsOf(listing({ lotAreaM2: 640 }))).toBeNull();
    expect(roomsOf(listing({ rooms: 2, totalAreaM2: 45 }))).toBe(2);
  });

  it("hides stale prices and keeps fresh minPrice", async () => {
    const cwd = process.cwd();
    const fresh = SnapshotRepository.fromRevisionDir(
      cwd,
      "fixtures/fixture-sz-rostov",
      true,
      { thresholds, now: new Date("2026-09-20T00:00:00Z") },
    );
    const cards = await fresh.listProperties();
    expect(cards.some((item) => item.hidePrice)).toBe(false);
    expect(cards[0]?.geoPrecision).toBeTruthy();

    const stale = SnapshotRepository.fromRevisionDir(
      cwd,
      "fixtures/fixture-sz-rostov",
      true,
      { thresholds, now: new Date("2027-01-01T00:00:00Z") },
    );
    const staleCards = await stale.listProperties();
    expect(staleCards.length).toBeGreaterThan(0);
    expect(staleCards.every((item) => item.hidePrice)).toBe(true);
    const development = (await stale.listDevelopments())[0];
    expect(development?.minPrice).toBeNull();
  });

  it("does not invent a developer slug", async () => {
    const developers = await SnapshotRepository.fromRevisionDir(
      process.cwd(),
      "fixtures/fixture-sz-rostov",
      true,
      { thresholds, now: new Date("2026-09-20T00:00:00Z") },
    ).listDevelopers();
    expect(
      developers.every((item) => item.slug === null || item.slug.length > 0),
    ).toBe(true);
    expect(developers.some((item) => item.slug?.startsWith("developer-"))).toBe(
      false,
    );
  });
});
