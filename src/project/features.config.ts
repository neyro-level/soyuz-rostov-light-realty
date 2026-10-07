import type { FeatureFlags } from "@/platform/grammar";
import { features as altFeatures } from "../../fixtures/fixture-alt/project/grammar.config";
import { isAltFixture } from "./data.config";

const primaryFeatures = {
  journal: "DISABLED",
  vtorichka: "ON",
  yurist: "ON",
  vacancies: "ON",
  favorites: "DISABLED",
  search: "DISABLED",
  team: "ON",
} as const satisfies FeatureFlags;

export const modules = {
  leads: "ON",
  catalog: "ON",
  journal: "DISABLED",
  analytics: "ON",
  indexNow: "DISABLED",
} as const;

export const features = isAltFixture() ? altFeatures : primaryFeatures;
