import type { FeatureFlags } from "@/platform/grammar";
import { features as altFeatures } from "../../fixtures/fixture-alt/project/grammar.config";
import { isAltFixture } from "./data.config";

const primaryFeatures = {
  journal: "DISABLED",
  vtorichka: "ON",
  yurist: "ON",
  vacancies: "ON",
  favorites: "ON",
  search: "ON",
} as const satisfies FeatureFlags;

export const features = isAltFixture() ? altFeatures : primaryFeatures;
