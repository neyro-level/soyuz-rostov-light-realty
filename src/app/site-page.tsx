import { notFound, permanentRedirect } from "next/navigation";
import type { MoneyDTO } from "@/platform/catalog";
import { buildHref } from "@/platform/grammar";
import {
  CatalogGrid,
  DevelopmentCard,
  LeadForm,
  PropertyCard,
  StarterPageShell,
} from "@/platform/ui";
import type { LeadFormConfig } from "@/ui/layout/header";
import { site } from "@/project/site.config";
import { buildHomeModel } from "@/project/build-home-model";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import {
  getRealtyRepository,
  loadRegistry,
  resolveAppMetadata,
} from "@/project/runtime";
import {
  isDevelopmentCatalogEntry,
  isH3CatalogEntryPageKey,
} from "@/project/catalog-entry.config";
import { isH4EntityPageKey } from "@/project/entity-pages.config";
import {
  type H5UtilityPageKey,
  h5UtilityBodies,
  isH5UtilityPageKey,
} from "@/project/utility-pages.config";
import { navigation } from "@/project/navigation.config";
import {
  type H2StaticPageKey,
  h2StarterBodies,
  isH2StaticPageKey,
} from "@/project/starter-pages.config";
import { EntityDetailSlot } from "@/ui/sections/entity-detail-slot";
import { HomePage } from "@/ui/sections/home-page";
import { EmptyState } from "@/ui/shared/empty-state";
import { LeadDialog } from "@/ui/shared/lead-dialog";
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

function propertyHrefParams(listing: { slug: string; publicUrlId: string }) {
  return { slug: listing.slug, publicUrlId: listing.publicUrlId };
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
    const listing = await repo.getProperty(params.publicUrlId ?? "");
    if (!listing) {
      notFound();
    }
    if (params.slug !== listing.slug) {
      const href = buildHref(
        grammar,
        features,
        "property",
        propertyHrefParams(listing),
      );
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
  if (pageKey === "agent" && !(await repo.getAgent(params.slug ?? ""))) {
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
  const leadForm = {
    actionUrl: "/api/public/leads/",
    consentHref,
    consentLabel: uiText.form.consentLabel,
    consentLinkLabel: uiText.form.consentLinkLabel,
    nameLabel: uiText.form.nameLabel,
    pageKey,
    phoneLabel: uiText.form.phoneLabel,
    retryMessage: uiText.form.retryMessage,
    submitLabel: uiText.form.submitLabel,
    thanksUrl,
    transportDisabledMessage: uiText.form.transportDisabledMessage,
  };
  if (pageKey === "home") {
    const model = await buildHomeModel(
      grammar,
      features,
      loadRegistry(),
    );
    return (
      <HomePage
        leadForm={leadForm}
        leadFormPageKey="home"
        model={model}
      />
    );
  }
  const homeHref = buildHref(grammar, features, "home") ?? "/";
  const breadcrumbs = [
    { label: site.brand, href: homeHref },
    { label: contextResolved.h1 },
  ];
  const starterContent = isH2StaticPageKey(pageKey) ? (
    <StaticStarterSlot leadForm={leadForm} pageKey={pageKey} />
  ) : isH4EntityPageKey(pageKey) ? (
    <EntityDetailSlot
      hidePrice={contextResolved.hidePrice}
      leadForm={leadForm}
      pageKey={pageKey}
      params={params}
    />
  ) : isH5UtilityPageKey(pageKey) ? (
    <UtilityStarterSlot
      pageKey={pageKey}
      registryLead={contextResolved.description}
    />
  ) : (
    <CatalogSlot
      gate={contextResolved.gate}
      hidePrice={contextResolved.hidePrice}
      pageKey={pageKey}
    />
  );
  const hasStarterContent =
    isH2StaticPageKey(pageKey) ||
    isH4EntityPageKey(pageKey) ||
    isH5UtilityPageKey(pageKey) ||
    isH3CatalogEntryPageKey(pageKey) ||
    pageKey === "developers" ||
    pageKey === "team";

  return (
    <StarterPageShell
      breadcrumbs={breadcrumbs}
      lead={contextResolved.description}
      title={contextResolved.h1}
    >
      {hasStarterContent ? starterContent : null}
    </StarterPageShell>
  );
}

function UtilityStarterSlot({
  pageKey,
  registryLead,
}: {
  pageKey: H5UtilityPageKey;
  registryLead: string;
}) {
  return (
    <div
      className="flex max-w-2xl flex-col gap-[var(--sr-space-lg)]"
      data-testid="utility-content"
    >
      <p className="text-[length:var(--sr-body-size)] leading-relaxed text-[var(--sr-muted-foreground)]">
        {h5UtilityBodies[pageKey]}
      </p>
      {pageKey === "privacy" || pageKey === "consent" ? (
        <p className="text-sm text-[var(--sr-muted-foreground)]">{registryLead}</p>
      ) : null}
      {pageKey === "search" ? (
        <label className="flex flex-col gap-[var(--sr-space-xs)]">
          <span className="text-sm text-[var(--sr-muted-foreground)]">Поиск</span>
          <input
            aria-disabled="true"
            className="min-h-11 rounded-lg border border-border bg-[var(--sr-background)] px-[var(--sr-space-md)]"
            disabled
            placeholder="Скоро будет доступен в каталоге"
            type="search"
          />
        </label>
      ) : null}
      {pageKey === "favorites" ? (
        <p className="text-sm text-[var(--sr-muted-foreground)]">
          Список избранного пуст.
        </p>
      ) : null}
    </div>
  );
}

function StaticStarterSlot({
  pageKey,
  leadForm,
}: {
  pageKey: H2StaticPageKey;
  leadForm: LeadFormConfig;
}) {
  if (pageKey === "contacts") {
    return <LeadForm {...leadForm} />;
  }
  const body = h2StarterBodies[pageKey];
  return (
    <div className="flex max-w-2xl flex-col gap-[var(--sr-space-lg)]">
      <p className="text-[length:var(--sr-body-size)] leading-relaxed text-[var(--sr-muted-foreground)]">
        {body}
      </p>
      <LeadDialog
        ctaLabel={navigation.ctaLabel}
        leadForm={leadForm}
        className="w-fit"
      />
    </div>
  );
}

async function CatalogSlot({
  pageKey,
  hidePrice,
  gate,
}: {
  pageKey: string;
  hidePrice: boolean;
  gate: "PASS" | "FAIL";
}) {
  if (isH3CatalogEntryPageKey(pageKey) && gate === "FAIL") {
    return (
      <EmptyState
        message="Каталог временно недоступен для индексации. Данные обновляются."
        title="Раздел на проверке"
      />
    );
  }
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
  if (pageKey === "team") {
    const agents = await repo.listAgents();
    return (
      <CatalogGrid>
        {agents.map((item) => {
          const href = buildHref(grammar, features, "agent", {
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
  if (isDevelopmentCatalogEntry(pageKey)) {
    const developments = await repo.listDevelopments();
    if (developments.length === 0) {
      return (
        <div data-testid="catalog-grid">
          <EmptyState
            message="Новые объекты появятся после обновления каталога."
            title="Пока нет новостроек"
          />
        </div>
      );
    }
    return (
      <div data-testid="catalog-grid">
        <CatalogGrid>
        {developments.map((item) => {
          const href = buildHref(grammar, features, "development", {
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
      </div>
    );
  }
  if (
    !isH3CatalogEntryPageKey(pageKey) ||
    (pageKey !== "catKvartiry" && pageKey !== "facetVtorichka")
  ) {
    return null;
  }
  const listings = await repo.listProperties(
    pageKey === "facetVtorichka" ? { dealKind: "SECONDARY_SALE" } : undefined,
  );
  if (listings.length === 0) {
    return (
      <div data-testid="catalog-grid">
        <EmptyState
          message="Объекты появятся после обновления каталога."
          title="Пока нет предложений"
        />
      </div>
    );
  }
  return (
    <div data-testid="catalog-grid">
      <CatalogGrid>
      {listings.map((item) => {
        const href = buildHref(
          grammar,
          features,
          "property",
          propertyHrefParams(item),
        );
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
    </div>
  );
}
