import type {
  AgentCardDTO,
  AgentDetailsDTO,
  DeveloperDTO,
  DevelopmentCardDTO,
  DevelopmentDetailsDTO,
  GeoDTO,
  ProjectContactDTO,
  PropertyCardDTO,
  PropertyDetailsDTO,
} from "./dto";

export type PropertyListQuery = {
  geoSlug?: string;
  developmentUid?: string;
  developerUid?: string;
  dealKind?: string;
};

export type DevelopmentListQuery = {
  geoSlug?: string;
  developerUid?: string;
};

export interface RealtyRepository {
  getProjectContact(): Promise<ProjectContactDTO | null>;
  getGeo(slug: string): Promise<GeoDTO | null>;
  listProperties(query?: PropertyListQuery): Promise<PropertyCardDTO[]>;
  getProperty(publicUrlId: string): Promise<PropertyDetailsDTO | null>;
  listDevelopments(query?: DevelopmentListQuery): Promise<DevelopmentCardDTO[]>;
  getDevelopment(publicUrlId: string): Promise<DevelopmentDetailsDTO | null>;
  listDevelopers(): Promise<DeveloperDTO[]>;
  getDeveloper(slug: string): Promise<DeveloperDTO | null>;
  listAgents(): Promise<AgentCardDTO[]>;
  getAgent(slug: string): Promise<AgentDetailsDTO | null>;
}
