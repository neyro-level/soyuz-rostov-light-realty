export type MoneyDTO = {
  amount: string;
  currency: string;
  scale: number;
};

export type MediaRefDTO = {
  src: string;
  alt: string | null;
};

export type ProjectContactDTO = {
  phone: string;
  email: string | null;
  messengers: string[] | null;
  address: string | null;
  hours: string | null;
};

export type GeoDTO = {
  uid: string;
  slug: string;
  name: string;
  precision?: "exact" | "street" | "district" | "city";
};

export type PropertyCardDTO = {
  uid: string;
  publicUrlId: string;
  slug: string;
  title: string;
  rooms: number | null;
  area: number | null;
  price: MoneyDTO | null;
  hidePrice: boolean;
  geoSlug: string | null;
  geoPrecision: "exact" | "street" | "district" | "city" | null;
  developmentPublicUrlId: string | null;
};

export type PropertyDetailsDTO = {
  uid: string;
  publicUrlId: string;
  slug: string;
  title: string;
  rooms: number | null;
  area: number | null;
  floor: number | null;
  floorsTotal: number | null;
  price: MoneyDTO | null;
  hidePrice: boolean;
  description: string | null;
  geo: GeoDTO | null;
  geoPrecision: "exact" | "street" | "district" | "city" | null;
  development: DevelopmentCardDTO | null;
  developer: DeveloperDTO | null;
  agent: AgentCardDTO | null;
  contact: ProjectContactDTO;
  media: MediaRefDTO[];
  lifecycle: string;
};

export type DevelopmentCardDTO = {
  uid: string;
  publicUrlId: string;
  slug: string;
  name: string;
  developerUid: string | null;
  minPrice: MoneyDTO | null;
};

export type DevelopmentDetailsDTO = {
  uid: string;
  publicUrlId: string;
  slug: string;
  name: string;
  description: string | null;
  developer: DeveloperDTO | null;
  geo: GeoDTO | null;
  contact: ProjectContactDTO;
  media: MediaRefDTO[];
  properties: PropertyCardDTO[];
  minPrice: MoneyDTO | null;
  lifecycle: string;
};

export type DeveloperDTO = {
  uid: string;
  slug: string | null;
  name: string;
};

export type AgentCardDTO = {
  uid: string;
  slug: string;
  name: string;
  role: string | null;
  photo: MediaRefDTO | null;
};

export type AgentDetailsDTO = {
  uid: string;
  slug: string;
  name: string;
  role: string | null;
  title: string | null;
  bio: string | null;
  specializations: string[] | null;
  photo: MediaRefDTO | null;
  workPhone: string | null;
  workEmail: string | null;
  lifecycle: string;
};
