import type { FeatureFlags, GrammarConfig } from "./types";

function withTrailingSlash(path: string): string {
  if (path === "/") {
    return "/";
  }
  return path.endsWith("/") ? path : `${path}/`;
}

function knownTokens(config: GrammarConfig): Record<string, string> {
  return {
    geo: config.geo,
    developersSegment: config.developersSegment,
    developmentSegment: config.developmentSegment,
    propertySegment: config.propertySegment,
    objectNamespace: config.objectNamespace,
    teamSegment: config.teamSegment,
  };
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
    return null;
  }
  if (!isFeatureEnabled(flags, route.feature)) {
    return null;
  }
  const merged = {
    ...knownTokens(config),
    ...params,
  };
  return fillTemplate(route.template, merged);
}

export const buildUrl = buildHref;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type MatchedRoute = {
  pageKey: string;
  params: Record<string, string>;
};

function matchTemplate(
  template: string,
  pathname: string,
  config: GrammarConfig,
): Record<string, string> | null {
  const known = knownTokens(config);
  let pattern = "^";
  const names: string[] = [];
  let last = 0;
  const token = /\{([a-zA-Z]+)\}/g;
  let match = token.exec(template);
  while (match) {
    pattern += escapeRegex(template.slice(last, match.index));
    const name = match[1];
    const fixed = known[name];
    if (fixed) {
      pattern += escapeRegex(fixed);
    } else if (name === "publicUrlId") {
      pattern += "([a-z2-7]{5,8})";
      names.push(name);
    } else {
      pattern += "([^/]+)";
      names.push(name);
    }
    last = match.index + match[0].length;
    match = token.exec(template);
  }
  pattern += `${escapeRegex(template.slice(last))}$`;
  const found = pathname.match(new RegExp(pattern));
  if (!found) {
    return null;
  }
  const params: Record<string, string> = {};
  names.forEach((name, index) => {
    params[name] = found[index + 1];
  });
  return params;
}

export function matchPath(
  config: GrammarConfig,
  flags: FeatureFlags,
  pathname: string,
): MatchedRoute | null {
  const path = withTrailingSlash(pathname);
  const routes = [...config.routes].sort(
    (left, right) => right.template.length - left.template.length,
  );
  for (const route of routes) {
    if (!isFeatureEnabled(flags, route.feature)) {
      continue;
    }
    const params = matchTemplate(route.template, path, config);
    if (params) {
      return { pageKey: route.pageKey, params };
    }
  }
  return null;
}

export const parseUrl = matchPath;

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
  const reserved = [
    config.geo,
    config.developersSegment,
    config.developmentSegment,
    config.objectNamespace,
    config.teamSegment,
  ];
  if (config.districts.includes(config.objectNamespace)) {
    throw new Error("objectNamespace collides with district");
  }
  const seenRoots = new Set<string>();
  for (const root of reserved) {
    if (!root) {
      throw new Error("reserved root must be non-empty");
    }
    if (seenRoots.has(root)) {
      throw new Error(`duplicate reserved root ${root}`);
    }
    seenRoots.add(root);
  }
}
