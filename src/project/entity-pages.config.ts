export const H4_ENTITY_PAGE_KEYS = [
  "property",
  "development",
  "developer",
  "agent",
] as const;

export type H4EntityPageKey = (typeof H4_ENTITY_PAGE_KEYS)[number];

export function isH4EntityPageKey(pageKey: string): pageKey is H4EntityPageKey {
  return (H4_ENTITY_PAGE_KEYS as readonly string[]).includes(pageKey);
}
