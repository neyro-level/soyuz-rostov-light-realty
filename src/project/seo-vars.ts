import type { CatalogSnapshot } from "@/platform/catalog/entities";
import {
  developerOf,
  developmentOf,
  findDeveloper,
  findDevelopment,
  findProperty,
  formatMoney,
  minPriceForDevelopment,
  roomsOf,
} from "@/platform/catalog/entities";

function factNumber(
  facts: CatalogSnapshot["inventory"][number]["facts"],
  key: "totalAreaM2" | "floor" | "floorsTotal",
): string | undefined {
  if (key in facts && typeof facts[key as keyof typeof facts] === "number") {
    return String(facts[key as keyof typeof facts]);
  }
  return undefined;
}

export function seoVarsForPage(
  pageKey: string,
  params: Record<string, string>,
  snapshot: CatalogSnapshot,
): Record<string, string | undefined> {
  if (pageKey === "property") {
    const listing = findProperty(snapshot, params.id);
    if (!listing) {
      return { ...params };
    }
    const development = developmentOf(snapshot, listing);
    const complexOrAddress = development?.name ?? listing.addressPublic;
    return {
      N: String(roomsOf(listing)),
      S: factNumber(listing.facts, "totalAreaM2"),
      floor: factNumber(listing.facts, "floor"),
      floors: factNumber(listing.facts, "floorsTotal"),
      "ЖК|район": complexOrAddress,
      "ЖК|адрес": complexOrAddress,
      Название: development?.name ?? listing.addressPublic,
      Застройщик: developerOf(snapshot, development)?.name,
      price: formatMoney(listing.price),
      semantic: `${roomsOf(listing)}k`,
      id: listing.publicUrlId,
    };
  }
  if (pageKey === "development") {
    const development = findDevelopment(snapshot, params.slug);
    if (!development) {
      return { ...params };
    }
    return {
      Название: development.name,
      Застройщик: developerOf(snapshot, development)?.name,
      minPrice: minPriceForDevelopment(snapshot, development.uid),
      slug: development.publicUrlId,
    };
  }
  if (pageKey === "developer") {
    const developer = findDeveloper(snapshot, params.slug);
    if (!developer) {
      return { ...params };
    }
    return {
      Застройщик: developer.name,
      slug: developer.slug,
    };
  }
  return { ...params };
}
