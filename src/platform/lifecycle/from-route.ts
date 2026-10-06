import type { CatalogSnapshot } from "../catalog/entities";
import {
  developmentUrlSlug,
  findDeveloper,
  findDevelopment,
  findProperty,
  propertyUrlParams,
} from "../catalog/entities";
import {
  buildHref,
  type FeatureFlags,
  type GrammarConfig,
  type MatchedRoute,
} from "../grammar";
import { decideEntityLifecycle, type LifecycleDecision } from "./decision";

function catalogFallback(
  grammar: GrammarConfig,
  flags: FeatureFlags,
): string | null {
  return (
    buildHref(grammar, flags, "catNovostroyki") ??
    buildHref(grammar, flags, "home")
  );
}

export function lifecycleForMatchedRoute(
  matched: MatchedRoute,
  snapshot: CatalogSnapshot,
  grammar: GrammarConfig,
  flags: FeatureFlags,
): LifecycleDecision | null {
  if (matched.pageKey === "property") {
    const listing = findProperty(snapshot, matched.params.publicUrlId);
    const canonicalHref = listing
      ? buildHref(grammar, flags, "property", propertyUrlParams(listing))
      : null;
    const development = listing
      ? snapshot.developments.find(
          (item) => item.uid === listing.developmentUid,
        )
      : undefined;
    const redirectHref = development
      ? buildHref(grammar, flags, "development", {
          slug: developmentUrlSlug(development),
        })
      : catalogFallback(grammar, flags);
    return decideEntityLifecycle({
      missing: !listing,
      lifecycle: listing?.lifecycle,
      requestSlug: matched.params.slug,
      canonicalSlug: listing ? propertyUrlParams(listing).slug : undefined,
      slugHistory: listing?.slugHistory,
      canonicalHref,
      redirectHref,
    });
  }
  if (matched.pageKey === "development") {
    const development = findDevelopment(snapshot, matched.params.slug);
    const canonicalHref = development
      ? buildHref(grammar, flags, "development", {
          slug: developmentUrlSlug(development),
        })
      : null;
    return decideEntityLifecycle({
      missing: !development,
      lifecycle: development?.lifecycle,
      requestSlug: matched.params.slug,
      canonicalSlug: development ? developmentUrlSlug(development) : undefined,
      slugHistory: development?.slugHistory,
      canonicalHref,
      redirectHref: catalogFallback(grammar, flags),
    });
  }
  if (matched.pageKey === "developer") {
    const developer = findDeveloper(snapshot, matched.params.slug);
    const canonicalHref = developer
      ? buildHref(grammar, flags, "developer", { slug: developer.slug })
      : null;
    return decideEntityLifecycle({
      missing: !developer,
      requestSlug: matched.params.slug,
      canonicalSlug: developer?.slug,
      canonicalHref,
      redirectHref: buildHref(grammar, flags, "developers"),
    });
  }
  return null;
}
