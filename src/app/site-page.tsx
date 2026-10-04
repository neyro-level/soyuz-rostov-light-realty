import { notFound, permanentRedirect } from "next/navigation";
import {
  findDeveloper,
  findDevelopment,
  findProperty,
  formatMoney,
  propertySemantic,
  roomsOf,
} from "@/platform/catalog/entities";
import { buildHref } from "@/platform/grammar";
import { resolvePageMetadata } from "@/platform/seo";
import {
  CatalogGrid,
  DevelopmentCard,
  LeadForm,
  PageBlock,
  PropertyCard,
} from "@/platform/ui";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { loadSnapshot, metadataContext } from "@/project/runtime";
import { uiText } from "@/project/ui-text.config";

export function SitePage({
  pageKey,
  params = {},
}: {
  pageKey: string;
  params?: Record<string, string>;
}) {
  const snapshot = loadSnapshot();
  const context = metadataContext();
  if (pageKey === "property") {
    const listing = findProperty(snapshot, params.id);
    if (!listing) {
      notFound();
    }
    const canonicalSemantic = propertySemantic(listing);
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
  if (pageKey === "development" && !findDevelopment(snapshot, params.slug)) {
    notFound();
  }
  if (pageKey === "developer" && !findDeveloper(snapshot, params.slug)) {
    notFound();
  }
  const resolved = resolvePageMetadata(pageKey, params, snapshot, context);
  const hasRoute = (key: string) =>
    grammar.routes.some((route) => route.pageKey === key);
  const consentHref = hasRoute("consent")
    ? (buildHref(grammar, features, "consent") ?? "/")
    : "/";
  const thanksUrl = hasRoute("thanks")
    ? (buildHref(grammar, features, "thanks") ?? "/")
    : "/";
  return (
    <PageBlock body={resolved.description} heading={resolved.h1}>
      <CatalogSlot hidePrice={resolved.hidePrice} pageKey={pageKey} />
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

function CatalogSlot({
  pageKey,
  hidePrice,
}: {
  pageKey: string;
  hidePrice: boolean;
}) {
  const snapshot = loadSnapshot();
  if (pageKey === "developers") {
    return (
      <CatalogGrid>
        {snapshot.developers.map((item) => {
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
  const listings =
    pageKey === "facetVtorichka"
      ? snapshot.inventory.filter((item) => item.dealKind === "SECONDARY_SALE")
      : snapshot.inventory;
  return (
    <CatalogGrid>
      {listings.map((item) => {
        const href = buildHref(grammar, features, "property", {
          semantic: propertySemantic(item),
          id: item.publicUrlId,
        });
        const developmentName = snapshot.developments.find(
          (row) => row.uid === item.developmentUid,
        )?.name;
        const price = hidePrice ? undefined : formatMoney(item.price);
        const metaParts = [
          developmentName ?? item.addressPublic,
          String(roomsOf(item)),
          price,
        ].filter(Boolean);
        return href ? (
          <PropertyCard
            href={href}
            key={item.uid}
            meta={metaParts.join(" · ")}
            title={developmentName ?? item.addressPublic}
          />
        ) : null;
      })}
    </CatalogGrid>
  );
}
