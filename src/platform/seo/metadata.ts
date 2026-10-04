const PRICE_TOKENS = new Set(["price", "minPrice"]);

function missing(value: string | undefined): boolean {
  return value === undefined || value.trim() === "";
}

export function fillSeoTemplate(
  template: string,
  vars: Record<string, string | undefined>,
  options: { hidePrice?: boolean } = {},
): string {
  const hidePrice = options.hidePrice === true;
  let source = template;
  if (hidePrice) {
    source = source
      .replace(/\s*\u043e\u0442\s*\{minPrice\}\s*\u20BD/g, "")
      .replace(/\s*[—–-]\s*\{price\}\s*\u20BD/g, "")
      .replace(/\s*\u0426\u0435\u043d\u0430\s*\{price\}\s*\u20BD,?/g, "");
  }
  const filled = source.replace(/\{([^}]+)\}/g, (_match, rawName: string) => {
    const name = rawName.trim();
    if (hidePrice && PRICE_TOKENS.has(name)) {
      return "";
    }
    const value = vars[name];
    if (missing(value)) {
      return "";
    }
    return value as string;
  });
  return filled
    .replace(/\s+\u20BD/g, "")
    .replace(/\s+\u043c\u00b2/g, " \u043c\u00b2")
    .replace(
      /\s*\u0441\u0440\u043e\u043a \u0441\u0434\u0430\u0447\u0438\s*/g,
      " ",
    )
    .replace(/\s*\u0440\u0430\u0439\u043e\u043d\s*/g, " ")
    .replace(/\s*\u044d\u0442\u0430\u0436\s*\/\s*/g, " ")
    .replace(/\s*\u043e\u0442\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.—–-])/g, "$1")
    .replace(/([,.—–-])\s+(?=[,.—–-]|$)/g, "$1")
    .replace(/\s+\/\s+/g, "/")
    .replace(/[—–-]\s*$/g, "")
    .replace(/^\s*[—–-]\s*/g, "")
    .trim();
}

export function absoluteCanonical(siteUrl: string, pathname: string): string {
  const base = siteUrl.replace(/\/$/, "");
  if (pathname === "/") {
    return `${base}/`;
  }
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return `${base}${withSlash.startsWith("/") ? withSlash : `/${withSlash}`}`;
}

export function parseRobotsDirective(value: string): {
  index: boolean;
  follow: boolean;
} {
  const normalized = value.toLowerCase().replace(/\s+/g, "");
  if (normalized === "index") {
    return { index: true, follow: true };
  }
  if (normalized === "noindex") {
    return { index: false, follow: true };
  }
  const parts = normalized.split(",");
  return {
    index: !parts.includes("noindex"),
    follow: !parts.includes("nofollow"),
  };
}
