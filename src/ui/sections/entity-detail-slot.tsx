import {
  CatalogGrid,
  DevelopmentCard,
  Gallery,
  PropertyCard,
} from "@/platform/ui";
import type { EntityDetailModel } from "@/project/entity-detail-model";
import { navigation } from "@/project/navigation.config";
import { PriceDisplay } from "@/ui/domain/price-display";
import type { LeadFormConfig } from "@/ui/layout/header";
import { LeadDialog } from "@/ui/shared/lead-dialog";

function FactsList({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <dl className="grid gap-[var(--sr-space-sm)] sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-sm text-[var(--sr-muted-foreground)]">
            {item.label}
          </dt>
          <dd className="font-medium text-[var(--sr-foreground)]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function EntityDetailSlot({
  model,
  hidePrice,
  leadForm,
}: {
  model: EntityDetailModel;
  hidePrice: boolean;
  leadForm: LeadFormConfig;
}) {
  if (model.kind === "property") {
    return (
      <div
        className="flex flex-col gap-[var(--sr-space-lg)]"
        data-testid="entity-detail"
      >
        {model.gallery.length > 0 ? <Gallery items={model.gallery} /> : null}
        <FactsList items={model.facts} />
        <PriceDisplay
          hidden={hidePrice || model.hidePriceOnEntity}
          value={model.priceDisplay}
        />
        {model.description ? (
          <p className="max-w-3xl text-[var(--sr-muted-foreground)]">
            {model.description}
          </p>
        ) : null}
        <LeadDialog
          ctaLabel={navigation.ctaLabel}
          leadForm={leadForm}
          className="w-fit"
        />
      </div>
    );
  }

  if (model.kind === "development") {
    return (
      <div
        className="flex flex-col gap-[var(--sr-space-lg)]"
        data-testid="entity-detail"
      >
        {model.gallery.length > 0 ? <Gallery items={model.gallery} /> : null}
        <FactsList items={model.facts} />
        <div>
          <p className="mb-[var(--sr-space-xs)] text-sm text-[var(--sr-muted-foreground)]">
            Минимальная цена
          </p>
          <PriceDisplay hidden={hidePrice} value={model.minPriceDisplay} />
        </div>
        {model.description ? (
          <p className="max-w-3xl text-[var(--sr-muted-foreground)]">
            {model.description}
          </p>
        ) : null}
        {model.relatedListings.length > 0 ? (
          <CatalogGrid>
            {model.relatedListings.map((listing) => (
              <PropertyCard
                href={listing.href}
                key={listing.uid}
                meta={listing.meta}
                title={listing.title}
              />
            ))}
          </CatalogGrid>
        ) : null}
        <LeadDialog
          ctaLabel={navigation.ctaLabel}
          leadForm={leadForm}
          className="w-fit"
        />
      </div>
    );
  }

  if (model.kind === "developer") {
    return (
      <div
        className="flex flex-col gap-[var(--sr-space-lg)]"
        data-testid="entity-detail"
      >
        <FactsList items={model.facts} />
        {model.developments.length > 0 ? (
          <CatalogGrid>
            {model.developments.map((dev) => (
              <DevelopmentCard
                href={dev.href}
                key={dev.uid}
                meta={dev.meta}
                title={dev.title}
              />
            ))}
          </CatalogGrid>
        ) : null}
        <LeadDialog
          ctaLabel={navigation.ctaLabel}
          leadForm={leadForm}
          className="w-fit"
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-[var(--sr-space-lg)]"
      data-testid="entity-detail"
    >
      {model.role ? (
        <p className="text-[var(--sr-muted-foreground)]">{model.role}</p>
      ) : null}
      {model.bio ? (
        <p className="max-w-3xl text-[var(--sr-muted-foreground)]">
          {model.bio}
        </p>
      ) : null}
      {model.workPhone ? (
        <p className="text-[var(--sr-foreground)]">
          <a href={`tel:${model.workPhone}`}>{model.workPhone}</a>
        </p>
      ) : null}
      <CatalogGrid>
        {model.listings.map((listing) => (
          <PropertyCard
            href={listing.href}
            key={listing.uid}
            meta={listing.meta}
            title={listing.title}
          />
        ))}
      </CatalogGrid>
      <LeadDialog
        ctaLabel={navigation.ctaLabel}
        leadForm={leadForm}
        className="w-fit"
      />
    </div>
  );
}
