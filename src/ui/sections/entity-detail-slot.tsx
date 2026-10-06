import type { MoneyDTO } from "@/platform/catalog";
import { buildHref } from "@/platform/grammar";
import { getRealtyRepository } from "@/project/runtime";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { navigation } from "@/project/navigation.config";
import type { H4EntityPageKey } from "@/project/entity-pages.config";
import {
  CatalogGrid,
  DevelopmentCard,
  Gallery,
  PropertyCard,
} from "@/platform/ui";
import type { LeadFormConfig } from "@/ui/layout/header";
import { PriceDisplay } from "@/ui/domain/price-display";
import { LeadDialog } from "@/ui/shared/lead-dialog";

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

function FactsList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <dl className="grid gap-[var(--sr-space-sm)] sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-sm text-[var(--sr-muted-foreground)]">{item.label}</dt>
          <dd className="font-medium text-[var(--sr-foreground)]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export async function EntityDetailSlot({
  pageKey,
  params,
  hidePrice,
  leadForm,
}: {
  pageKey: H4EntityPageKey;
  params: Record<string, string>;
  hidePrice: boolean;
  leadForm: LeadFormConfig;
}) {
  const repo = getRealtyRepository();

  if (pageKey === "property") {
    const item = await repo.getProperty(params.publicUrlId ?? "");
    if (!item) {
      return null;
    }
    const galleryItems = item.media.map((m) => ({
      src: m.src,
      alt: m.alt ?? item.title,
    }));
    const facts = [
      item.rooms !== null ? { label: "Комнат", value: String(item.rooms) } : null,
      item.area !== null ? { label: "Площадь", value: `${item.area} м²` } : null,
      item.floor !== null && item.floorsTotal !== null
        ? {
            label: "Этаж",
            value: `${item.floor} из ${item.floorsTotal}`,
          }
        : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    return (
      <div className="flex flex-col gap-[var(--sr-space-lg)]" data-testid="entity-detail">
        {galleryItems.length > 0 ? <Gallery items={galleryItems} /> : null}
        <FactsList items={facts} />
        <PriceDisplay
          hidden={hidePrice || item.hidePrice}
          value={formatPrice(item.price)}
        />
        {item.description ? (
          <p className="max-w-3xl text-[var(--sr-muted-foreground)]">{item.description}</p>
        ) : null}
        <LeadDialog ctaLabel={navigation.ctaLabel} leadForm={leadForm} className="w-fit" />
      </div>
    );
  }

  if (pageKey === "development") {
    const item = await repo.getDevelopment(params.slug ?? "");
    if (!item) {
      return null;
    }
    const galleryItems = item.media.map((m) => ({
      src: m.src,
      alt: m.alt ?? item.name,
    }));
    const facts = [
      item.developer
        ? { label: "Застройщик", value: item.developer.name }
        : null,
      item.geo ? { label: "Город", value: item.geo.name } : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    return (
      <div className="flex flex-col gap-[var(--sr-space-lg)]" data-testid="entity-detail">
        {galleryItems.length > 0 ? <Gallery items={galleryItems} /> : null}
        <FactsList items={facts} />
        <div>
          <p className="mb-[var(--sr-space-xs)] text-sm text-[var(--sr-muted-foreground)]">
            Минимальная цена
          </p>
          <PriceDisplay
            hidden={hidePrice}
            value={
              item.properties[0]
                ? formatPrice(item.properties[0].price)
                : undefined
            }
          />
        </div>
        {item.description ? (
          <p className="max-w-3xl text-[var(--sr-muted-foreground)]">{item.description}</p>
        ) : null}
        {item.properties.length > 0 ? (
          <CatalogGrid>
            {item.properties.slice(0, 6).map((listing) => {
              const href = buildHref(grammar, features, "property", {
                slug: listing.slug,
                publicUrlId: listing.publicUrlId,
              });
              return href ? (
                <PropertyCard
                  href={href}
                  key={listing.uid}
                  meta={listing.title}
                  title={listing.title}
                />
              ) : null;
            })}
          </CatalogGrid>
        ) : null}
        <LeadDialog ctaLabel={navigation.ctaLabel} leadForm={leadForm} className="w-fit" />
      </div>
    );
  }

  if (pageKey === "developer") {
    const item = await repo.getDeveloper(params.slug ?? "");
    if (!item) {
      return null;
    }
    const developments = (await repo.listDevelopments()).filter(
      (dev) => dev.developerUid === item.uid,
    );

    return (
      <div className="flex flex-col gap-[var(--sr-space-lg)]" data-testid="entity-detail">
        <FactsList items={[{ label: "Застройщик", value: item.name }]} />
        {developments.length > 0 ? (
          <CatalogGrid>
            {developments.map((dev) => {
              const href = buildHref(grammar, features, "development", {
                slug: dev.slug,
              });
              return href ? (
                <DevelopmentCard
                  href={href}
                  key={dev.uid}
                  meta={dev.slug}
                  title={dev.name}
                />
              ) : null;
            })}
          </CatalogGrid>
        ) : null}
        <LeadDialog ctaLabel={navigation.ctaLabel} leadForm={leadForm} className="w-fit" />
      </div>
    );
  }

  const agent = await repo.getAgent(params.slug ?? "");
  if (!agent) {
    return null;
  }
  const agentListings = (await repo.listProperties()).slice(0, 6);

  return (
    <div className="flex flex-col gap-[var(--sr-space-lg)]" data-testid="entity-detail">
      {agent.role ? (
        <p className="text-[var(--sr-muted-foreground)]">{agent.role}</p>
      ) : null}
      {agent.bio ? (
        <p className="max-w-3xl text-[var(--sr-muted-foreground)]">{agent.bio}</p>
      ) : null}
      {agent.workPhone ? (
        <p className="text-[var(--sr-foreground)]">
          <a href={`tel:${agent.workPhone}`}>{agent.workPhone}</a>
        </p>
      ) : null}
      <CatalogGrid>
        {agentListings.map((listing) => {
          const href = buildHref(grammar, features, "property", {
            slug: listing.slug,
            publicUrlId: listing.publicUrlId,
          });
          return href ? (
            <PropertyCard
              href={href}
              key={listing.uid}
              meta={listing.title}
              title={listing.title}
            />
          ) : null;
        })}
      </CatalogGrid>
      <LeadDialog ctaLabel={navigation.ctaLabel} leadForm={leadForm} className="w-fit" />
    </div>
  );
}
