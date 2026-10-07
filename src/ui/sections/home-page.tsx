import {
  Building2,
  Headphones,
  Home,
  KeyRound,
  Landmark,
  Percent,
} from "lucide-react";
import type { HomeModel } from "@/project/build-home-model";
import { homeContent } from "@/project/home.config";
import { site } from "@/project/site.config";
import {
  CatalogGrid,
  DevelopmentCard,
  LeadForm,
  PropertyCard,
} from "@/ui/domain";
import { SelectionServiceCard } from "@/ui/domain/selection-service-card";
import { ServiceLeadCard } from "@/ui/domain/service-lead-card";
import type { LeadFormConfig } from "@/ui/layout/header";
import { Badge } from "@/ui/primitives/badge";
import { Button } from "@/ui/primitives/button";
import { Container } from "@/ui/shared/container";
import { ImageFrame } from "@/ui/shared/image-frame";
import { LeadDialog } from "@/ui/shared/lead-dialog";
import { Section } from "@/ui/shared/section";
import { SectionHeader } from "@/ui/shared/section-header";

const quickRouteIcons = {
  building: Building2,
  home: Home,
  key: KeyRound,
  percent: Percent,
  landmark: Landmark,
  headphones: Headphones,
} as const;

export function HomePage({
  model,
  leadForm,
  leadFormPageKey,
}: {
  model: HomeModel;
  leadForm: LeadFormConfig;
  leadFormPageKey: string;
}) {
  const hero = homeContent.hero;
  const service = homeContent.service;
  const trust = homeContent.trust;
  const leadExpert = homeContent.leadExpert;

  return (
    <main className="flex-1">
      <Section
        tone="primary"
        className="!py-[var(--sr-section-lg-mobile)] md:!py-[var(--sr-section-lg-desktop)]"
      >
        <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
          <div className="grid items-center gap-[var(--sr-space-xl)] lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-[var(--sr-primary)] uppercase">
                {hero.eyebrow}
              </p>
              <h1 className="mt-[var(--sr-space-sm)] max-w-xl font-semibold text-[var(--sr-foreground)] text-[length:var(--sr-text-h2-mobile)] leading-[var(--sr-text-h2-leading)] md:text-[length:var(--sr-text-h2-tablet)] lg:text-[length:var(--sr-text-h2-desktop)]">
                {hero.titleLine1}
                <br />
                {hero.titleLine2}
              </h1>
              <p className="mt-[var(--sr-space-md)] max-w-lg text-[var(--sr-muted-foreground)]">
                {hero.supporting}
              </p>
              <div className="mt-[var(--sr-space-lg)] flex flex-wrap gap-[var(--sr-space-sm)]">
                <LeadDialog ctaLabel={hero.ctaLabel} leadForm={leadForm} />
              </div>
              <ul className="mt-[var(--sr-space-lg)] flex flex-wrap gap-[var(--sr-space-sm)]">
                {model.heroChips.map((chip) => (
                  <li key={chip.href}>
                    <Badge asChild variant="secondary">
                      <a
                        className="min-h-11 px-[var(--sr-space-md)]"
                        href={chip.href}
                      >
                        {chip.label}
                      </a>
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
            <ImageFrame
              aspect="4/3"
              className="bg-[var(--sr-surface-primary-strong)]"
            >
              <div className="flex h-full items-center justify-center text-[var(--sr-primary)]">
                <Building2 aria-hidden className="size-24" strokeWidth={1.25} />
              </div>
            </ImageFrame>
          </div>
        </Container>
      </Section>

      {model.quickRoutes.length > 0 ? (
        <Section tone="default">
          <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
            <ul className="grid gap-[var(--sr-space-sm)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {model.quickRoutes.map((route) => {
                const Icon =
                  quickRouteIcons[route.icon as keyof typeof quickRouteIcons] ??
                  Building2;
                return (
                  <li key={route.href}>
                    <a
                      className="flex min-h-11 flex-col items-start gap-[var(--sr-space-sm)] rounded-md border border-[var(--sr-border)] bg-[var(--sr-card)] p-[var(--sr-space-md)] transition-colors hover:border-[var(--sr-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sr-primary)]"
                      href={route.href}
                    >
                      <Icon
                        aria-hidden
                        className="size-5 text-[var(--sr-primary)]"
                      />
                      <span className="text-sm font-medium text-[var(--sr-foreground)]">
                        {route.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </Container>
        </Section>
      ) : null}

      <Section tone="soft">
        <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
          <SectionHeader title={model.developmentsTitle} />
          {model.developmentsCatalogHref ? (
            <p className="-mt-[var(--sr-space-md)] mb-[var(--sr-space-lg)]">
              <a
                className="text-sm text-[var(--sr-primary)] underline-offset-4 hover:underline"
                href={model.developmentsCatalogHref}
              >
                Весь каталог
              </a>
            </p>
          ) : null}
          <CatalogGrid>
            {model.developments.map((item) => (
              <DevelopmentCard
                href={item.href}
                key={item.href}
                meta={item.meta}
                priceLabel={item.priceLabel}
                title={item.title}
              />
            ))}
            <SelectionServiceCard
              ctaLabel={model.selectionCard.ctaLabel}
              leadForm={{
                ...leadForm,
                pageKey: `${leadFormPageKey}-selection`,
              }}
              text={model.selectionCard.text}
              title={model.selectionCard.title}
            />
          </CatalogGrid>
        </Container>
      </Section>

      <Section>
        <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
          <SectionHeader title={model.interestTitle} />
          <CatalogGrid>
            {model.properties.slice(0, 4).map((item) => (
              <PropertyCard
                href={item.href}
                key={item.href}
                meta={item.meta}
                title={item.title}
              />
            ))}
            <ServiceLeadCard
              ctaLabel={model.interestServiceCard.ctaLabel}
              leadForm={{ ...leadForm, pageKey: `${leadFormPageKey}-interest` }}
              text={model.interestServiceCard.text}
              title={model.interestServiceCard.title}
            />
            {model.properties.slice(4).map((item) => (
              <PropertyCard
                href={item.href}
                key={item.href}
                meta={item.meta}
                title={item.title}
              />
            ))}
          </CatalogGrid>
        </Container>
      </Section>

      <Section tone="primary">
        <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
          <div className="grid items-center gap-[var(--sr-space-xl)] lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-[var(--sr-primary)] uppercase">
                {service.eyebrow}
              </p>
              <h2 className="mt-[var(--sr-space-sm)] font-semibold text-[var(--sr-foreground)] text-[length:var(--sr-text-h2-mobile)] md:text-[length:var(--sr-text-h2-tablet)]">
                {service.titleLine1}
                <br />
                {service.titleLine2}
              </h2>
              <p className="mt-[var(--sr-space-md)] text-[var(--sr-muted-foreground)]">
                {service.text}
              </p>
              <div className="mt-[var(--sr-space-lg)] flex flex-wrap gap-[var(--sr-space-sm)]">
                {model.servicePrimaryHref ? (
                  <LeadDialog
                    ctaLabel={service.primaryCta}
                    leadForm={{
                      ...leadForm,
                      pageKey: `${leadFormPageKey}-service`,
                    }}
                  />
                ) : null}
                {model.serviceSecondaryHref ? (
                  <Button asChild className="min-h-11" variant="outline">
                    <a href={model.serviceSecondaryHref}>
                      {service.secondaryCta}
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
            <ImageFrame aspect="16/9" className="bg-[var(--sr-surface-soft)]">
              <div className="flex h-full items-center justify-center p-[var(--sr-space-lg)] text-center text-sm text-[var(--sr-muted-foreground)]">
                Сопровождение сделки с недвижимостью
              </div>
            </ImageFrame>
          </div>
        </Container>
      </Section>

      <Section tone="soft">
        <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
          <div className="grid items-center gap-[var(--sr-space-xl)] lg:grid-cols-2">
            <ImageFrame
              aspect="3/4"
              className="max-w-md bg-[var(--sr-surface-base)]"
            >
              <div className="flex h-full flex-col justify-end p-[var(--sr-space-lg)]">
                <p className="text-sm font-medium text-[var(--sr-foreground)]">
                  {site.director}
                </p>
                <p className="text-sm text-[var(--sr-muted-foreground)]">
                  {site.brand}
                </p>
              </div>
            </ImageFrame>
            <div>
              <p className="text-xs font-medium tracking-wide text-[var(--sr-primary)] uppercase">
                {trust.eyebrow}
              </p>
              <h2 className="mt-[var(--sr-space-sm)] font-semibold text-[var(--sr-foreground)] text-[length:var(--sr-text-h2-mobile)] md:text-[length:var(--sr-text-h2-tablet)]">
                {trust.titleLine1}
                <br />
                {trust.titleLine2}
              </h2>
              <p className="mt-[var(--sr-space-md)] text-[var(--sr-muted-foreground)]">
                {trust.paragraph1}
              </p>
              <p className="mt-[var(--sr-space-md)] text-[var(--sr-muted-foreground)]">
                {trust.paragraph2}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
          <div className="grid gap-[var(--sr-space-xl)] lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-[var(--sr-primary)] uppercase">
                {leadExpert.eyebrow}
              </p>
              <h2 className="mt-[var(--sr-space-sm)] font-semibold text-[var(--sr-foreground)] text-[length:var(--sr-text-h2-mobile)] md:text-[length:var(--sr-text-h2-tablet)]">
                {leadExpert.titleLine1}
                <br />
                {leadExpert.titleLine2}
              </h2>
              <p className="mt-[var(--sr-space-md)] text-[var(--sr-muted-foreground)]">
                {leadExpert.text}
              </p>
            </div>
            <LeadForm
              {...leadForm}
              pageKey={`${leadFormPageKey}-expert`}
              submitLabel={leadExpert.submitLabel}
            />
          </div>
        </Container>
      </Section>

      <Section tone="soft">
        <Container className="px-[var(--sr-container-padding-mobile)] md:px-[var(--sr-container-padding-tablet)] lg:px-[var(--sr-container-padding-desktop)]">
          <SectionHeader title={homeContent.popularSearches.title} />
          <div className="grid gap-[var(--sr-space-xl)] sm:grid-cols-2 lg:grid-cols-4">
            {model.popularGroups.map((group) => (
              <section key={group.title}>
                <h3 className="mb-[var(--sr-space-sm)] text-xs font-medium uppercase tracking-wide text-[var(--sr-subtle-foreground)]">
                  {group.title}
                </h3>
                <ul className="flex flex-col gap-[var(--sr-space-xs)]">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        className="inline-flex min-h-11 items-center text-sm text-[var(--sr-foreground)] underline-offset-4 hover:text-[var(--sr-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sr-primary)]"
                        href={link.href}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
