import { type NextRequest, NextResponse } from "next/server";
import { legacyLocation, matchLegacy } from "@/platform/seo";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { legacyRules } from "@/project/redirects/legacy";

export function middleware(request: NextRequest) {
  const rule = matchLegacy(request.nextUrl.pathname, legacyRules);
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
  return NextResponse.redirect(new URL(location, request.url), 301);
}

export const config = {
  matcher: [
    "/novostroyki-rostova/:path*",
    "/kvartiry-rostova/:path*",
    "/blog/:path*",
    "/stroitelstvo-domov/:path*",
    "/otzyvy/:path*",
  ],
};
