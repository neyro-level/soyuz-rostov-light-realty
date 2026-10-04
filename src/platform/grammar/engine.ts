import type { FeatureFlags, GrammarConfig } from "./types";

function withTrailingSlash(path: string): string {
  if (path === "/") {
    return "/";
  }
  return path.endsWith("/") ? path : `${path}/`;
}

export function fillTemplate(
  template: string,
  params: Record<string, string>,
): string {
  const filled = template.replace(
    /\{([a-zA-Z]+)\}/g,
    (_match, name: string) => {
      const value = params[name];
      if (!value) {
        throw new Error(`missing grammar param ${name}`);
      }
      return value;
    },
  );
  return withTrailingSlash(filled);
}

export function isFeatureEnabled(
  flags: FeatureFlags,
  feature?: keyof FeatureFlags,
): boolean {
  if (!feature) {
    return true;
  }
  return flags[feature] === "ON";
}

export function buildHref(
  config: GrammarConfig,
  flags: FeatureFlags,
  pageKey: string,
  params: Record<string, string> = {},
): string | null {
  const route = config.routes.find((item) => item.pageKey === pageKey);
  if (!route) {
    throw new Error(`unknown pageKey ${pageKey}`);
  }
  if (!isFeatureEnabled(flags, route.feature)) {
    return null;
  }
  const merged = {
    geo: config.geo,
    developersSegment: config.developersSegment,
    developmentSegment: config.developmentSegment,
    propertySegment: config.propertySegment,
    ...params,
  };
  return fillTemplate(route.template, merged);
}

export function assertNoCollisions(config: GrammarConfig): void {
  const pageKeys = new Set<string>();
  const templates = new Set<string>();
  for (const route of config.routes) {
    if (pageKeys.has(route.pageKey)) {
      throw new Error(`duplicate pageKey ${route.pageKey}`);
    }
    pageKeys.add(route.pageKey);
    if (templates.has(route.template)) {
      throw new Error(`duplicate template ${route.template}`);
    }
    templates.add(route.template);
  }
  const districts = new Set<string>();
  for (const district of config.districts) {
    if (districts.has(district)) {
      throw new Error(`duplicate district ${district}`);
    }
    if (config.categories.includes(district)) {
      throw new Error(`district collides with category ${district}`);
    }
    districts.add(district);
  }
  const categories = new Set<string>();
  for (const category of config.categories) {
    if (categories.has(category)) {
      throw new Error(`duplicate category ${category}`);
    }
    categories.add(category);
  }
}
