import { type NextRequest, NextResponse } from "next/server";
import { matchPath } from "@/platform/grammar";
import { lifecycleForMatchedRoute } from "@/platform/lifecycle";
import { applySecurityHeaders, createCspNonce } from "@/platform/security";
import { legacyLocation, matchLegacy } from "@/platform/seo";
import { analytics } from "@/project/analytics.config";
import { features } from "@/project/features.config";
import { grammar } from "@/project/grammar.config";
import { media } from "@/project/media.config";
import { legacyRules } from "@/project/redirects/legacy";
import { getRealtyRepository } from "@/project/runtime";

function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/media/") ||
    /\.(?:ico|png|jpe?g|webp|gif|svg|woff2?|css|js|map)$/i.test(pathname)
  );
}

function asciiLowerPath(pathname: string): string {
  return pathname.replace(/[A-Z]/g, (char) => char.toLowerCase());
}

function withSecurity(response: NextResponse, nonce: string): NextResponse {
  applySecurityHeaders(response, {
    mediaOrigin: media.origin,
    analyticsOrigins: analytics.origins,
    nonce,
    hsts: process.env.APP_ENV === "production",
  });
  response.headers.set("x-nonce", nonce);
  return response;
}

function nextWithNonce(request: NextRequest, nonce: string): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  return withSecurity(
    NextResponse.next({ request: { headers: requestHeaders } }),
    nonce,
  );
}

export function resolvePublicLocation(
  pathname: string,
): { status: 308; location: string } | { status: 410 } | null {
  let current = pathname;
  let finalLocation: string | null = null;
  for (let hop = 0; hop < 4; hop += 1) {
    const rule = matchLegacy(current, legacyRules);
    if (rule) {
      if (rule.status === 410) {
        return { status: 410 };
      }
      const location = legacyLocation(rule, grammar, features);
      if (!location) {
        return { status: 410 };
      }
      finalLocation = location;
      current = location;
      continue;
    }
    const matched = matchPath(grammar, features, current);
    if (!matched) {
      break;
    }
    const decision = lifecycleForMatchedRoute(
      matched,
      getRealtyRepository(),
      grammar,
      features,
    );
    if (decision?.status === 410) {
      return { status: 410 };
    }
    if (decision?.status === 308 && decision.location) {
      finalLocation = decision.location;
      current = decision.location;
      continue;
    }
    break;
  }
  if (finalLocation && finalLocation !== pathname) {
    return { status: 308, location: finalLocation };
  }
  return null;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const nonce = createCspNonce();
  if (isStaticPath(pathname)) {
    return nextWithNonce(request, nonce);
  }
  const lowered = asciiLowerPath(pathname);
  if (lowered !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = lowered;
    return withSecurity(NextResponse.redirect(url, 308), nonce);
  }
  const resolved = resolvePublicLocation(pathname);
  if (resolved?.status === 410) {
    return withSecurity(new NextResponse(null, { status: 410 }), nonce);
  }
  if (resolved?.status === 308) {
    return withSecurity(
      NextResponse.redirect(new URL(resolved.location, request.url), 308),
      nonce,
    );
  }
  return nextWithNonce(request, nonce);
}
