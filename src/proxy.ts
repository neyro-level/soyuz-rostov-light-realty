import { type NextRequest, NextResponse } from "next/server";
import { legacyLocation, matchLegacy } from "@/platform/seo";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { legacyRules } from "@/project/redirects/legacy";

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
  if (!rule) {
    return NextResponse.next();
  }
  if (rule.status === 410) {
    return new NextResponse(null, { status: 410 });
  }
  const location = legacyLocation(rule, grammar, features);
  if (!location) {
    return new NextResponse(null, { status: 410 });
  }
  return NextResponse.redirect(new URL(location, request.url), 308);
}
