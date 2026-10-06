import { notFound, permanentRedirect } from "next/navigation";
import type { MoneyDTO, PropertyCardDTO } from "@/platform/catalog";
import { buildHref } from "@/platform/grammar";
import {
  CatalogGrid,
  DevelopmentCard,
  LeadForm,
  PageBlock,
  PropertyCard,
} from "@/platform/ui";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { getRealtyRepository, resolveAppMetadata } from "@/project/runtime";
import { uiText } from "@/project/ui-text.config";

function formatPrice(price: MoneyDTO | null): string | undefined {
  if (!price) {
    return undefined;
  }
  const major = Number(price.amount) / 10 ** price.scale;
  if (!Number.isFinite(major)) {
    return undefined;
  }
  return String(Math.round(major));
}

function propertySemantic(listing: PropertyCardDTO): string {
  return `${listing.rooms ?? 1}k`;
}

export async function SitePage({
  pageKey,
  params = {},
}: {
  pageKey: string;
  params?: Record<string, string>;
}) {
  const repo = getRealtyRepository();
  const contextResolved = resolveAppMetadata(pageKey, params);
  if (pageKey === "property") {
    const listing = await repo.getProperty(params.id ?? "");
    if (!listing) {
      notFound();
    }
    const canonicalSemantic = `${listing.rooms ?? 1}k`;
    if (params.semantic !== canonicalSemantic) {
      const href = buildHref(grammar, features, "property", {
        semantic: canonicalSemantic,
        id: listing.publicUrlId,
      });
      if (href) {
        permanentRedirect(href);
      }
      notFound();
    }
  }
  if (
    pageKey === "development" &&
    !(await repo.getDevelopment(params.slug ?? ""))
  ) {
    notFound();
  }
  if (
    pageKey === "developer" &&
    !(await repo.getDeveloper(params.slug ?? ""))
  ) {
    notFound();
  }
  const hasRoute = (key: string) =>
    grammar.routes.some((route) => route.pageKey === key);
  const consentHref = hasRoute("consent")
    ? (buildHref(grammar, features, "consent") ?? "/")
    : "/";
  const thanksUrl = hasRoute("thanks")
    ? (buildHref(grammar, features, "thanks") ?? "/")
    : "/";
  return (
    <PageBlock body={contextResolved.description} heading={contextResolved.h1}>
      <CatalogSlot hidePrice={contextResolved.hidePrice} pageKey={pageKey} />
      {pageKey === "contacts" ? (
        <LeadForm
          actionUrl="/api/public/leads/"
          consentHref={consentHref}
          consentLabel={uiText.form.consentLabel}
          consentLinkLabel={uiText.form.consentLinkLabel}
          nameLabel={uiText.form.nameLabel}
          pageKey={pageKey}
          phoneLabel={uiText.form.phoneLabel}
          retryMessage={uiText.form.retryMessage}
          submitLabel={uiText.form.submitLabel}
          thanksUrl={thanksUrl}
          transportDisabledMessage={uiText.form.transportDisabledMessage}
        />
      ) : null}
    </PageBlock>
  );
}

async function CatalogSlot({
  pageKey,
  hidePrice,
}: {
  pageKey: string;
  hidePrice: boolean;
}) {
  const repo = getRealtyRepository();
  if (pageKey === "developers") {
    const developers = await repo.listDevelopers();
    return (
      <CatalogGrid>
        {developers.map((item) => {
          const href = buildHref(grammar, features, "developer", {
            slug: item.slug,
          });
          return href ? (
            <DevelopmentCard
              href={href}
              key={item.uid}
              meta={item.slug}
              title={item.name}
            />
          ) : null;
        })}
      </CatalogGrid>
    );
  }
  if (
    pageKey !== "catNovostroyki" &&
    pageKey !== "catKvartiry" &&
    pageKey !== "facetVtorichka" &&
    !pageKey.startsWith("dist")
  ) {
    return null;
  }
  const listings = await repo.listProperties(
    pageKey === "facetVtorichka" ? { dealKind: "SECONDARY_SALE" } : undefined,
  );
  return (
    <CatalogGrid>
      {listings.map((item) => {
        const href = buildHref(grammar, features, "property", {
          semantic: propertySemantic(item),
          id: item.publicUrlId,
        });
        const price =
          hidePrice || item.hidePrice ? undefined : formatPrice(item.price);
        const metaParts = [
          item.title,
          item.rooms === null ? undefined : String(item.rooms),
          price,
        ].filter(Boolean);
        return href ? (
          <PropertyCard
            href={href}
            key={item.uid}
            meta={metaParts.join(" · ")}
            title={item.title}
          />
        ) : null;
      })}
    </CatalogGrid>
  );
}
