import type { MoneyValue, PublicInventoryDto } from "../hub/contract";
import { loadFixtureInventory, loadFixtureJson } from "./local";

export type DeveloperRecord = {
  uid: string;
  slug: string;
  name: string;
};

export type DevelopmentRecord = {
  uid: string;
  publicUrlId?: string;
  name: string;
  developerUid?: string;
  checkedAt?: string;
};

export type CatalogSnapshot = {
  inventory: PublicInventoryDto[];
  developments: DevelopmentRecord[];
  developers: DeveloperRecord[];
};

export function loadCatalogSnapshot(
  root: string,
  fixtureDir: string,
): CatalogSnapshot {
  const developers = loadFixtureJson<DeveloperRecord[]>(
    root,
    fixtureDir,
    "developers.json",
  ).map((item) => ({
    ...item,
    slug: item.slug || `developer-${item.uid.replace(/^dev-/, "")}`,
  }));
  const developments = loadFixtureJson<DevelopmentRecord[]>(
    root,
    fixtureDir,
    "developments.json",
  );
  return {
    inventory: loadFixtureInventory(root, fixtureDir),
    developments,
    developers,
  };
}

export function roomsOf(listing: PublicInventoryDto): number {
  return "rooms" in listing.facts && typeof listing.facts.rooms === "number"
    ? listing.facts.rooms
    : 1;
}

export function propertySemantic(listing: PublicInventoryDto): string {
  return `${roomsOf(listing)}k`;
}

export function formatMoney(price?: MoneyValue): string | undefined {
  if (!price) {
    return undefined;
  }
  const major = Number(price.amount) / 10 ** price.scale;
  if (!Number.isFinite(major)) {
    return undefined;
  }
  return String(Math.round(major));
}

export function findProperty(
  snapshot: CatalogSnapshot,
  id: string | undefined,
): PublicInventoryDto | undefined {
  if (!id) {
    return undefined;
  }
  return snapshot.inventory.find((item) => item.publicUrlId === id);
}

export function findDevelopment(
  snapshot: CatalogSnapshot,
  slug: string | undefined,
): DevelopmentRecord | undefined {
  if (!slug) {
    return undefined;
  }
  return snapshot.developments.find((item) => item.publicUrlId === slug);
}

export function findDeveloper(
  snapshot: CatalogSnapshot,
  slug: string | undefined,
): DeveloperRecord | undefined {
  if (!slug) {
    return undefined;
  }
  return snapshot.developers.find((item) => item.slug === slug);
}

export function developmentOf(
  snapshot: CatalogSnapshot,
  listing: PublicInventoryDto,
): DevelopmentRecord | undefined {
  if (!listing.developmentUid) {
    return undefined;
  }
  return snapshot.developments.find(
    (item) => item.uid === listing.developmentUid,
  );
}

export function developerOf(
  snapshot: CatalogSnapshot,
  development: DevelopmentRecord | undefined,
): DeveloperRecord | undefined {
  if (!development?.developerUid) {
    return undefined;
  }
  return snapshot.developers.find(
    (item) => item.uid === development.developerUid,
  );
}

export function minPriceForDevelopment(
  snapshot: CatalogSnapshot,
  developmentUid: string,
): string | undefined {
  const prices = snapshot.inventory
    .filter((item) => item.developmentUid === developmentUid)
    .map((item) => formatMoney(item.price))
    .filter((value): value is string => Boolean(value))
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  if (prices.length === 0) {
    return undefined;
  }
  return String(Math.min(...prices));
}

export function listingCheckedAt(
  snapshot: CatalogSnapshot,
  listing: PublicInventoryDto,
): string | undefined {
  return developmentOf(snapshot, listing)?.checkedAt;
}
