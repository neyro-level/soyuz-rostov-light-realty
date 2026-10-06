export type FeatureState = "ON" | "DISABLED";

export type FeatureFlags = {
  journal: FeatureState;
  vtorichka: FeatureState;
  yurist: FeatureState;
  vacancies: FeatureState;
  favorites: FeatureState;
  search: FeatureState;
  team?: FeatureState;
};

export type GrammarRoute = {
  pageKey: string;
  template: string;
  feature?: keyof FeatureFlags;
};

export type GrammarConfig = {
  geoMode: "SINGLE_GEO";
  geo: string;
  categories: string[];
  facets: Record<string, string[]>;
  districts: string[];
  developersSegment: string;
  developmentSegment: string;
  propertySegment: string;
  objectNamespace: string;
  teamSegment: string;
  routes: GrammarRoute[];
};
