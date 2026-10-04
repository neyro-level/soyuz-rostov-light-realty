import { assertNoCollisions, type FeatureFlags, type GrammarConfig } from "@/platform/grammar";

export const features = {
  journal: "DISABLED",
  vtorichka: "DISABLED",
  yurist: "DISABLED",
  vacancies: "DISABLED",
  favorites: "DISABLED",
  search: "DISABLED",
} as const satisfies FeatureFlags;

export const grammar = {
  geoMode: "SINGLE_GEO",
  geo: "krasnodar",
  categories: ["novostroyki"],
  facets: {},
  districts: ["tsentralnyy", "zapadnyy", "prikubanskiy"],
  developersSegment: "developers",
  developmentSegment: "novostroyki",
  propertySegment: "kvartiry",
  routes: [
    { pageKey: "home", template: "/" },
    { pageKey: "geoHub", template: "/{geo}/" },
    { pageKey: "catNovostroyki", template: "/{geo}/novostroyki/" },
    {
      pageKey: "distTsentralnyy",
      template: "/{geo}/novostroyki/tsentralnyy/",
    },
    { pageKey: "distZapadnyy", template: "/{geo}/novostroyki/zapadnyy/" },
    {
      pageKey: "distPrikubanskiy",
      template: "/{geo}/novostroyki/prikubanskiy/",
    },
    { pageKey: "developers", template: "/{developersSegment}/" },
    { pageKey: "developer", template: "/{developersSegment}/{slug}/" },
    { pageKey: "development", template: "/{developmentSegment}/zhk-{slug}/" },
    { pageKey: "property", template: "/{propertySegment}/{semantic}-{id}/" },
    { pageKey: "about", template: "/o-kompanii/" },
    { pageKey: "contacts", template: "/kontakty/" },
  ],
} as const satisfies GrammarConfig;

assertNoCollisions(grammar);
