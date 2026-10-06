import type { MoneyDTO } from "@/platform/catalog";
import { buildHref } from "@/platform/grammar";

function formatPrice(price: MoneyDTO | null): string | undefined {
  if (!price) {
    return undefined;
  }
  const major = Number(price.amount) / 10 ** price.scale;
  if (!Number.isFinite(major)) {
    return undefined;
  }
  return `${Math.round(major).toLocaleString("ru-RU")} ₽`;
}
import type { H4EntityPageKey } from "@/project/entity-pages.config";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { getRealtyRepository } from "@/project/runtime";

export type EntityGalleryItem = { src: string; alt: string };

export type EntityFact = { label: string; value: string };

export type EntityListingCard = {
  uid: string;
  href: string;
  title: string;
  meta: string;
};

export type EntityDetailModel =
  | {
      kind: "property";
      gallery: EntityGalleryItem[];
      facts: EntityFact[];
      description: string | null;
      priceDisplay: string | undefined;
      hidePriceOnEntity: boolean;
    }
  | {
      kind: "development";
      gallery: EntityGalleryItem[];
      facts: EntityFact[];
      description: string | null;
      minPriceDisplay: string | undefined;
      relatedListings: EntityListingCard[];
    }
  | {
      kind: "developer";
      facts: EntityFact[];
      developments: EntityListingCard[];
    }
  | {
      kind: "agent";
      role: string | null;
      bio: string | null;
      workPhone: string | null;
      listings: EntityListingCard[];
    };

export async function loadEntityDetailModel(
  pageKey: H4EntityPageKey,
  params: Record<string, string>,
): Promise<EntityDetailModel | null> {
  const repo = getRealtyRepository();

  if (pageKey === "property") {
    const item = await repo.getProperty(params.publicUrlId ?? "");
    if (!item) {
      return null;
    }
    const facts = [
      item.rooms !== null ? { label: "Комнат", value: String(item.rooms) } : null,
      item.area !== null ? { label: "Площадь", value: `${item.area} м²` } : null,
      item.floor !== null && item.floorsTotal !== null
        ? {
            label: "Этаж",
            value: `${item.floor} из ${item.floorsTotal}`,
          }
        : null,
    ].filter(Boolean) as EntityFact[];

    return {
      kind: "property",
      gallery: item.media.map((m) => ({
        src: m.src,
        alt: m.alt ?? item.title,
      })),
      facts,
      description: item.description,
      priceDisplay: formatPrice(item.price),
      hidePriceOnEntity: item.hidePrice,
    };
  }

  if (pageKey === "development") {
    const item = await repo.getDevelopment(params.slug ?? "");
    if (!item) {
      return null;
    }
    const facts = [
      item.developer
        ? { label: "Застройщик", value: item.developer.name }
        : null,
      item.geo ? { label: "Город", value: item.geo.name } : null,
    ].filter(Boolean) as EntityFact[];

    const relatedListings = item.properties
      .slice(0, 6)
      .map((listing) => {
        const href = buildHref(grammar, features, "property", {
          slug: listing.slug,
          publicUrlId: listing.publicUrlId,
        });
        if (!href) {
          return null;
        }
        return {
          uid: listing.uid,
          href,
          title: listing.title,
          meta: listing.title,
        };
      })
      .filter(Boolean) as EntityListingCard[];

    return {
      kind: "development",
      gallery: item.media.map((m) => ({
        src: m.src,
        alt: m.alt ?? item.name,
      })),
      facts,
      description: item.description,
      minPriceDisplay: formatPrice(item.properties[0]?.price ?? null),
      relatedListings,
    };
  }

  if (pageKey === "developer") {
    const item = await repo.getDeveloper(params.slug ?? "");
    if (!item) {
      return null;
    }
    const developments = (await repo.listDevelopments())
      .filter((dev) => dev.developerUid === item.uid)
      .map((dev) => {
        const href = buildHref(grammar, features, "development", {
          slug: dev.slug,
        });
        if (!href) {
          return null;
        }
        return {
          uid: dev.uid,
          href,
          title: dev.name,
          meta: dev.slug,
        };
      })
      .filter(Boolean) as EntityListingCard[];

    return {
      kind: "developer",
      facts: [{ label: "Застройщик", value: item.name }],
      developments,
    };
  }

  const agent = await repo.getAgent(params.slug ?? "");
  if (!agent) {
    return null;
  }
  const listings = (await repo.listProperties())
    .slice(0, 6)
    .map((listing) => {
      const href = buildHref(grammar, features, "property", {
        slug: listing.slug,
        publicUrlId: listing.publicUrlId,
      });
      if (!href) {
        return null;
      }
      return {
        uid: listing.uid,
        href,
        title: listing.title,
        meta: listing.title,
      };
    })
    .filter(Boolean) as EntityListingCard[];

  return {
    kind: "agent",
    role: agent.role,
    bio: agent.bio,
    workPhone: agent.workPhone,
    listings,
  };
}
