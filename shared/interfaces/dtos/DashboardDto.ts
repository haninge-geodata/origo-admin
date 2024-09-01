import { MapInstanceListItemDto } from "./MapInstanceDto";

export interface DashboardDto {
  publishedMaps: number;
  unPublishedMaps: number;
  layers: number;
  sources: number;
  mapInstances: MapInstanceListItemDto[];
  swaggerUri?: string;
}
