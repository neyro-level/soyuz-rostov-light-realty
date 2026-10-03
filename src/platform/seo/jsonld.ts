export const ALLOWED_JSON_LD_TYPES = [
  "RealEstateAgent",
  "PostalAddress",
  "BreadcrumbList",
  "ListItem",
] as const;

export const FORBIDDEN_JSON_LD_TYPES = ["AggregateRating", "Review"] as const;

export type AgentJsonLdInput = {
  name: string;
  url: string;
  telephone: string;
  email: string;
  address: string;
  openingHours: string;
};

export function buildRealEstateAgentJsonLd(input: AgentJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: input.name,
    url: input.url,
    telephone: input.telephone,
    email: input.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: input.address,
    },
    openingHours: input.openingHours,
  };
}

export function buildBreadcrumbListJsonLd(
  items: Array<{ name: string; item: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function jsonLdHasForbiddenType(payload: unknown): boolean {
  const text = JSON.stringify(payload);
  return FORBIDDEN_JSON_LD_TYPES.some((type) => text.includes(`"${type}"`));
}
