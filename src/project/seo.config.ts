import { seo as altSeo } from "../../fixtures/fixture-alt/project/seo.config";
import { isAltFixture } from "./data.config";

const primarySeo = {
  registryPath: "docs/seo/SEO_REGISTRY_SEED.csv",
  titleMin: 30,
  titleMax: 65,
  descriptionMin: 70,
  descriptionMax: 170,
  priceHideAfterDays: 45,
  priceGateFailAfterDays: 120,
  developmentTextFailAfterDays: 180,
  brandInTitlePageKeys: [
    "home",
    "ipoteka",
    "yurist",
    "about",
    "contacts",
    "vacancies",
    "privacy",
    "consent",
    "thanks",
    "favorites",
    "search",
    "notFound",
  ],
  catalogPageKeys: [
    "geoHub",
    "catNovostroyki",
    "catKvartiry",
    "facetVtorichka",
    "distLeninskiy",
    "distVoroshilovskiy",
    "distSevernyy",
    "distTsentr",
    "developers",
    "developer",
    "development",
    "property",
    "team",
    "agent",
  ],
} as const;

export const seo = isAltFixture() ? altSeo : primarySeo;
