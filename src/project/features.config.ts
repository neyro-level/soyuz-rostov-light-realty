import type { FeatureFlags } from "@/platform/grammar";

export const features = {
  journal: "DISABLED",
  vtorichka: "ON",
  yurist: "ON",
  vacancies: "ON",
  favorites: "ON",
  search: "ON",
} as const satisfies FeatureFlags;
