import {
  CatalogGrid,
  DevelopmentCard,
  Gallery,
  PropertyCard,
} from "@/ui/domain";
import { PriceDisplay } from "@/ui/domain/price-display";
import type { LeadFormConfig } from "@/ui/layout/header";
import { LeadDialog } from "@/ui/shared/lead-dialog";

function FactsList({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <dl className="grid gap-sm sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-sm text-muted-foreground">{item.label}</dt>
          <dd className="font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type EntityDetailView =
  | {
      kind: "property";
      gallery: Array<{ src: string; alt: string }>;
      facts: Array<{ label: string; value: string }>;
      description: string | null;
      priceDisplay: string | undefined;
      hidePriceOnEntity: boolean;
    }
  | {
      kind: "development";
      gallery: Array<{ src: string; alt: string }>;
      facts: Array<{ label: string; value: string }>;
      description: string | null;
      minPriceDisplay: string | undefined;
      relatedListings: Array<{
        uid: string;
        href: string;
        title: string;
        meta: string;
      }>;
    }
  | {
      kind: "developer";
      facts: Array<{ label: string; value: string }>;
      developments: Array<{
        uid: string;
        href: string;
        title: string;
        meta: string;
      }>;
    }
  | {
      kind: "agent";
      role: string | null;
      bio: string | null;
      workPhone: string | null;
      listings: Array<{
        uid: string;
        href: string;
        title: string;
        meta: string;
      }>;
    };

export function EntityDetailSlot({
  model,
  hidePrice,
  leadForm,
  ctaLabel,
  minPriceLabel,
}: {
  model: EntityDetailView;
  hidePrice: boolean;
  leadForm: LeadFormConfig;
  ctaLabel: string;
  minPriceLabel: string;
}) {
  if (model.kind === "property") {
    return (
      <div className="flex flex-col gap-lg" data-testid="entity-detail">
        {model.gallery.length > 0 ? <Gallery items={model.gallery} /> : null}
        <FactsList items={model.facts} />
        <PriceDisplay
          hidden={hidePrice || model.hidePriceOnEntity}
          value={model.priceDisplay}
        />
        {model.description ? (
          <p className="max-w-3xl text-muted-foreground">{model.description}</p>
        ) : null}
        <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} className="w-fit" />
      </div>
    );
  }

  if (model.kind === "development") {
    return (
      <div className="flex flex-col gap-lg" data-testid="entity-detail">
        {model.gallery.length > 0 ? <Gallery items={model.gallery} /> : null}
        <FactsList items={model.facts} />
        <div>
          <p className="mb-xs text-sm text-muted-foreground">{minPriceLabel}</p>
          <PriceDisplay hidden={hidePrice} value={model.minPriceDisplay} />
        </div>
        {model.description ? (
          <p className="max-w-3xl text-muted-foreground">{model.description}</p>
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
        <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} className="w-fit" />
      </div>
    );
  }

  if (model.kind === "developer") {
    return (
      <div className="flex flex-col gap-lg" data-testid="entity-detail">
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
        <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} className="w-fit" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg" data-testid="entity-detail">
      {model.role ? (
        <p className="text-muted-foreground">{model.role}</p>
      ) : null}
      {model.bio ? (
        <p className="max-w-3xl text-muted-foreground">{model.bio}</p>
      ) : null}
      {model.workPhone ? (
        <p className="text-foreground">
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
      <LeadDialog ctaLabel={ctaLabel} leadForm={leadForm} className="w-fit" />
    </div>
  );
}
