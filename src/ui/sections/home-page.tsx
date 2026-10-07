import {
  Building2,
  Headphones,
  Home,
  KeyRound,
  Landmark,
  Percent,
} from "lucide-react";
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

export type HomePageModel = {
  heroChips: Array<{ label: string; href: string }>;
  quickRoutes: Array<{ label: string; href: string; icon: string }>;
  developmentsTitle: string;
  developmentsCatalogHref?: string;
  developments: Array<{
    href: string;
    title: string;
    meta: string;
    priceLabel?: string;
  }>;
  selectionCard: { title: string; text: string; ctaLabel: string };
  interestTitle: string;
  properties: Array<{ href: string; title: string; meta: string }>;
  interestServiceCard: { title: string; text: string; ctaLabel: string };
  servicePrimaryHref?: string;
  serviceSecondaryHref?: string;
  popularGroups: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
};

export type HomePageCopy = {
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    supporting: string;
    ctaLabel: string;
  };
  service: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    text: string;
    primaryCta: string;
    secondaryCta: string;
  };
  trust: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    paragraph1: string;
    paragraph2: string;
  };
  leadExpert: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    text: string;
    submitLabel: string;
  };
  popularSearchesTitle: string;
  catalogAllLabel: string;
  dealSupportCaption: string;
  directorName: string;
  brand: string;
};

export function HomePage({
  model,
  copy,
  leadForm,
  leadFormPageKey,
}: {
  model: HomePageModel;
  copy: HomePageCopy;
  leadForm: LeadFormConfig;
  leadFormPageKey: string;
}) {
  const hero = copy.hero;
  const service = copy.service;
  const trust = copy.trust;
  const leadExpert = copy.leadExpert;

  return (
    <main className="flex-1">
      <Section size="hero" tone="primary">
        <Container>
          <div className="grid items-center gap-xl lg:grid-cols-2">
            <div>
              <p className="text-label font-bold tracking-[0.08em] text-primary uppercase">
                {hero.eyebrow}
              </p>
              <h1 className="mt-sm max-w-xl font-semibold text-balance text-h1 leading-heading text-foreground">
                {hero.titleLine1}
                <br />
                {hero.titleLine2}
              </h1>
              <p className="mt-md max-w-lg text-muted-foreground">
                {hero.supporting}
              </p>
              <div className="mt-lg flex flex-wrap gap-sm">
                <LeadDialog ctaLabel={hero.ctaLabel} leadForm={leadForm} />
              </div>
              <ul className="mt-lg flex flex-wrap gap-sm">
                {model.heroChips.map((chip) => (
                  <li key={chip.href}>
                    <Badge asChild variant="secondary">
                      <a className="min-h-11 px-md" href={chip.href}>
                        {chip.label}
                      </a>
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
            <ImageFrame aspect="4/3" className="bg-surface-primary-strong">
              <div className="flex h-full items-center justify-center text-primary">
                <Building2 aria-hidden className="size-24" strokeWidth={1.25} />
              </div>
            </ImageFrame>
          </div>
        </Container>
      </Section>

      {model.quickRoutes.length > 0 ? (
        <Section tone="default">
          <Container>
            <ul className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {model.quickRoutes.map((route) => {
                const Icon =
                  quickRouteIcons[route.icon as keyof typeof quickRouteIcons] ??
                  Building2;
                return (
                  <li key={route.href}>
                    <a
                      className="flex min-h-11 flex-col items-start gap-sm rounded-md border border-border bg-card p-md transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      href={route.href}
                    >
                      <Icon aria-hidden className="size-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">
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
        <Container>
          <SectionHeader
            action={
              model.developmentsCatalogHref ? (
                <a
                  className="text-sm text-primary underline-offset-4 hover:underline"
                  href={model.developmentsCatalogHref}
                >
                  {copy.catalogAllLabel}
                </a>
              ) : null
            }
            title={model.developmentsTitle}
          />
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
        <Container>
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
        <Container>
          <div className="grid items-center gap-xl lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-primary uppercase">
                {service.eyebrow}
              </p>
              <h2 className="mt-sm font-semibold text-foreground text-h2 leading-title">
                {service.titleLine1}
                <br />
                {service.titleLine2}
              </h2>
              <p className="mt-md text-muted-foreground">{service.text}</p>
              <div className="mt-lg flex flex-wrap gap-sm">
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
            <ImageFrame aspect="16/9" className="bg-surface-soft">
              <div className="flex h-full items-center justify-center p-lg text-center text-sm text-muted-foreground">
                {copy.dealSupportCaption}
              </div>
            </ImageFrame>
          </div>
        </Container>
      </Section>

      <Section tone="soft">
        <Container>
          <div className="grid items-center gap-xl lg:grid-cols-2">
            <ImageFrame aspect="3/4" className="max-w-md bg-surface-base">
              <div className="flex h-full flex-col justify-end p-lg">
                <p className="text-sm font-medium text-foreground">
                  {copy.directorName}
                </p>
                <p className="text-sm text-muted-foreground">{copy.brand}</p>
              </div>
            </ImageFrame>
            <div>
              <p className="text-xs font-medium tracking-wide text-primary uppercase">
                {trust.eyebrow}
              </p>
              <h2 className="mt-sm font-semibold text-foreground text-h2 leading-title">
                {trust.titleLine1}
                <br />
                {trust.titleLine2}
              </h2>
              <p className="mt-md text-muted-foreground">{trust.paragraph1}</p>
              <p className="mt-md text-muted-foreground">{trust.paragraph2}</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-xl lg:grid-cols-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-primary uppercase">
                {leadExpert.eyebrow}
              </p>
              <h2 className="mt-sm font-semibold text-foreground text-h2 leading-title">
                {leadExpert.titleLine1}
                <br />
                {leadExpert.titleLine2}
              </h2>
              <p className="mt-md text-muted-foreground">{leadExpert.text}</p>
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
        <Container>
          <SectionHeader title={copy.popularSearchesTitle} />
          <div className="grid gap-xl sm:grid-cols-2 lg:grid-cols-4">
            {model.popularGroups.map((group) => (
              <section key={group.title}>
                <h3 className="mb-sm text-xs font-medium uppercase tracking-wide text-subtle-foreground">
                  {group.title}
                </h3>
                <ul className="flex flex-col gap-xs">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        className="inline-flex min-h-11 items-center text-sm text-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
