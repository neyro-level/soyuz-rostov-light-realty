import type {
  DevelopmentCardDTO,
  MoneyDTO,
  PropertyCardDTO,
} from "@/platform/catalog";
import { buildHref, type FeatureFlags, type GrammarConfig } from "@/platform/grammar";
import type { SeoRegistryRow } from "@/platform/seo";
import { homeContent } from "./home.config";
import { getRealtyRepository } from "./runtime";

export type HomeLink = { label: string; href: string };

export type HomeDevelopmentItem = {
  href: string;
  title: string;
  meta: string;
  priceLabel?: string;
};

export type HomePropertyItem = {
  href: string;
  title: string;
  meta: string;
};

export type HomePopularGroup = {
  title: string;
  links: HomeLink[];
};

export type HomeModel = {
  heroChips: HomeLink[];
  quickRoutes: Array<HomeLink & { icon: string }>;
  developmentsTitle: string;
  developmentsCatalogHref?: string;
  developments: HomeDevelopmentItem[];
  selectionCard: (typeof homeContent)["developments"]["selectionCard"];
  interestTitle: string;
  properties: HomePropertyItem[];
  interestServiceCard: (typeof homeContent)["interest"]["serviceCard"];
  servicePrimaryHref?: string;
  serviceSecondaryHref?: string;
  popularGroups: HomePopularGroup[];
};

function formatPrice(price: MoneyDTO | null | undefined): string | undefined {
  if (!price) {
    return undefined;
  }
  const major = Number(price.amount) / 10 ** price.scale;
  if (!Number.isFinite(major)) {
    return undefined;
  }
  return String(Math.round(major));
}

function hasRoute(grammar: GrammarConfig, pageKey: string): boolean {
  return grammar.routes.some((route) => route.pageKey === pageKey);
}

function resolveLink(
  grammar: GrammarConfig,
  flags: FeatureFlags,
  registry: SeoRegistryRow[],
  pageKey: string,
  label: string,
  params: Record<string, string> = {},
): HomeLink | null {
  if (!hasRoute(grammar, pageKey)) {
    return null;
  }
  const href = buildHref(grammar, flags, pageKey, params);
  if (!href) {
    return null;
  }
  const row = registry.find((item) => item.pageKey === pageKey);
  if (row?.robotsDefault.toLowerCase().includes("noindex")) {
    return null;
  }
  return { label, href };
}

function developmentMeta(
  item: DevelopmentCardDTO,
  developerName?: string,
): string {
  const parts = [developerName].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Жилой комплекс";
}

function propertyMeta(item: PropertyCardDTO, price?: string): string {
  const parts = [
    item.rooms === null ? undefined : `${item.rooms}-комн.`,
    item.area === null ? undefined : `${item.area} м²`,
    price ? `от ${price} ₽` : undefined,
  ].filter(Boolean);
  return parts.join(" · ") || item.title;
}

export async function buildHomeModel(
  grammar: GrammarConfig,
  flags: FeatureFlags,
  registry: SeoRegistryRow[],
): Promise<HomeModel> {
  const repo = getRealtyRepository();
  const developers = await repo.listDevelopers();
  const developerName = (uid: string | null) =>
    developers.find((item) => item.uid === uid)?.name;

  const heroChips = homeContent.hero.chips
    .map((chip) =>
      resolveLink(grammar, flags, registry, chip.pageKey, chip.label),
    )
    .filter((item): item is HomeLink => item !== null);

  const quickRoutes: Array<HomeLink & { icon: string }> = [];
  for (const route of homeContent.quickRoutes) {
    if (quickRoutes.length >= 6) {
      break;
    }
    const link = resolveLink(
      grammar,
      flags,
      registry,
      route.pageKey,
      route.label,
    );
    if (link) {
      quickRoutes.push({ ...link, icon: route.icon });
    }
  }

  const developmentCards = (await repo.listDevelopments()).slice(0, 6);
  const developments: HomeDevelopmentItem[] = [];
  for (const item of developmentCards) {
    const href = buildHref(grammar, flags, "development", {
      slug: item.slug,
    });
    if (!href) {
      continue;
    }
    const price = formatPrice(item.minPrice);
    developments.push({
      href,
      title: item.name,
      meta: developmentMeta(item, developerName(item.developerUid)),
      priceLabel: price ? `от ${price} ₽` : undefined,
    });
  }

  const listings = (await repo.listProperties()).slice(0, 7);
  const properties: HomePropertyItem[] = [];
  for (const item of listings) {
    const href = buildHref(grammar, flags, "property", {
      slug: item.slug,
      publicUrlId: item.publicUrlId,
    });
    if (!href) {
      continue;
    }
    const price = item.hidePrice ? undefined : formatPrice(item.price);
    properties.push({
      href,
      title: item.title,
      meta: propertyMeta(item, price),
    });
  }

  const popularGroups: HomePopularGroup[] = [];
  for (const group of homeContent.popularSearches.groups) {
    const links: HomeLink[] = [];
    for (const pageKey of group.pageKeys) {
      const row = registry.find((item) => item.pageKey === pageKey);
      const label = row?.h1 ?? pageKey;
      const link = resolveLink(grammar, flags, registry, pageKey, label);
      if (link) {
        links.push(link);
      }
    }
    if (links.length > 0) {
      popularGroups.push({ title: group.title, links });
    }
  }

  return {
    heroChips,
    quickRoutes,
    developmentsTitle: homeContent.developments.title,
    developmentsCatalogHref: buildHref(grammar, flags, "catNovostroyki") ?? undefined,
    developments,
    selectionCard: homeContent.developments.selectionCard,
    interestTitle: homeContent.interest.title,
    properties,
    interestServiceCard: homeContent.interest.serviceCard,
    servicePrimaryHref: buildHref(grammar, flags, "contacts") ?? undefined,
    serviceSecondaryHref:
      buildHref(grammar, flags, homeContent.service.servicePageKey) ?? undefined,
    popularGroups,
  };
}
