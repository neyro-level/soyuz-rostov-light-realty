export type SecurityHeader = { key: string; value: string };

export function buildSecurityHeaders(options: {
  mediaOrigin?: string;
  analyticsOrigins: string[];
}): SecurityHeader[] {
  const extras = options.analyticsOrigins.filter(Boolean);
  const media = options.mediaOrigin ? [options.mediaOrigin] : [];
  const scriptSrc = ["'self'", "'unsafe-inline'", ...extras].join(" ");
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
  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];
}
