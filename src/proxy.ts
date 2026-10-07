import { type NextRequest, NextResponse } from "next/server";
import { matchPath } from "@/platform/grammar";
import { lifecycleForMatchedRoute } from "@/platform/lifecycle";
import { legacyLocation, matchLegacy } from "@/platform/seo";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { legacyRules } from "@/project/redirects/legacy";
import { getRealtyRepository } from "@/project/runtime";

function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/media/") ||
    /\.(?:ico|png|jpe?g|webp|gif|svg|woff2?|css|js|map)$/i.test(pathname)
  );
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }
  const rule = matchLegacy(pathname, legacyRules);
  if (rule) {
    if (rule.status === 410) {
      return new NextResponse(null, { status: 410 });
    }
    const location = legacyLocation(rule, grammar, features);
    if (!location) {
      return new NextResponse(null, { status: 410 });
    }
    return NextResponse.redirect(new URL(location, request.url), 308);
  }
  const matched = matchPath(grammar, features, pathname);
  if (!matched) {
    return NextResponse.next();
  }
  const decision = lifecycleForMatchedRoute(
    matched,
    getRealtyRepository(),
    grammar,
    features,
  );
  if (decision?.status === 410) {
    return new NextResponse(null, { status: 410 });
  }
  if (decision?.status === 308 && decision.location) {
    return NextResponse.redirect(new URL(decision.location, request.url), 308);
  }
  return NextResponse.next();
}
