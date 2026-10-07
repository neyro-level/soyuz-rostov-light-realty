import type { PublicInventoryDto } from "../hub/contract";
import { isPubliclyListed, normalizeLifecycle } from "../lifecycle";
import type {
  AgentCardDTO,
  AgentDetailsDTO,
  DeveloperDTO,
  DevelopmentCardDTO,
  DevelopmentDetailsDTO,
  GeoDTO,
  MediaRefDTO,
  MoneyDTO,
  ProjectContactDTO,
  PropertyCardDTO,
  PropertyDetailsDTO,
} from "./dto";
import {
  type CatalogSnapshot,
  developerOf,
  developmentOf,
  developmentUrlSlug,
  findDeveloper,
  findDevelopment,
  findProperty,
  loadCatalogSnapshot,
  roomsOf,
} from "./entities";
import { loadFixtureJson } from "./local";
import type {
  DevelopmentListQuery,
  PropertyListQuery,
  RealtyRepository,
} from "./repository";

type GeoRecord = { uid: string; name: string };
type AgentRecord = {
  uid: string;
  slug?: string;
  displayName: string;
  lifecycle?: string;
};
type ContactRecord = {
  phone: string;
  email?: string;
  messengers?: string[];
  addressPublic?: string;
  hours?: string;
};

function money(price?: {
  amount: string;
  currency: string;
  scale: number;
}): MoneyDTO | null {
  if (!price) {
    return null;
  }
  return {
    amount: price.amount,
    currency: price.currency,
    scale: price.scale,
  };
}

function areaOf(listing: PublicInventoryDto): number | null {
  return "totalAreaM2" in listing.facts &&
    typeof listing.facts.totalAreaM2 === "number"
    ? listing.facts.totalAreaM2
    : null;
}

function floorOf(listing: PublicInventoryDto): number | null {
  return "floor" in listing.facts && typeof listing.facts.floor === "number"
    ? listing.facts.floor
    : null;
}

function floorsTotalOf(listing: PublicInventoryDto): number | null {
  return "floorsTotal" in listing.facts &&
    typeof listing.facts.floorsTotal === "number"
    ? listing.facts.floorsTotal
    : null;
}

function mediaOf(listing: PublicInventoryDto): MediaRefDTO[] {
  return listing.media
    .filter((item) => Boolean(item.url))
    .map((item) => ({ src: item.url as string, alt: null }));
}

export class SnapshotRepository implements RealtyRepository {
  constructor(
    private readonly snapshot: CatalogSnapshot,
    private readonly geos: GeoDTO[],
    private readonly agents: AgentRecord[],
    private readonly contact: ProjectContactDTO | null,
  ) {}

  /** Catalog view for SEO, lifecycle, and sitemap (same revision as repository reads). */
  catalogSnapshot(): CatalogSnapshot {
    return this.snapshot;
  }

  static fromRevisionDir(
    root: string,
    revisionDir: string,
  ): SnapshotRepository {
    const snapshot = loadCatalogSnapshot(root, revisionDir);
    const geos = loadFixtureJson<GeoRecord[]>(
      root,
      revisionDir,
      "geo.json",
    ).map((item) => ({
      uid: item.uid,
      slug: item.uid,
      name: item.name,
    }));
    const agents = loadFixtureJson<AgentRecord[]>(
      root,
      revisionDir,
      "agents.json",
    );
    const contacts = loadFixtureJson<ContactRecord[]>(
      root,
      revisionDir,
      "contacts.json",
    );
    const raw = contacts[0];
    const contact: ProjectContactDTO | null = raw
      ? {
          phone: raw.phone,
          email: raw.email ?? null,
          messengers: raw.messengers ?? null,
          address: raw.addressPublic ?? null,
          hours: raw.hours ?? null,
        }
      : null;
    return new SnapshotRepository(snapshot, geos, agents, contact);
  }

  async getProjectContact(): Promise<ProjectContactDTO | null> {
    return this.contact;
  }

  async getGeo(slug: string): Promise<GeoDTO | null> {
    return this.geos.find((item) => item.slug === slug) ?? null;
  }

  async listProperties(query?: PropertyListQuery): Promise<PropertyCardDTO[]> {
    return this.snapshot.inventory
      .filter((item) => {
        if (query?.dealKind && item.dealKind !== query.dealKind) {
          return false;
        }
        if (
          query?.developmentUid &&
          item.developmentUid !== query.developmentUid
        ) {
          return false;
        }
        const development = developmentOf(this.snapshot, item);
        if (
          query?.developerUid &&
          development?.developerUid !== query.developerUid
        ) {
          return false;
        }
        return isPubliclyListed(item.lifecycle);
      })
      .map((item) => this.toPropertyCard(item));
  }

  async getProperty(publicUrlId: string): Promise<PropertyDetailsDTO | null> {
    const listing = findProperty(this.snapshot, publicUrlId);
    if (!listing) {
      return null;
    }
    const development = developmentOf(this.snapshot, listing);
    const developer = developerOf(this.snapshot, development);
    const agent = listing.agentUid
      ? this.agents.find((item) => item.uid === listing.agentUid)
      : undefined;
    const contact = this.contact ?? {
      phone: "",
      email: null,
      messengers: null,
      address: null,
      hours: null,
    };
    return {
      uid: listing.uid,
      publicUrlId: listing.publicUrlId,
      slug: listing.slug || listing.publicUrlId,
      title: this.propertyTitle(listing),
      rooms: roomsOf(listing),
      area: areaOf(listing),
      floor: floorOf(listing),
      floorsTotal: floorsTotalOf(listing),
      price: money(listing.price),
      hidePrice: false,
      description:
        listing.descriptionText ?? listing.descriptionHtmlSafe ?? null,
      geo: null,
      development: development ? this.toDevelopmentCard(development) : null,
      developer: developer ? this.toDeveloper(developer) : null,
      agent: agent ? this.toAgentCard(agent) : null,
      contact,
      media: mediaOf(listing),
      lifecycle: normalizeLifecycle(listing.lifecycle),
    };
  }

  async listDevelopments(
    query?: DevelopmentListQuery,
  ): Promise<DevelopmentCardDTO[]> {
    return this.snapshot.developments
      .filter((item) => {
        if (query?.developerUid && item.developerUid !== query.developerUid) {
          return false;
        }
        return Boolean(item.publicUrlId) && isPubliclyListed(item.lifecycle);
      })
      .map((item) => this.toDevelopmentCard(item));
  }

  async getDevelopment(
    publicUrlId: string,
  ): Promise<DevelopmentDetailsDTO | null> {
    const development = findDevelopment(this.snapshot, publicUrlId);
    if (!development?.publicUrlId) {
      return null;
    }
    const developer = developerOf(this.snapshot, development);
    const contact = this.contact ?? {
      phone: "",
      email: null,
      messengers: null,
      address: null,
      hours: null,
    };
    const properties = this.snapshot.inventory
      .filter((item) => item.developmentUid === development.uid)
      .map((item) => this.toPropertyCard(item));
    return {
      uid: development.uid,
      publicUrlId: development.publicUrlId,
      slug: developmentUrlSlug(development),
      name: development.name,
      description: null,
      developer: developer ? this.toDeveloper(developer) : null,
      geo: null,
      contact,
      media: [],
      properties,
      lifecycle: normalizeLifecycle(development.lifecycle),
    };
  }

  async listDevelopers(): Promise<DeveloperDTO[]> {
    return this.snapshot.developers.map((item) => this.toDeveloper(item));
  }

  async getDeveloper(slug: string): Promise<DeveloperDTO | null> {
    const developer = findDeveloper(this.snapshot, slug);
    return developer ? this.toDeveloper(developer) : null;
  }

  async listAgents(): Promise<AgentCardDTO[]> {
    return this.agents.map((item) => this.toAgentCard(item));
  }

  async getAgent(slug: string): Promise<AgentDetailsDTO | null> {
    const agent = this.agents.find((item) => (item.slug ?? item.uid) === slug);
    if (!agent) {
      return null;
    }
    return {
      uid: agent.uid,
      slug: agent.slug ?? agent.uid,
      name: agent.displayName,
      role: null,
      title: null,
      bio: null,
      specializations: null,
      photo: null,
      workPhone: null,
      workEmail: null,
      lifecycle: normalizeLifecycle(agent.lifecycle),
    };
  }

  private propertyTitle(listing: PublicInventoryDto): string {
    return developmentOf(this.snapshot, listing)?.name ?? listing.addressPublic;
  }

  private toPropertyCard(listing: PublicInventoryDto): PropertyCardDTO {
    const development = developmentOf(this.snapshot, listing);
    return {
      uid: listing.uid,
      publicUrlId: listing.publicUrlId,
      slug: listing.slug || listing.publicUrlId,
      title: this.propertyTitle(listing),
      rooms: roomsOf(listing),
      area: areaOf(listing),
      price: money(listing.price),
      hidePrice: false,
      geoSlug: null,
      developmentPublicUrlId: development?.publicUrlId ?? null,
    };
  }

  private toDevelopmentCard(
    development: CatalogSnapshot["developments"][number],
  ): DevelopmentCardDTO {
    const prices = this.snapshot.inventory
      .filter((item) => item.developmentUid === development.uid && item.price)
      .map((item) => item.price as MoneyDTO);
    const minPrice =
      prices.length === 0
        ? null
        : prices.reduce((lowest, item) =>
            Number(item.amount) < Number(lowest.amount) ? item : lowest,
          );
    return {
      uid: development.uid,
      publicUrlId: development.publicUrlId ?? development.uid,
      slug: developmentUrlSlug(development),
      name: development.name,
      developerUid: development.developerUid ?? null,
      minPrice,
    };
  }

  private toDeveloper(
    developer: CatalogSnapshot["developers"][number],
  ): DeveloperDTO {
    return {
      uid: developer.uid,
      slug: developer.slug,
      name: developer.name,
    };
  }

  private toAgentCard(agent: AgentRecord): AgentCardDTO {
    return {
      uid: agent.uid,
      slug: agent.slug ?? agent.uid,
      name: agent.displayName,
      role: null,
      photo: null,
    };
  }
}
