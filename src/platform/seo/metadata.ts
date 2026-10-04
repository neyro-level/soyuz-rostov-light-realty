const PRICE_TOKENS = new Set(["price", "minPrice"]);

export function fillSeoTemplate(
  template: string,
  vars: Record<string, string | undefined>,
  options: { hidePrice?: boolean } = {},
): string {
  const hidePrice = options.hidePrice === true;
  let source = template;
  if (hidePrice) {
    source = source
      .replace(/\s*от\s*\{minPrice\}\s*₽/g, "")
      .replace(/\s*[—–-]\s*\{price\}\s*₽/g, "")
      .replace(/\s*Цена\s*\{price\}\s*₽,?/g, "");
  }
  const filled = source.replace(/\{([^}]+)\}/g, (_match, rawName: string) => {
    const name = rawName.trim();
    if (hidePrice && PRICE_TOKENS.has(name)) {
      return "";
    }
    return vars[name] ?? "";
  });
  return filled
    .replace(/\s+₽/g, "")
    .replace(/\s+м²/g, " м²")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.—–-])/g, "$1")
    .replace(/([,.—–-])\s+(?=[,.—–-]|$)/g, "$1")
    .replace(/\s+\/\s+/g, "/")
    .replace(/[—–-]\s*$/g, "")
    .replace(/^\s*[—–-]\s*/g, "")
    .trim();
}
