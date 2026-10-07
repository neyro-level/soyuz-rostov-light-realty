export type SecurityHeader = { key: string; value: string };

export function createCspNonce(): string {
  return btoa(crypto.randomUUID()).replaceAll("=", "");
}

export function buildSecurityHeaders(options: {
  mediaOrigin?: string;
  analyticsOrigins: string[];
  nonce?: string;
  hsts?: boolean;
}): SecurityHeader[] {
  const extras = options.analyticsOrigins.filter(Boolean);
  const media = options.mediaOrigin ? [options.mediaOrigin] : [];
  const scriptSrc = options.nonce
    ? ["'self'", `'nonce-${options.nonce}'`, ...extras].join(" ")
    : ["'self'", "'unsafe-inline'", ...extras].join(" ");
  const imgSrc = ["'self'", "data:", ...media, ...extras].join(" ");
  const connectSrc = ["'self'", ...media, ...extras].join(" ");
  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `img-src ${imgSrc}`,
    `connect-src ${connectSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  if (csp.includes("*")) {
    throw new Error("wildcard CSP is forbidden");
  }
  const headers: SecurityHeader[] = [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];
  if (options.hsts) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  }
  return headers;
}

export function applySecurityHeaders(
  response: { headers: { set: (key: string, value: string) => void } },
  options: {
    mediaOrigin?: string;
    analyticsOrigins: string[];
    nonce?: string;
    hsts?: boolean;
  },
): void {
  for (const header of buildSecurityHeaders(options)) {
    response.headers.set(header.key, header.value);
  }
}
